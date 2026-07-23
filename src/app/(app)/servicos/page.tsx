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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">
            Catálogo de serviços com preço padrão e comissão.
          </p>
        </div>
        <Button render={<Link href="/servicos/novo" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Novo serviço
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {servicos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <Scissors className="h-8 w-8" />
              <p>Nenhum serviço cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Preço padrão</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicos.map((servico) => (
                  <TableRow key={servico.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/servicos/${servico.id}/editar`}
                        className="hover:underline"
                      >
                        {servico.nome}
                      </Link>
                    </TableCell>
                    <TableCell>R$ {servico.precoPadrao.toFixed(2)}</TableCell>
                    <TableCell>{servico.percentualComissao.toFixed(1)}%</TableCell>
                    <TableCell className="flex items-center justify-end gap-2">
                      {!servico.ativo && (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
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
