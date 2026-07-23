"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { cobrancaSchema, pagamentoSchema } from "@/lib/validations";
import { Papel } from "@/generated/prisma/client";
import { assertClientePertenceAoTenant, assertPetPertenceAoTenant } from "@/lib/tenant-guard";

export async function criarCobranca(formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN, Papel.RECEPCAO]);
  const dados = cobrancaSchema.parse({
    clienteId: formData.get("clienteId"),
    petId: formData.get("petId") ?? "",
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
    dataVencimento: formData.get("dataVencimento") ?? "",
    observacoes: formData.get("observacoes") ?? "",
    servicoId: formData.get("servicoId") ?? "",
    profissionalId: formData.get("profissionalId") ?? "",
  });

  await assertClientePertenceAoTenant(dados.clienteId, session.user.tenantId);
  if (dados.petId) {
    await assertPetPertenceAoTenant(dados.petId, session.user.tenantId);
  }

  const valor = Number(dados.valor);

  await prisma.$transaction(async (tx) => {
    const cobranca = await tx.cobranca.create({
      data: {
        tenantId: session.user.tenantId,
        clienteId: dados.clienteId,
        petId: dados.petId || null,
        usuarioId: session.user.id,
        descricao: dados.descricao,
        valor,
        dataVencimento: dados.dataVencimento ? new Date(dados.dataVencimento) : null,
        observacoes: dados.observacoes || null,
      },
    });

    if (dados.servicoId && dados.profissionalId) {
      const servico = await tx.servico.findUnique({
        where: { id: dados.servicoId, tenantId: session.user.tenantId },
      });
      if (!servico) {
        throw new Error("Serviço não encontrado.");
      }

      await tx.cobrancaServico.create({
        data: {
          tenantId: session.user.tenantId,
          cobrancaId: cobranca.id,
          servicoId: servico.id,
          profissionalId: dados.profissionalId,
          valor,
          percentualComissao: servico.percentualComissao,
          valorComissao: (valor * servico.percentualComissao) / 100,
        },
      });
    }
  });

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  revalidatePath("/comissoes");
  redirect("/financeiro");
}

export async function marcarComoPago(formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN, Papel.RECEPCAO]);
  const dados = pagamentoSchema.parse({
    cobrancaId: formData.get("cobrancaId"),
    formaPagamento: formData.get("formaPagamento"),
  });

  await prisma.cobranca.update({
    where: { id: dados.cobrancaId, tenantId: session.user.tenantId },
    data: {
      status: "PAGO",
      formaPagamento: dados.formaPagamento,
      dataPagamento: new Date(),
    },
  });

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  revalidatePath("/comissoes");
}

export async function cancelarCobranca(cobrancaId: string) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN, Papel.RECEPCAO]);

  await prisma.cobranca.update({
    where: { id: cobrancaId, tenantId: session.user.tenantId },
    data: { status: "CANCELADO" },
  });

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}
