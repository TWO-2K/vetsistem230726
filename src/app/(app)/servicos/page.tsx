import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { podeGerenciarServicos } from "@/lib/rbac";
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
import { Plus, Scissors, Power, PowerOff } from "lucide-react";
import { ativarServico, desativarServico } from "@/actions/servicos";

export default async function ServicosPage() {
  const session = await requireSession();
  if (!podeGerenciarServicos(session.user.papel)) redirect("/dashboard");

  const servicos = await prisma.servico.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-text">Serviços</h1>
          <p className="text-sm text-text-secondary">
            Catálogo de serviços com preço padrão e comissão.
          </p>
        </div>
        <Button render={<Link href="/servicos/novo" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Novo serviço
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {servicos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-text-tertiary">
                <Scissors className="h-6 w-6" />
              </div>
              <p className="text-text-secondary">Nenhum serviço cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Serviço</TableHead>
                  <TableHead>Preço padrão</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicos.map((servico) => (
                  <TableRow key={servico.id}>
                    <TableCell className="font-medium text-text">
                      <Link
                        href={`/servicos/${servico.id}/editar`}
                        className="hover:underline"
                      >
                        {servico.nome}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">
                      R$ {servico.precoPadrao.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">
                      {servico.percentualComissao.toFixed(1)}%
                    </TableCell>
                    <TableCell className="flex items-center justify-end gap-2">
                      {!servico.ativo && (
                        <span className="rounded-full bg-bg-sunken px-2.5 py-1 text-xs font-medium text-text-secondary">
                          Inativo
                        </span>
                      )}
                      <form
                        action={
                          servico.ativo
                            ? desativarServico.bind(null, servico.id)
                            : ativarServico.bind(null, servico.id)
                        }
                      >
                        <Button type="submit" variant="outline" size="sm">
                          {servico.ativo ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
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
