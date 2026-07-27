"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { agendamentoSchema } from "@/lib/validations";
import { StatusAgendamento } from "@/generated/prisma/client";
import {
  assertClientePertenceAoTenant,
  assertPetPertenceAoTenant,
  assertUsuarioPertenceAoTenant,
} from "@/lib/tenant-guard";

export async function assertDentroDoExpediente(tenantId: string, dataHora: Date) {
  const empresa = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: { horarioInicio: true, horarioFim: true, diasFuncionamento: true },
  });

  if (!empresa.diasFuncionamento.includes(dataHora.getDay())) {
    throw new Error("A clínica não funciona nesse dia da semana.");
  }

  const horaMinuto = `${String(dataHora.getHours()).padStart(2, "0")}:${String(
    dataHora.getMinutes()
  ).padStart(2, "0")}`;
  if (horaMinuto < empresa.horarioInicio || horaMinuto >= empresa.horarioFim) {
    throw new Error(
      `Horário fora do expediente da clínica (${empresa.horarioInicio} às ${empresa.horarioFim}).`
    );
  }
}

export type EstadoAgendamento =
  | { error: string; requireConfirm?: boolean }
  | undefined;

async function buscarConflitosAgendamento(
  tenantId: string,
  usuarioId: string,
  clienteId: string,
  petId: string,
  dataHora: Date
) {
  const [conflitoVeterinario, conflitoClientePet] = await Promise.all([
    prisma.agendamento.findFirst({
      where: {
        tenantId,
        usuarioId,
        dataHora,
        status: { not: StatusAgendamento.CANCELADO },
      },
    }),
    prisma.agendamento.findFirst({
      where: {
        tenantId,
        dataHora,
        status: { not: StatusAgendamento.CANCELADO },
        OR: [{ clienteId }, { petId }],
      },
    }),
  ]);

  return {
    conflitoVeterinario: Boolean(conflitoVeterinario),
    conflitoClientePet: Boolean(conflitoClientePet),
  };
}

export async function criarAgendamento(
  _prevState: EstadoAgendamento,
  formData: FormData
): Promise<EstadoAgendamento> {
  const session = await requireSession();
  const dados = agendamentoSchema.parse({
    clienteId: formData.get("clienteId"),
    petId: formData.get("petId"),
    usuarioId: formData.get("usuarioId"),
    dataHora: formData.get("dataHora"),
    servico: formData.get("servico"),
    servicoId: formData.get("servicoId") ?? "",
    observacoes: formData.get("observacoes") ?? "",
  });

  await assertClientePertenceAoTenant(dados.clienteId, session.user.tenantId);
  await assertPetPertenceAoTenant(dados.petId, session.user.tenantId);
  await assertDentroDoExpediente(session.user.tenantId, new Date(dados.dataHora));
  await assertUsuarioPertenceAoTenant(dados.usuarioId, session.user.tenantId);

  const { conflitoVeterinario, conflitoClientePet } =
    await buscarConflitosAgendamento(
      session.user.tenantId,
      dados.usuarioId,
      dados.clienteId,
      dados.petId,
      new Date(dados.dataHora)
    );

  if (conflitoVeterinario) {
    return {
      error: "Este veterinário já tem outro agendamento neste horário.",
    };
  }

  if (conflitoClientePet && formData.get("confirmarConflito") !== "true") {
    return {
      error: "Este cliente/pet já tem outro agendamento neste horário.",
      requireConfirm: true,
    };
  }

  await prisma.agendamento.create({
    data: {
      tenantId: session.user.tenantId,
      clienteId: dados.clienteId,
      petId: dados.petId,
      usuarioId: dados.usuarioId,
      dataHora: new Date(dados.dataHora),
      servico: dados.servico,
      servicoId: dados.servicoId || null,
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
