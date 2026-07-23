"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { petSchema } from "@/lib/validations";
import { assertClientePertenceAoTenant } from "@/lib/tenant-guard";

function parsePet(formData: FormData) {
  return petSchema.parse({
    clienteId: formData.get("clienteId"),
    nome: formData.get("nome"),
    especie: formData.get("especie"),
    raca: formData.get("raca") ?? "",
    sexo: formData.get("sexo") ?? "",
    dataNascimento: formData.get("dataNascimento") ?? "",
    peso: formData.get("peso") ?? "",
    observacoes: formData.get("observacoes") ?? "",
  });
}

export async function criarPet(formData: FormData) {
  const session = await requireSession();
  const dados = parsePet(formData);
  await assertClientePertenceAoTenant(dados.clienteId, session.user.tenantId);

  const pet = await prisma.pet.create({
    data: {
      tenantId: session.user.tenantId,
      clienteId: dados.clienteId,
      nome: dados.nome,
      especie: dados.especie,
      raca: dados.raca || null,
      sexo: dados.sexo || null,
      dataNascimento: dados.dataNascimento
        ? new Date(dados.dataNascimento)
        : null,
      peso: dados.peso ? Number(dados.peso) : null,
      observacoes: dados.observacoes || null,
    },
  });

  revalidatePath(`/clientes/${dados.clienteId}`);
  redirect(`/pets/${pet.id}`);
}

export async function atualizarPet(petId: string, formData: FormData) {
  const session = await requireSession();
  const dados = parsePet(formData);

  await prisma.pet.update({
    where: { id: petId, tenantId: session.user.tenantId },
    data: {
      nome: dados.nome,
      especie: dados.especie,
      raca: dados.raca || null,
      sexo: dados.sexo || null,
      dataNascimento: dados.dataNascimento
        ? new Date(dados.dataNascimento)
        : null,
      peso: dados.peso ? Number(dados.peso) : null,
      observacoes: dados.observacoes || null,
    },
  });

  revalidatePath(`/clientes/${dados.clienteId}`);
  revalidatePath(`/pets/${petId}`);
  redirect(`/pets/${petId}`);
}

export async function excluirPet(petId: string, clienteId: string) {
  const session = await requireSession();

  const [prontuarios, agendamentos, internacoes, vacinas, cobrancas] = await Promise.all([
    prisma.prontuario.count({ where: { petId, tenantId: session.user.tenantId } }),
    prisma.agendamento.count({ where: { petId, tenantId: session.user.tenantId } }),
    prisma.internacao.count({ where: { petId, tenantId: session.user.tenantId } }),
    prisma.vacina.count({ where: { petId, tenantId: session.user.tenantId } }),
    prisma.cobranca.count({ where: { petId, tenantId: session.user.tenantId } }),
  ]);

  if (prontuarios + agendamentos + internacoes + vacinas + cobrancas > 0) {
    throw new Error(
      "Não é possível excluir este pet pois há registros vinculados (prontuários, agendamentos, internações, vacinas ou cobranças)."
    );
  }

  await prisma.pet.delete({
    where: { id: petId, tenantId: session.user.tenantId },
  });

  revalidatePath(`/clientes/${clienteId}`);
  redirect(`/clientes/${clienteId}`);
}
