"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { produtoSchema, movimentoEstoqueSchema } from "@/lib/validations";
import { Papel } from "@/generated/prisma/client";

function parseProduto(formData: FormData) {
  return produtoSchema.parse({
    nome: formData.get("nome"),
    categoria: formData.get("categoria") ?? "",
    unidadeMedida: formData.get("unidadeMedida"),
    quantidadeMinima: formData.get("quantidadeMinima") ?? "",
    precoCusto: formData.get("precoCusto") ?? "",
    precoVenda: formData.get("precoVenda") ?? "",
  });
}

export async function criarProduto(formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);
  const dados = parseProduto(formData);
  const quantidadeInicial = Number(formData.get("quantidadeInicial") || 0);

  await prisma.$transaction(async (tx) => {
    const produto = await tx.produto.create({
      data: {
        tenantId: session.user.tenantId,
        nome: dados.nome,
        categoria: dados.categoria || null,
        unidadeMedida: dados.unidadeMedida,
        quantidadeMinima: Number(dados.quantidadeMinima || 0),
        precoCusto: dados.precoCusto ? Number(dados.precoCusto) : null,
        precoVenda: dados.precoVenda ? Number(dados.precoVenda) : null,
      },
    });

    if (quantidadeInicial > 0) {
      await tx.movimentoEstoque.create({
        data: {
          tenantId: session.user.tenantId,
          produtoId: produto.id,
          usuarioId: session.user.id,
          tipo: "ENTRADA",
          quantidade: quantidadeInicial,
          observacoes: "Estoque inicial",
        },
      });
      await tx.produto.update({
        where: { id: produto.id },
        data: { quantidadeAtual: { increment: quantidadeInicial } },
      });
    }
  });

  revalidatePath("/estoque");
  redirect("/estoque");
}

export async function atualizarProduto(produtoId: string, formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);
  const dados = parseProduto(formData);

  await prisma.produto.update({
    where: { id: produtoId, tenantId: session.user.tenantId },
    data: {
      nome: dados.nome,
      categoria: dados.categoria || null,
      unidadeMedida: dados.unidadeMedida,
      quantidadeMinima: Number(dados.quantidadeMinima || 0),
      precoCusto: dados.precoCusto ? Number(dados.precoCusto) : null,
      precoVenda: dados.precoVenda ? Number(dados.precoVenda) : null,
    },
  });

  revalidatePath("/estoque");
  revalidatePath(`/estoque/${produtoId}`);
  redirect(`/estoque/${produtoId}`);
}

export async function desativarProduto(produtoId: string) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);

  await prisma.produto.update({
    where: { id: produtoId, tenantId: session.user.tenantId },
    data: { ativo: false },
  });

  revalidatePath("/estoque");
  revalidatePath(`/estoque/${produtoId}`);
}

export async function ativarProduto(produtoId: string) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);

  await prisma.produto.update({
    where: { id: produtoId, tenantId: session.user.tenantId },
    data: { ativo: true },
  });

  revalidatePath("/estoque");
  revalidatePath(`/estoque/${produtoId}`);
}

export async function registrarMovimentoEstoque(formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);
  const dados = movimentoEstoqueSchema.parse({
    produtoId: formData.get("produtoId"),
    tipo: formData.get("tipo"),
    quantidade: formData.get("quantidade"),
    observacoes: formData.get("observacoes") ?? "",
  });

  const valor = Number(dados.quantidade);
  if (!valor) {
    throw new Error("Informe uma quantidade válida.");
  }

  await prisma.$transaction(async (tx) => {
    const produto = await tx.produto.findUnique({
      where: { id: dados.produtoId, tenantId: session.user.tenantId },
    });
    if (!produto) {
      throw new Error("Produto não encontrado.");
    }

    const delta =
      dados.tipo === "SAIDA"
        ? -Math.abs(valor)
        : dados.tipo === "ENTRADA"
          ? Math.abs(valor)
          : valor;

    const novaQuantidade = produto.quantidadeAtual + delta;
    if (novaQuantidade < 0) {
      throw new Error(
        `Estoque insuficiente para "${produto.nome}". Disponível: ${produto.quantidadeAtual} ${produto.unidadeMedida}.`
      );
    }

    await tx.movimentoEstoque.create({
      data: {
        tenantId: session.user.tenantId,
        produtoId: produto.id,
        usuarioId: session.user.id,
        tipo: dados.tipo,
        quantidade: delta,
        observacoes: dados.observacoes || null,
      },
    });
    await tx.produto.update({
      where: { id: produto.id },
      data: { quantidadeAtual: novaQuantidade },
    });
  });

  revalidatePath("/estoque");
  revalidatePath(`/estoque/${dados.produtoId}`);
}
