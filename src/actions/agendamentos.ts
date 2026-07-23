"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { agendamentoSchema } from "@/lib/validations";
import { StatusAgendamento } from "@/generated/prisma/client";
import { assertClientePertenceAoTenant, assertPetPertenceAoTenant } from "@/lib/tenant-guard";

export async function criarAgendamento(formData: FormData) {
  const session = await requireSession();
  const dados = agendamentoSchema.parse({
    clienteId: formData.get("clienteId"),
    petId: formData.get("petId"),
    dataHora: formData.get("dataHora"),
    servico: formData.get("servico"),
    observacoes: formData.get("observacoes") ?? "",
  });

  await assertClientePertenceAoTenant(dados.clienteId, session.user.tenantId);
  await assertPetPertenceAoTenant(dados.petId, session.user.tenantId);

  await prisma.agendamento.create({
    data: {
      tenantId: session.user.tenantId,
      clienteId: dados.clienteId,
      petId: dados.petId,
      usuarioId: session.user.id,
      dataHora: new Date(dados.dataHora),
      servico: dados.servico,
      observacoes: dados.observacoes || null,
    },
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  redirect("/agenda");
}

export async function atualizarStatusAgendamento(
  agendamentoId: string,
  status: StatusAgendamento
) {
  const session = await requireSession();

  await prisma.agendamento.update({
    where: { id: agendamentoId, tenantId: session.user.tenantId },
    data: { status },
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}
