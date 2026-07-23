"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { requireSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { funcionarioSchema } from "@/lib/validations";
import { Papel } from "@/generated/prisma/client";

function parseFuncionario(formData: FormData) {
  return funcionarioSchema.parse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    papel: formData.get("papel"),
    senha: formData.get("senha") ?? "",
  });
}

export async function criarFuncionario(formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);
  const dados = parseFuncionario(formData);

  if (!dados.senha) {
    throw new Error("Informe uma senha para o novo funcionário.");
  }

  const senhaHash = await bcrypt.hash(dados.senha, 10);

  await prisma.usuario.create({
    data: {
      tenantId: session.user.tenantId,
      nome: dados.nome,
      email: dados.email,
      senhaHash,
      papel: dados.papel,
    },
  });

  revalidatePath("/funcionarios");
  redirect("/funcionarios");
}

export async function atualizarFuncionario(funcionarioId: string, formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);
  const dados = parseFuncionario(formData);

  await prisma.usuario.update({
    where: { id: funcionarioId, tenantId: session.user.tenantId },
    data: {
      nome: dados.nome,
      email: dados.email,
      papel: dados.papel,
      ...(dados.senha ? { senhaHash: await bcrypt.hash(dados.senha, 10) } : {}),
    },
  });

  revalidatePath("/funcionarios");
  redirect("/funcionarios");
}

export async function excluirFuncionario(funcionarioId: string) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);

  if (funcionarioId === session.user.id) {
    throw new Error("Você não pode excluir seu próprio usuário.");
  }

  const [prontuarios, agendamentos, internacoes, evolucoes, vacinas, cobrancas] = await Promise.all([
    prisma.prontuario.count({ where: { usuarioId: funcionarioId, tenantId: session.user.tenantId } }),
    prisma.agendamento.count({ where: { usuarioId: funcionarioId, tenantId: session.user.tenantId } }),
    prisma.internacao.count({ where: { usuarioId: funcionarioId, tenantId: session.user.tenantId } }),
    prisma.internacaoEvolucao.count({ where: { usuarioId: funcionarioId, tenantId: session.user.tenantId } }),
    prisma.vacina.count({ where: { usuarioId: funcionarioId, tenantId: session.user.tenantId } }),
    prisma.cobranca.count({ where: { usuarioId: funcionarioId, tenantId: session.user.tenantId } }),
  ]);

  if (prontuarios + agendamentos + internacoes + evolucoes + vacinas + cobrancas > 0) {
    throw new Error(
      "Não é possível excluir este funcionário pois há registros vinculados (prontuários, agendamentos, internações, vacinas ou cobranças) associados a ele."
    );
  }

  await prisma.usuario.delete({
    where: { id: funcionarioId, tenantId: session.user.tenantId },
  });

  revalidatePath("/funcionarios");
  redirect("/funcionarios");
}

export async function desativarFuncionario(funcionarioId: string) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);

  if (funcionarioId === session.user.id) {
    throw new Error("Você não pode desativar seu próprio usuário.");
  }

  await prisma.usuario.update({
    where: { id: funcionarioId, tenantId: session.user.tenantId },
    data: { ativo: false },
  });

  revalidatePath("/funcionarios");
}

export async function ativarFuncionario(funcionarioId: string) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);

  await prisma.usuario.update({
    where: { id: funcionarioId, tenantId: session.user.tenantId },
    data: { ativo: true },
  });

  revalidatePath("/funcionarios");
}
