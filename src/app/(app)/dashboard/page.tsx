import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PawPrint, CalendarDays, Plus, Syringe, AlertTriangle } from "lucide-react";
import {
  STATUS_COLOR,
  STATUS_BORDER,
  STATUS_VACINA_LABEL,
  STATUS_VACINA_COLOR,
  getStatusVacina,
} from "@/lib/labels";
import { podeGerenciarEstoque } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireSession();
  const tenantId = session.user.tenantId;
  const podeEstoque = podeGerenciarEstoque(session.user.papel);

  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);
  const fimHoje = new Date();
  fimHoje.setHours(23, 59, 59, 999);

  const em7Dias = new Date();
  em7Dias.setDate(em7Dias.getDate() + 7);
  em7Dias.setHours(23, 59, 59, 999);

  const [totalClientes, totalPets, agendamentosHoje, vacinasAVencer, produtosAtivos] =
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
      podeEstoque
        ? prisma.produto.findMany({ where: { tenantId, ativo: true } })
        : Promise.resolve([]),
    ]);

  const produtosBaixoEstoque = produtosAtivos.filter(
    (p) => p.quantidadeAtual < p.quantidadeMinima
  );

  const kpis: Array<{
    label: string;
    value: string;
    icon: typeof Users;
    tone: "primary" | "accent" | "info" | "warning" | "danger";
    href: string;
  }> = [
    { label: "Clientes", value: String(totalClientes), icon: Users, tone: "primary", href: "/clientes" },
    { label: "Pets", value: String(totalPets), icon: PawPrint, tone: "info", href: "/pets" },
    {
      label: "Atendimentos hoje",
      value: String(agendamentosHoje.length),
      icon: CalendarDays,
      tone: "primary",
      href: "/agenda",
    },
    {
      label: "Vacinas a vencer",
      value: String(vacinasAVencer.length),
      icon: Syringe,
      tone: "warning",
      href: "/vacinas",
    },
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href} className="block">
            <Card className="shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-2">
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
              <div className="flex flex-col gap-2">
                {agendamentosHoje.map((ag) => (
                  <div
                    key={ag.id}
                    className={cn(
                      "rounded-md border-l-[3px] px-3 py-1.5 text-sm font-semibold",
                      STATUS_COLOR[ag.status],
                      STATUS_BORDER[ag.status]
                    )}
                  >
                    <span className="block font-mono text-[11px] font-bold opacity-85">
                      {ag.dataHora.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {ag.pet.nome} · {ag.servico}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {vacinasAVencer.length > 0 && (
          <Card className="shadow-sm border-warning/40 border-t-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="h-4 w-4 text-warning" />
                Vacinas a vencer
              </CardTitle>
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
          <Card className="shadow-sm border-danger/40 border-t-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-danger" />
                Estoque baixo
              </CardTitle>
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
