import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { getRelatorioFinanceiro } from "@/lib/relatorios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Wallet } from "lucide-react";
import { FORMA_PAGAMENTO_LABEL } from "@/lib/labels";
import { FormaPagamento } from "@/generated/prisma/client";

function paraInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function RelatorioFinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ inicio?: string; fim?: string }>;
}) {
  const session = await requireSession();
  if (!isAdmin(session.user.papel)) redirect("/dashboard");

  const params = await searchParams;
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  const inicio = params.inicio ? new Date(`${params.inicio}T00:00:00`) : inicioMes;
  const fim = params.fim ? new Date(`${params.fim}T23:59:59`) : hoje;

  const { cobrancas, total, totalPorForma } = await getRelatorioFinanceiro(
    session.user.tenantId,
    inicio,
    fim
  );

  const query = `inicio=${paraInputDate(inicio)}&fim=${paraInputDate(fim)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
            Financeiro por período
          </h1>
          <p className="text-sm text-text-secondary">
            Cobranças pagas no intervalo selecionado.
          </p>
        </div>
        <Button render={<Link href={`/relatorios/financeiro/export?${query}`} />} nativeButton={false} variant="outline">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="inicio" className="text-sm font-medium text-text-secondary">
            De
          </label>
          <Input
            id="inicio"
            type="date"
            name="inicio"
            className="h-9 w-auto font-mono"
            defaultValue={paraInputDate(inicio)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="fim" className="text-sm font-medium text-text-secondary">
            Até
          </label>
          <Input
            id="fim"
            type="date"
            name="fim"
            className="h-9 w-auto font-mono"
            defaultValue={paraInputDate(fim)}
          />
        </div>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Total recebido
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold tracking-tight text-text">
            {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </CardContent>
        </Card>
        {(Object.keys(FORMA_PAGAMENTO_LABEL) as FormaPagamento[])
          .filter((forma) => totalPorForma[forma] > 0)
          .map((forma) => (
            <Card key={forma} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  {FORMA_PAGAMENTO_LABEL[forma]}
                </CardTitle>
              </CardHeader>
              <CardContent className="font-mono text-3xl font-semibold tracking-tight text-text">
                {totalPorForma[forma].toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </CardContent>
            </Card>
          ))}
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {cobrancas.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-text-tertiary">
                <Wallet className="h-6 w-6" />
              </div>
              <p className="text-text-secondary">Nenhuma cobrança paga no período.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cobrancas.map((cobranca) => (
                  <TableRow key={cobranca.id}>
                    <TableCell className="font-mono text-text-secondary">
                      {cobranca.dataPagamento?.toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-medium text-text">
                      {cobranca.cliente.nome}
                    </TableCell>
                    <TableCell className="text-text-secondary">{cobranca.descricao}</TableCell>
                    <TableCell className="text-text-secondary">
                      {cobranca.formaPagamento
                        ? FORMA_PAGAMENTO_LABEL[cobranca.formaPagamento]
                        : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-text">
                      {cobranca.valor.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
