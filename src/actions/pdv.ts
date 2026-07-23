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
  const itens = itensRaw
    ? (
        JSON.parse(itensRaw as string) as {
          produtoId: string;
          quantidade: string;
          precoUnitario: string;
        }[]
      )
        .map((item) => ({
          produtoId: item.produtoId,
          quantidade: Number(item.quantidade),
          precoUnitario: Number(item.precoUnitario),
        }))
        .filter(
          (item) =>
            item.produtoId && item.quantidade > 0 && item.precoUnitario >= 0
        )
    : [];

  if (itens.length === 0) {
    throw new Error("Adicione ao menos um item à venda.");
  }

  await assertClientePertenceAoTenant(dados.clienteId, session.user.tenantId);
  if (dados.petId) {
    await assertPetPertenceAoTenant(dados.petId, session.user.tenantId);
  }

  const valorTotal = itens.reduce(
    (soma, item) => soma + item.quantidade * item.precoUnitario,
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
    }
  });

  revalidatePath("/pdv");
  revalidatePath("/estoque");
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  redirect("/financeiro");
}
