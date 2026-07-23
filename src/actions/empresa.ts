"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { empresaPerfilSchema } from "@/lib/validations";
import { Papel } from "@/generated/prisma/client";

const TAMANHO_MAXIMO_LOGO = 2 * 1024 * 1024; // 2MB

export async function atualizarPerfilEmpresa(formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN]);

  const dados = empresaPerfilSchema.parse({
    nome: formData.get("nome"),
    cnpj: formData.get("cnpj") ?? "",
    telefone: formData.get("telefone") ?? "",
    email: formData.get("email") ?? "",
    endereco: formData.get("endereco") ?? "",
    horarioInicio: formData.get("horarioInicio"),
    horarioFim: formData.get("horarioFim"),
    diasFuncionamento: formData.getAll("diasFuncionamento"),
  });

  let logoUrl: string | undefined;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    if (logo.size > TAMANHO_MAXIMO_LOGO) {
      throw new Error("A logo deve ter no máximo 2MB.");
    }
    const buffer = Buffer.from(await logo.arrayBuffer());
    logoUrl = `data:${logo.type};base64,${buffer.toString("base64")}`;
  }
  const removerLogo = formData.get("removerLogo") === "true";

  await prisma.tenant.update({
    where: { id: session.user.tenantId },
    data: {
      nome: dados.nome,
      cnpj: dados.cnpj || null,
      telefone: dados.telefone || null,
      email: dados.email || null,
      endereco: dados.endereco || null,
      horarioInicio: dados.horarioInicio,
      horarioFim: dados.horarioFim,
      diasFuncionamento: dados.diasFuncionamento,
      ...(logoUrl ? { logoUrl } : removerLogo ? { logoUrl: null } : {}),
    },
  });

  revalidatePath("/empresa");
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}
