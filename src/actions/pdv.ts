"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { vendaPdvSchema } from "@/lib/validations";
import { Papel } from "@/generated/prisma/client";
import { assertClientePertenceAoTenant, assertPetPertenceAoTenant } from "@/lib/tenant-guard";

export async function registrarVendaPdv(formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN, Papel.RECEPCAO]);

  const dados = vendaPdvSchema.parse({
    clienteId: formData.get("clienteId"),
    petId: formData.get("petId") ?? "",
    formaPagamento: formData.get("formaPagamento"),
  });

  const itensRaw = formData.get("itensVenda");
  type ItemProduto = {
    tipo: "produto";
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
  };
  type ItemServico = {
    tipo: "servico";
    servicoId: string;
    profissionalId: string;
    precoUnitario: number;
  };

  const itensBrutos = itensRaw
    ? (JSON.parse(itensRaw as string) as Array<
        | { tipo: "produto"; produtoId: string; quantidade: string; precoUnitario: string }
        | { tipo: "servico"; servicoId: string; profissionalId: string; precoUnitario: string }
      >)
    : [];

  const itens = itensBrutos
    .map((item): ItemProduto | ItemServico | null => {
      if (item.tipo === "produto") {
        return {
          tipo: "produto",
          produtoId: item.produtoId,
          quantidade: Number(item.quantidade),
          precoUnitario: Number(item.precoUnitario),
        };
      }
      return {
        tipo: "servico",
        servicoId: item.servicoId,
        profissionalId: item.profissionalId,
        precoUnitario: Number(item.precoUnitario),
      };
    })
    .filter((item): item is ItemProduto | ItemServico => {
      if (!item) return false;
      if (item.tipo === "produto") {
        return Boolean(item.produtoId) && item.quantidade > 0 && item.precoUnitario >= 0;
      }
      return Boolean(item.servicoId) && Boolean(item.profissionalId) && item.precoUnitario >= 0;
    });

  if (itens.length === 0) {
    throw new Error("Adicione ao menos um item à venda.");
  }

  await assertClientePertenceAoTenant(dados.clienteId, session.user.tenantId);
  if (dados.petId) {
    await assertPetPertenceAoTenant(dados.petId, session.user.tenantId);
  }

  const valorTotal = itens.reduce(
    (soma, item) =>
      soma + (item.tipo === "produto" ? item.quantidade : 1) * item.precoUnitario,
    0
  );

  await prisma.$transaction(async (tx) => {
    const cobranca = await tx.cobranca.create({
      data: {
        tenantId: session.user.tenantId,
        clienteId: dados.clienteId,
        petId: dados.petId || null,
        usuarioId: session.user.id,
        descricao: `Venda PDV — ${itens.length} ${itens.length === 1 ? "item" : "itens"}`,
        valor: valorTotal,
        formaPagamento: dados.formaPagamento,
        status: "PAGO",
        dataPagamento: new Date(),
      },
    });

    for (const item of itens) {
      if (item.tipo === "produto") {
        const produto = await tx.produto.findUnique({
          where: { id: item.produtoId, tenantId: session.user.tenantId },
        });
        if (!produto) {
          throw new Error("Produto não encontrado.");
        }

        const novaQuantidade = produto.quantidadeAtual - item.quantidade;
        if (novaQuantidade < 0) {
          throw new Error(
            `Estoque insuficiente para "${produto.nome}". Disponível: ${produto.quantidadeAtual} ${produto.unidadeMedida}.`
          );
        }

        await tx.movimentoEstoque.create({
          data: {
            tenantId: session.user.tenantId,
            produtoId: produto.id,
            cobrancaId: cobranca.id,
            usuarioId: session.user.id,
            tipo: "SAIDA",
            quantidade: -item.quantidade,
            observacoes: "Baixa automática de venda PDV",
          },
        });
        await tx.produto.update({
          where: { id: produto.id },
          data: { quantidadeAtual: novaQuantidade },
        });
      } else {
        const servico = await tx.servico.findUnique({
          where: { id: item.servicoId, tenantId: session.user.tenantId },
        });
        if (!servico) {
          throw new Error("Serviço não encontrado.");
        }

        await tx.cobrancaServico.create({
          data: {
            tenantId: session.user.tenantId,
            cobrancaId: cobranca.id,
            servicoId: servico.id,
            profissionalId: item.profissionalId,
            valor: item.precoUnitario,
            percentualComissao: servico.percentualComissao,
            valorComissao: (item.precoUnitario * servico.percentualComissao) / 100,
          },
        });
      }
    }
  });

  revalidatePath("/pdv");
  revalidatePath("/estoque");
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  revalidatePath("/comissoes");
  redirect("/financeiro");
}
