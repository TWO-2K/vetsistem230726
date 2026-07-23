"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { prontuarioSchema } from "@/lib/validations";
import { Papel } from "@/generated/prisma/client";
import { assertPetPertenceAoTenant } from "@/lib/tenant-guard";

export async function criarProntuario(formData: FormData) {
  const session = await requireSession();
  requireRole(session.user.papel, [Papel.ADMIN, Papel.VET]);
  const dados = prontuarioSchema.parse({
    petId: formData.get("petId"),
    tipo: formData.get("tipo"),
    anamnese: formData.get("anamnese") ?? "",
    diagnostico: formData.get("diagnostico") ?? "",
    prescricao: formData.get("prescricao") ?? "",
    observacoes: formData.get("observacoes") ?? "",
  });

  await assertPetPertenceAoTenant(dados.petId, session.user.tenantId);

  const itensRaw = formData.get("itensEstoque");
  const itens: { produtoId: string; quantidade: number }[] = itensRaw
    ? (
        JSON.parse(itensRaw as string) as {
          produtoId: string;
          quantidade: string;
        }[]
      )
        .map((item) => ({
          produtoId: item.produtoId,
          quantidade: Number(item.quantidade),
        }))
        .filter((item) => item.produtoId && item.quantidade > 0)
    : [];

  await prisma.$transaction(async (tx) => {
    const criado = await tx.prontuario.create({
      data: {
        tenantId: session.user.tenantId,
        petId: dados.petId,
        usuarioId: session.user.id,
        tipo: dados.tipo,
        anamnese: dados.anamnese || null,
        diagnostico: dados.diagnostico || null,
        prescricao: dados.prescricao || null,
        observacoes: dados.observacoes || null,
      },
    });

    for (const item of itens) {
      const produto = await tx.produto.findUnique({
        where: { id: item.produtoId, tenantId: session.user.tenantId },
      });
      if (!produto) {
        throw new Error("Produto do estoque não encontrado.");
      }

      const novaQuantidade = produto.quantidadeAtual - item.quantidade;
      if (novaQuantidade < 0) {
        throw new Error(
          `Estoque insuficiente para "${produto.nome}". Disponível: ${produto.quantidadeAtual} ${produto.unidadeMedida}.`
        );
      }

      await tx.movimentoEstoque.create({
        data: {
          tenantId: session.user.tenantId,
          produtoId: produto.id,
          prontuarioId: criado.id,
          usuarioId: session.user.id,
          tipo: "SAIDA",
          quantidade: -item.quantidade,
          observacoes: "Baixa automática de atendimento",
        },
      });
      await tx.produto.update({
        where: { id: produto.id },
        data: { quantidadeAtual: novaQuantidade },
      });
    }
  });

  revalidatePath(`/pets/${dados.petId}`);
  revalidatePath("/estoque");
}
