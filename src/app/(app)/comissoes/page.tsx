import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { podeVerComissoes } from "@/lib/rbac";
import { getRelatorioComissoes } from "@/lib/relatorios";
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
        <h1 className="text-2xl font-heading font-bold tracking-tight">Comissões</h1>
        <p className="text-muted-foreground">
          {somenteProprio
            ? "Sua comissão sobre serviços realizados e já pagos pelo cliente."
            : "Comissão por profissional sobre serviços já pagos pelo cliente."}
        </p>
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
              Total de comissão
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-3xl font-extrabold tracking-tight">
            {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </CardContent>
        </Card>
        {!somenteProprio &&
          [...porProfissional.entries()].map(([profissionalId, dados]) => (
            <Card key={profissionalId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {dados.nome}
                </CardTitle>
              </CardHeader>
              <CardContent className="font-display text-3xl font-extrabold tracking-tight">
                {dados.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {itens.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <Percent className="h-8 w-8" />
              <p>Nenhuma comissão no período.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell>
                      {item.cobranca.dataPagamento?.toLocaleDateString("pt-BR")}
                    </TableCell>
                    {!somenteProprio && (
                      <TableCell className="font-medium">{item.profissional.nome}</TableCell>
                    )}
                    <TableCell>{item.servico.nome}</TableCell>
                    <TableCell>
                      {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell>{item.percentualComissao.toFixed(1)}%</TableCell>
                    <TableCell className="font-medium">
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
