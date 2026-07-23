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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da clínica hoje.
          </p>
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

      <div
        className={cn(
          "grid gap-4",
          podeFinanceiro && podeEstoque
            ? "sm:grid-cols-6"
            : podeFinanceiro || podeEstoque
              ? "sm:grid-cols-5"
              : "sm:grid-cols-4"
        )}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="font-display text-3xl font-extrabold tracking-tight">
            {totalClientes}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pets
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
              <PawPrint className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="font-display text-3xl font-extrabold tracking-tight">
            {totalPets}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Atendimentos hoje
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <CalendarDays className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="font-display text-3xl font-extrabold tracking-tight">
            {agendamentosHoje.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vacinas a vencer
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
              <Syringe className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="font-display text-3xl font-extrabold tracking-tight">
            {vacinasAVencer.length}
          </CardContent>
        </Card>
        {podeFinanceiro && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                A receber
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                <Wallet className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="font-display text-3xl font-extrabold tracking-tight">
              {totalPendente.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </CardContent>
          </Card>
        )}
        {podeEstoque && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estoque baixo
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                <Package className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="font-display text-3xl font-extrabold tracking-tight">
              {produtosBaixoEstoque.length}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {agendamentosHoje.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum atendimento agendado para hoje.
            </p>
          ) : (
            <div className="divide-y">
              {agendamentosHoje.map((ag) => (
                <div
                  key={ag.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {ag.pet.nome}{" "}
                      <span className="text-muted-foreground">
                        · {ag.cliente.nome}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
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
        <Card>
          <CardHeader>
            <CardTitle>Vacinas a vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {vacinasAVencer.map((vacina) => {
                const status = getStatusVacina(vacina.proximaDose);
                return (
                  <Link
                    key={vacina.id}
                    href={`/pets/${vacina.pet.id}`}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-muted/40"
                  >
                    <div>
                      <p className="font-medium">
                        {vacina.pet.nome}{" "}
                        <span className="text-muted-foreground">
                          · {vacina.pet.cliente.nome}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
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
        <Card>
          <CardHeader>
            <CardTitle>Estoque baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {produtosBaixoEstoque.map((produto) => (
                <Link
                  key={produto.id}
                  href={`/estoque/${produto.id}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-muted/40"
                >
                  <p className="font-medium">{produto.nome}</p>
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
                    {produto.quantidadeAtual} / {produto.quantidadeMinima} {produto.unidadeMedida}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
