"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { clienteSchema } from "@/lib/validations";

function parseCliente(formData: FormData) {
  return clienteSchema.parse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email") ?? "",
    cpf: formData.get("cpf") ?? "",
    endereco: formData.get("endereco") ?? "",
  });
}

export async function criarCliente(formData: FormData) {
  const session = await requireSession();
  const dados = parseCliente(formData);

  const cliente = await prisma.cliente.create({
    data: {
      tenantId: session.user.tenantId,
      nome: dados.nome,
      telefone: dados.telefone,
      email: dados.email || null,
      cpf: dados.cpf || null,
      endereco: dados.endereco || null,
    },
  });

  revalidatePath("/clientes");
  redirect(`/clientes/${cliente.id}`);
}

export async function atualizarCliente(clienteId: string, formData: FormData) {
  const session = await requireSession();
  const dados = parseCliente(formData);

  await prisma.cliente.update({
    where: { id: clienteId, tenantId: session.user.tenantId },
    data: {
      nome: dados.nome,
      telefone: dados.telefone,
      email: dados.email || null,
      cpf: dados.cpf || null,
      endereco: dados.endereco || null,
    },
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${clienteId}`);
  redirect(`/clientes/${clienteId}`);
}

export async function excluirCliente(clienteId: string) {
  const session = await requireSession();

  const [pets, agendamentos, cobrancas] = await Promise.all([
    prisma.pet.count({ where: { clienteId, tenantId: session.user.tenantId } }),
    prisma.agendamento.count({ where: { clienteId, tenantId: session.user.tenantId } }),
    prisma.cobranca.count({ where: { clienteId, tenantId: session.user.tenantId } }),
  ]);

  if (pets + agendamentos + cobrancas > 0) {
    throw new Error(
      "Não é possível excluir este cliente pois há pets, agendamentos ou cobranças vinculados a ele."
    );
  }

  await prisma.cliente.delete({
    where: { id: clienteId, tenantId: session.user.tenantId },
  });

  revalidatePath("/clientes");
  redirect("/clientes");
}
