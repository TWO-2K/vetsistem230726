"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { requireSuperAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { empresaSchema, empresaAdminSchema, planoSchema } from "@/lib/validations";

export async function criarEmpresa(formData: FormData) {
  await requireSuperAdminSession();

  const dadosEmpresa = empresaSchema.parse({
    nome: formData.get("nome"),
    planoId: formData.get("planoId") ?? "",
  });
  const dadosAdmin = empresaAdminSchema.parse({
    nomeAdmin: formData.get("nomeAdmin"),
    emailAdmin: formData.get("emailAdmin"),
    senhaAdmin: formData.get("senhaAdmin"),
  });

  const senhaHash = await bcrypt.hash(dadosAdmin.senhaAdmin, 10);

  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        nome: dadosEmpresa.nome,
        planoId: dadosEmpresa.planoId || null,
      },
    });

    await tx.usuario.create({
      data: {
        tenantId: tenant.id,
        nome: dadosAdmin.nomeAdmin,
        email: dadosAdmin.emailAdmin,
        senhaHash,
        papel: "ADMIN",
      },
    });
  });

  revalidatePath("/admin/empresas");
  redirect("/admin/empresas");
}

export async function atualizarEmpresa(tenantId: string, formData: FormData) {
  await requireSuperAdminSession();

  const dados = empresaSchema.parse({
    nome: formData.get("nome"),
    planoId: formData.get("planoId") ?? "",
  });

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      nome: dados.nome,
      planoId: dados.planoId || null,
    },
  });

  revalidatePath("/admin/empresas");
  revalidatePath(`/admin/empresas/${tenantId}`);
}

export async function suspenderEmpresa(tenantId: string) {
  await requireSuperAdminSession();

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { status: "SUSPENSO" },
  });

  revalidatePath("/admin/empresas");
  revalidatePath(`/admin/empresas/${tenantId}`);
}

export async function ativarEmpresa(tenantId: string) {
  await requireSuperAdminSession();

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { status: "ATIVO" },
  });

  revalidatePath("/admin/empresas");
  revalidatePath(`/admin/empresas/${tenantId}`);
}

export async function criarPlano(formData: FormData) {
  await requireSuperAdminSession();

  const dados = planoSchema.parse({
    nome: formData.get("nome"),
    limiteUsuarios: formData.get("limiteUsuarios") ?? "",
    descricaoRecursos: formData.get("descricaoRecursos") ?? "",
    precoReferencia: formData.get("precoReferencia") ?? "",
  });

  await prisma.plano.create({
    data: {
      nome: dados.nome,
      limiteUsuarios: dados.limiteUsuarios ? Number(dados.limiteUsuarios) : null,
      descricaoRecursos: dados.descricaoRecursos || null,
      precoReferencia: dados.precoReferencia ? Number(dados.precoReferencia) : null,
    },
  });

  revalidatePath("/admin/planos");
  redirect("/admin/planos");
}

export async function atualizarPlano(planoId: string, formData: FormData) {
  await requireSuperAdminSession();

  const dados = planoSchema.parse({
    nome: formData.get("nome"),
    limiteUsuarios: formData.get("limiteUsuarios") ?? "",
    descricaoRecursos: formData.get("descricaoRecursos") ?? "",
    precoReferencia: formData.get("precoReferencia") ?? "",
  });

  await prisma.plano.update({
    where: { id: planoId },
    data: {
      nome: dados.nome,
      limiteUsuarios: dados.limiteUsuarios ? Number(dados.limiteUsuarios) : null,
      descricaoRecursos: dados.descricaoRecursos || null,
      precoReferencia: dados.precoReferencia ? Number(dados.precoReferencia) : null,
    },
  });

  revalidatePath("/admin/planos");
  redirect("/admin/planos");
}

export async function excluirPlano(planoId: string) {
  await requireSuperAdminSession();

  const tenantsVinculados = await prisma.tenant.count({ where: { planoId } });
  if (tenantsVinculados > 0) {
    throw new Error(
      "Não é possível excluir este plano pois há empresas vinculadas a ele."
    );
  }

  await prisma.plano.delete({ where: { id: planoId } });

  revalidatePath("/admin/planos");
}
