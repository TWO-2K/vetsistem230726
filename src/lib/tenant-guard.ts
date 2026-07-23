import { prisma } from "@/lib/prisma";

async function assertPertenceAoTenant(
  model: "cliente" | "pet" | "internacao",
  id: string,
  tenantId: string,
  mensagem: string
) {
  const registro = await prisma[model].findUnique({
    where: { id, tenantId },
    select: { id: true },
  });
  if (!registro) {
    throw new Error(mensagem);
  }
}

export function assertClientePertenceAoTenant(id: string, tenantId: string) {
  return assertPertenceAoTenant("cliente", id, tenantId, "Cliente não encontrado.");
}

export function assertPetPertenceAoTenant(id: string, tenantId: string) {
  return assertPertenceAoTenant("pet", id, tenantId, "Pet não encontrado.");
}

export function assertInternacaoPertenceAoTenant(id: string, tenantId: string) {
  return assertPertenceAoTenant("internacao", id, tenantId, "Internação não encontrada.");
}
