import { prisma } from "@/lib/prisma";

async function assertExiste(
  registro: { id: string } | null,
  mensagem: string
) {
  if (!registro) {
    throw new Error(mensagem);
  }
}

export async function assertClientePertenceAoTenant(id: string, tenantId: string) {
  const registro = await prisma.cliente.findUnique({
    where: { id, tenantId },
    select: { id: true },
  });
  await assertExiste(registro, "Cliente não encontrado.");
}

export async function assertPetPertenceAoTenant(id: string, tenantId: string) {
  const registro = await prisma.pet.findUnique({
    where: { id, tenantId },
    select: { id: true },
  });
  await assertExiste(registro, "Pet não encontrado.");
}

export async function assertInternacaoPertenceAoTenant(id: string, tenantId: string) {
  const registro = await prisma.internacao.findUnique({
    where: { id, tenantId },
    select: { id: true },
  });
  await assertExiste(registro, "Internação não encontrada.");
}
