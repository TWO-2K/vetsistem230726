import { prisma } from "@/lib/prisma";
import { FORMA_PAGAMENTO_LABEL, TIPO_PRONTUARIO_LABEL } from "@/lib/labels";
import { FormaPagamento, TipoProntuario } from "@/generated/prisma/client";

export async function getRelatorioFinanceiro(
  tenantId: string,
  inicio: Date,
  fim: Date
) {
  const cobrancas = await prisma.cobranca.findMany({
    where: {
      tenantId,
      status: "PAGO",
      dataPagamento: { gte: inicio, lte: fim },
    },
    include: { cliente: true },
    orderBy: { dataPagamento: "asc" },
  });

  const total = cobrancas.reduce((soma, c) => soma + c.valor, 0);

  const totalPorForma = Object.fromEntries(
    Object.keys(FORMA_PAGAMENTO_LABEL).map((forma) => [
      forma,
      cobrancas
        .filter((c) => c.formaPagamento === forma)
        .reduce((soma, c) => soma + c.valor, 0),
    ])
  ) as Record<FormaPagamento, number>;

  return { cobrancas, total, totalPorForma };
}

export async function getRelatorioAtendimentos(
  tenantId: string,
  inicio: Date,
  fim: Date,
  usuarioId?: string
) {
  const prontuarios = await prisma.prontuario.findMany({
    where: {
      tenantId,
      data: { gte: inicio, lte: fim },
      ...(usuarioId ? { usuarioId } : {}),
    },
    include: { pet: { include: { cliente: true } }, usuario: true },
    orderBy: { data: "asc" },
  });

  const porVeterinario = new Map<string, number>();
  const porTipo = Object.fromEntries(
    Object.keys(TIPO_PRONTUARIO_LABEL).map((tipo) => [tipo, 0])
  ) as Record<TipoProntuario, number>;

  for (const p of prontuarios) {
    porVeterinario.set(p.usuario.nome, (porVeterinario.get(p.usuario.nome) ?? 0) + 1);
    porTipo[p.tipo] += 1;
  }

  return { prontuarios, porVeterinario, porTipo };
}

export async function getRelatorioComissoes(
  tenantId: string,
  inicio: Date,
  fim: Date,
  profissionalId?: string
) {
  const itens = await prisma.cobrancaServico.findMany({
    where: {
      tenantId,
      ...(profissionalId ? { profissionalId } : {}),
      cobranca: {
        status: "PAGO",
        dataPagamento: { gte: inicio, lte: fim },
      },
    },
    include: { servico: true, profissional: true, cobranca: true },
    orderBy: { criadoEm: "asc" },
  });

  const total = itens.reduce((soma, i) => soma + i.valorComissao, 0);

  const porProfissional = new Map<string, { nome: string; total: number }>();
  for (const item of itens) {
    const atual = porProfissional.get(item.profissionalId) ?? {
      nome: item.profissional.nome,
      total: 0,
    };
    atual.total += item.valorComissao;
    porProfissional.set(item.profissionalId, atual);
  }

  return { itens, total, porProfissional };
}

export async function getClientesInativos(tenantId: string, diasInativo: number) {
  const clientes = await prisma.cliente.findMany({
    where: { tenantId },
    include: {
      pets: { include: { prontuarios: { select: { data: true } } } },
      agendamentos: { select: { dataHora: true } },
    },
    orderBy: { nome: "asc" },
  });

  const hoje = new Date();
  const corte = new Date(hoje);
  corte.setDate(corte.getDate() - diasInativo);

  const comUltimaAtividade = clientes.map((cliente) => {
    const datas = [
      ...cliente.pets.flatMap((pet) => pet.prontuarios.map((p) => p.data)),
      ...cliente.agendamentos.map((a) => a.dataHora),
    ];
    const ultimaAtividade =
      datas.length > 0
        ? new Date(Math.max(...datas.map((d) => d.getTime())))
        : null;
    return { cliente, ultimaAtividade };
  });

  return comUltimaAtividade
    .filter(({ ultimaAtividade }) => !ultimaAtividade || ultimaAtividade < corte)
    .sort((a, b) => {
      if (!a.ultimaAtividade) return -1;
      if (!b.ultimaAtividade) return 1;
      return a.ultimaAtividade.getTime() - b.ultimaAtividade.getTime();
    });
}
