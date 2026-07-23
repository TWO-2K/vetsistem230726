"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { vacinaSchema } from "@/lib/validations";
import { Papel } from "@/generated/prisma/client";
import { assertPetPertenceAoTenant } from "@/lib/tenant-guard";

export async function criarVacina(formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN, Papel.VET]);
  const dados = vacinaSchema.parse({
    petId: formData.get("petId"),
    nome: formData.get("nome"),
    dataAplicacao: formData.get("dataAplicacao"),
    proximaDose: formData.get("proximaDose") ?? "",
    observacoes: formData.get("observacoes") ?? "",
  });

  await assertPetPertenceAoTenant(dados.petId, session.user.tenantId);

  await prisma.vacina.create({
    data: {
      tenantId: session.user.tenantId,
      petId: dados.petId,
      usuarioId: session.user.id,
      nome: dados.nome,
      dataAplicacao: new Date(dados.dataAplicacao),
      proximaDose: dados.proximaDose ? new Date(dados.proximaDose) : null,
      observacoes: dados.observacoes || null,
    },
  });

  revalidatePath(`/pets/${dados.petId}`);
  revalidatePath("/vacinas");
  revalidatePath("/dashboard");
}
