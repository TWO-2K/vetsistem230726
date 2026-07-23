import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { getClientesInativos } from "@/lib/relatorios";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            Clientes inativos
          </h1>
          <p className="text-muted-foreground">
            Sem atendimento ou agendamento nos últimos {dias} dias.
          </p>
        </div>
        <Button render={<Link href={`/relatorios/clientes-inativos/export?dias=${dias}`} />} nativeButton={false} variant="outline">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="dias" className="text-sm font-medium">
            Dias sem atividade
          </label>
          <input
            id="dias"
            type="number"
            name="dias"
            min="1"
            defaultValue={dias}
            className="flex h-9 w-32 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {inativos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <UserX className="h-8 w-8" />
              <p>Nenhum cliente inativo nesse período.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Última atividade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inativos.map(({ cliente, ultimaAtividade }) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className="hover:underline"
                      >
                        {cliente.nome}
                      </Link>
                    </TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell>
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
