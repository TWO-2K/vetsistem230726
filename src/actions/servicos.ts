"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { servicoSchema } from "@/lib/validations";
import { Papel } from "@/generated/prisma/client";

function parseServico(formData: FormData) {
  return servicoSchema.parse({
    nome: formData.get("nome"),
    precoPadrao: formData.get("precoPadrao"),
    percentualComissao: formData.get("percentualComissao") ?? "",
  });
}

export async function criarServico(formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);
  const dados = parseServico(formData);

  await prisma.servico.create({
    data: {
      tenantId: session.user.tenantId,
      nome: dados.nome,
      precoPadrao: Number(dados.precoPadrao),
      percentualComissao: dados.percentualComissao ? Number(dados.percentualComissao) : 0,
    },
  });

  revalidatePath("/servicos");
  redirect("/servicos");
}

export async function atualizarServico(servicoId: string, formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);
  const dados = parseServico(formData);

  await prisma.servico.update({
    where: { id: servicoId, tenantId: session.user.tenantId },
    data: {
      nome: dados.nome,
      precoPadrao: Number(dados.precoPadrao),
      percentualComissao: dados.percentualComissao ? Number(dados.percentualComissao) : 0,
    },
  });

  revalidatePath("/servicos");
  revalidatePath(`/servicos/${servicoId}`);
  redirect("/servicos");
}

export async function desativarServico(servicoId: string) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);

  await prisma.servico.update({
    where: { id: servicoId, tenantId: session.user.tenantId },
    data: { ativo: false },
  });

  revalidatePath("/servicos");
}

export async function ativarServico(servicoId: string) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);

  await prisma.servico.update({
    where: { id: servicoId, tenantId: session.user.tenantId },
    data: { ativo: true },
  });

  revalidatePath("/servicos");
}
