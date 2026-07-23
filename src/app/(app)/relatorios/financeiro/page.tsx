import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { getRelatorioFinanceiro } from "@/lib/relatorios";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            Financeiro por período
          </h1>
          <p className="text-muted-foreground">
            Cobranças pagas no intervalo selecionado.
          </p>
        </div>
        <Button render={<Link href={`/relatorios/financeiro/export?${query}`} />} nativeButton={false} variant="outline">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="inicio" className="text-sm font-medium">
            De
          </label>
          <input
            id="inicio"
            type="date"
            name="inicio"
            defaultValue={paraInputDate(inicio)}
            className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="fim" className="text-sm font-medium">
            Até
          </label>
          <input
            id="fim"
            type="date"
            name="fim"
            defaultValue={paraInputDate(fim)}
            className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total recebido
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-3xl font-extrabold tracking-tight">
            {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </CardContent>
        </Card>
        {(Object.keys(FORMA_PAGAMENTO_LABEL) as FormaPagamento[])
          .filter((forma) => totalPorForma[forma] > 0)
          .map((forma) => (
            <Card key={forma}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {FORMA_PAGAMENTO_LABEL[forma]}
                </CardTitle>
              </CardHeader>
              <CardContent className="font-display text-3xl font-extrabold tracking-tight">
                {totalPorForma[forma].toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {cobrancas.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <Wallet className="h-8 w-8" />
              <p>Nenhuma cobrança paga no período.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell>
                      {cobranca.dataPagamento?.toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {cobranca.cliente.nome}
                    </TableCell>
                    <TableCell>{cobranca.descricao}</TableCell>
                    <TableCell>
                      {cobranca.formaPagamento
                        ? FORMA_PAGAMENTO_LABEL[cobranca.formaPagamento]
                        : "—"}
                    </TableCell>
                    <TableCell>
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
