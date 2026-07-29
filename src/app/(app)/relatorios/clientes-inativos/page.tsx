import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { getClientesInativos } from "@/lib/relatorios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, UserX } from "lucide-react";

const DIAS_PADRAO = 60;

export default async function RelatorioClientesInativosPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const session = await requireSession();
  if (!isAdmin(session.user.papel)) redirect("/dashboard");

  const params = await searchParams;
  const dias = Number(params.dias) > 0 ? Number(params.dias) : DIAS_PADRAO;

  const inativos = await getClientesInativos(session.user.tenantId, dias);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
            Clientes inativos
          </h1>
          <p className="text-sm text-text-secondary">
            Sem atendimento ou agendamento nos últimos {dias} dias.
          </p>
        </div>
        <Button render={<Link href={`/relatorios/clientes-inativos/export?dias=${dias}`} />} nativeButton={false} variant="outline">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="dias" className="text-sm font-medium text-text-secondary">
            Dias sem atividade
          </label>
          <Input
            id="dias"
            type="number"
            name="dias"
            min="1"
            className="h-9 w-32 font-mono"
            defaultValue={dias}
          />
        </div>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {inativos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-text-tertiary">
                <UserX className="h-6 w-6" />
              </div>
              <p className="text-text-secondary">Nenhum cliente inativo nesse período.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Última atividade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inativos.map(({ cliente, ultimaAtividade }) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium text-text">
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className="hover:underline"
                      >
                        {cliente.nome}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">
                      {cliente.telefone}
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">
                      {ultimaAtividade
                        ? ultimaAtividade.toLocaleDateString("pt-BR")
                        : "Nunca"}
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
