import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PawPrint, CalendarDays, Plus, Syringe, Wallet, Package } from "lucide-react";
import {
  STATUS_LABEL,
  STATUS_COLOR,
  STATUS_VACINA_LABEL,
  STATUS_VACINA_COLOR,
  getStatusVacina,
} from "@/lib/labels";
import { podeGerenciarFinanceiro, podeGerenciarEstoque } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireSession();
  const tenantId = session.user.tenantId;
  const podeFinanceiro = podeGerenciarFinanceiro(session.user.papel);
  const podeEstoque = podeGerenciarEstoque(session.user.papel);

  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);
  const fimHoje = new Date();
  fimHoje.setHours(23, 59, 59, 999);

  const em7Dias = new Date();
  em7Dias.setDate(em7Dias.getDate() + 7);
  em7Dias.setHours(23, 59, 59, 999);

  const [totalClientes, totalPets, agendamentosHoje, vacinasAVencer, cobrancasPendentes, produtosAtivos] =
    await Promise.all([
      prisma.cliente.count({ where: { tenantId } }),
      prisma.pet.count({ where: { tenantId } }),
      prisma.agendamento.findMany({
        where: { tenantId, dataHora: { gte: inicioHoje, lte: fimHoje } },
        include: { pet: true, cliente: true },
        orderBy: { dataHora: "asc" },
      }),
      prisma.vacina.findMany({
        where: { tenantId, proximaDose: { lte: em7Dias } },
        include: { pet: { include: { cliente: true } } },
        orderBy: { proximaDose: "asc" },
      }),
      podeFinanceiro
        ? prisma.cobranca.findMany({ where: { tenantId, status: "PENDENTE" } })
        : Promise.resolve([]),
      podeEstoque
        ? prisma.produto.findMany({ where: { tenantId, ativo: true } })
        : Promise.resolve([]),
    ]);

  const totalPendente = cobrancasPendentes.reduce((soma, c) => soma + c.valor, 0);
  const produtosBaixoEstoque = produtosAtivos.filter(
    (p) => p.quantidadeAtual < p.quantidadeMinima
  );

  const kpis: Array<{
    label: string;
    value: string;
    icon: typeof Users;
    tone: "primary" | "accent" | "info" | "warning" | "danger";
  }> = [
    { label: "Clientes", value: String(totalClientes), icon: Users, tone: "primary" },
    { label: "Pets", value: String(totalPets), icon: PawPrint, tone: "info" },
    {
      label: "Atendimentos hoje",
      value: String(agendamentosHoje.length),
      icon: CalendarDays,
      tone: "primary",
    },
    {
      label: "Vacinas a vencer",
      value: String(vacinasAVencer.length),
      icon: Syringe,
      tone: "warning",
    },
    ...(podeFinanceiro
      ? [
          {
            label: "A receber",
            value: totalPendente.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
            icon: Wallet,
            tone: "accent" as const,
          },
        ]
      : []),
    ...(podeEstoque
      ? [
          {
            label: "Estoque baixo",
            value: String(produtosBaixoEstoque.length),
            icon: Package,
            tone: "danger" as const,
          },
        ]
      : []),
  ];

  const toneClasses: Record<
    "primary" | "accent" | "info" | "warning" | "danger",
    string
  > = {
    primary: "bg-primary-subtle text-primary",
    accent: "bg-brand-accent-subtle text-brand-accent",
    info: "bg-info-subtle text-info",
    warning: "bg-warning-subtle text-warning",
    danger: "bg-danger-subtle text-danger",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-text">
            Dashboard
          </h1>
          <p className="text-text-secondary">Visão geral da clínica hoje.</p>
        </div>
        <div className="flex gap-2">
          <Button
            render={<Link href="/clientes/novo" />}
            nativeButton={false}
            variant="outline"
          >
            <Plus className="h-4 w-4" /> Cliente
          </Button>
          <Button render={<Link href="/agenda/novo" />} nativeButton={false}>
            <Plus className="h-4 w-4" /> Agendamento
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                {kpi.label}
              </CardTitle>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  toneClasses[kpi.tone]
                )}
              >
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="font-display text-3xl font-semibold tracking-tight text-text">
              {kpi.value}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Agenda de hoje</CardTitle>
          </CardHeader>
          <CardContent>
            {agendamentosHoje.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-text-tertiary">
                <CalendarDays className="h-7 w-7" />
                <p className="text-sm">Nenhum atendimento agendado para hoje.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {agendamentosHoje.map((ag) => (
                  <div
                    key={ag.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-text">
                        {ag.pet.nome}{" "}
                        <span className="text-text-tertiary">
                          · {ag.cliente.nome}
                        </span>
                      </p>
                      <p className="font-mono text-sm text-text-secondary">
                        {ag.servico} ·{" "}
                        {ag.dataHora.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        STATUS_COLOR[ag.status]
                      )}
                    >
                      {STATUS_LABEL[ag.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {vacinasAVencer.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Vacinas a vencer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {vacinasAVencer.map((vacina) => {
                  const status = getStatusVacina(vacina.proximaDose);
                  return (
                    <Link
                      key={vacina.id}
                      href={`/pets/${vacina.pet.id}`}
                      className="flex items-center justify-between rounded-md py-3 first:pt-0 last:pb-0 hover:bg-bg-sunken"
                    >
                      <div>
                        <p className="font-medium text-text">
                          {vacina.pet.nome}{" "}
                          <span className="text-text-tertiary">
                            · {vacina.pet.cliente.nome}
                          </span>
                        </p>
                        <p className="font-mono text-sm text-text-secondary">
                          {vacina.nome} · Próxima dose em{" "}
                          {vacina.proximaDose?.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      {status && (
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            STATUS_VACINA_COLOR[status]
                          )}
                        >
                          {STATUS_VACINA_LABEL[status]}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {podeEstoque && produtosBaixoEstoque.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Estoque baixo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {produtosBaixoEstoque.map((produto) => (
                  <Link
                    key={produto.id}
                    href={`/estoque/${produto.id}`}
                    className="flex items-center justify-between rounded-md py-3 first:pt-0 last:pb-0 hover:bg-bg-sunken"
                  >
                    <p className="font-medium text-text">{produto.nome}</p>
                    <span className="rounded-full bg-danger-subtle px-2.5 py-1 font-mono text-xs font-medium text-danger">
                      {produto.quantidadeAtual} / {produto.quantidadeMinima} {produto.unidadeMedida}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
