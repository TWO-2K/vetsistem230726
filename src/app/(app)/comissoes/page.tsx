import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { podeVerComissoes } from "@/lib/rbac";
import { getRelatorioComissoes } from "@/lib/relatorios";
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
import { Percent } from "lucide-react";

function paraInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ComissoesPage({
  searchParams,
}: {
  searchParams: Promise<{ inicio?: string; fim?: string }>;
}) {
  const session = await requireSession();
  if (!podeVerComissoes(session.user.papel)) redirect("/dashboard");

  const params = await searchParams;
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  const inicio = params.inicio ? new Date(`${params.inicio}T00:00:00`) : inicioMes;
  const fim = params.fim ? new Date(`${params.fim}T23:59:59`) : hoje;

  const somenteProprio = session.user.papel === "VET";
  const { itens, total, porProfissional } = await getRelatorioComissoes(
    session.user.tenantId,
    inicio,
    fim,
    somenteProprio ? session.user.id : undefined
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text">Comissões</h1>
        <p className="text-sm text-text-secondary">
          {somenteProprio
            ? "Sua comissão sobre serviços realizados e já pagos pelo cliente."
            : "Comissão por profissional sobre serviços já pagos pelo cliente."}
        </p>
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
              Total de comissão
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold tracking-tight text-text">
            {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </CardContent>
        </Card>
        {!somenteProprio &&
          [...porProfissional.entries()].map(([profissionalId, dados]) => (
            <Card key={profissionalId} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  {dados.nome}
                </CardTitle>
              </CardHeader>
              <CardContent className="font-mono text-3xl font-semibold tracking-tight text-text">
                {dados.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </CardContent>
            </Card>
          ))}
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {itens.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-text-tertiary">
                <Percent className="h-6 w-6" />
              </div>
              <p className="text-text-secondary">Nenhuma comissão no período.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Data</TableHead>
                  {!somenteProprio && <TableHead>Profissional</TableHead>}
                  <TableHead>Serviço</TableHead>
                  <TableHead>Valor cobrado</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Comissão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-text-secondary">
                      {item.cobranca.dataPagamento?.toLocaleDateString("pt-BR")}
                    </TableCell>
                    {!somenteProprio && (
                      <TableCell className="font-medium text-text">{item.profissional.nome}</TableCell>
                    )}
                    <TableCell className="text-text-secondary">{item.servico.nome}</TableCell>
                    <TableCell className="font-mono text-text-secondary">
                      {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">
                      {item.percentualComissao.toFixed(1)}%
                    </TableCell>
                    <TableCell className="font-mono font-medium text-text">
                      {item.valorComissao.toLocaleString("pt-BR", {
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
