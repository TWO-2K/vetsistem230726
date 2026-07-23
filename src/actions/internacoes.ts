"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { internacaoSchema, evolucaoSchema } from "@/lib/validations";
import { Papel } from "@/generated/prisma/client";
import { assertPetPertenceAoTenant, assertInternacaoPertenceAoTenant } from "@/lib/tenant-guard";

export async function criarInternacao(formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN, Papel.VET]);
  const dados = internacaoSchema.parse({
    petId: formData.get("petId"),
    motivo: formData.get("motivo"),
    observacoes: formData.get("observacoes") ?? "",
  });

  await assertPetPertenceAoTenant(dados.petId, session.user.tenantId);

  const internacao = await prisma.internacao.create({
    data: {
      tenantId: session.user.tenantId,
      petId: dados.petId,
      usuarioId: session.user.id,
      motivo: dados.motivo,
      observacoes: dados.observacoes || null,
    },
  });

  revalidatePath(`/pets/${dados.petId}`);
  revalidatePath("/internacoes");
  redirect(`/internacoes/${internacao.id}`);
}

export async function adicionarEvolucao(formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN, Papel.VET]);
  const dados = evolucaoSchema.parse({
    internacaoId: formData.get("internacaoId"),
    texto: formData.get("texto"),
  });

  await assertInternacaoPertenceAoTenant(dados.internacaoId, session.user.tenantId);

  await prisma.internacaoEvolucao.create({
    data: {
      tenantId: session.user.tenantId,
      internacaoId: dados.internacaoId,
      usuarioId: session.user.id,
      texto: dados.texto,
    },
  });

  revalidatePath(`/internacoes/${dados.internacaoId}`);
}

export async function darAlta(internacaoId: string, petId: string) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN, Papel.VET]);

  await prisma.internacao.update({
    where: { id: internacaoId, tenantId: session.user.tenantId },
    data: { status: "ALTA", dataAlta: new Date() },
  });

  revalidatePath(`/internacoes/${internacaoId}`);
  revalidatePath("/internacoes");
  revalidatePath(`/pets/${petId}`);
}
