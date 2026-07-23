import Link from "next/link";
import { requireSuperAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { excluirPlano } from "@/actions/admin";
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
import { Plus, Pencil, Trash2, Package2 } from "lucide-react";

export default async function PlanosPage() {
  await requireSuperAdminSession();

  const planos = await prisma.plano.findMany({
    include: { _count: { select: { tenants: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            Planos
          </h1>
          <p className="text-muted-foreground">
            Planos de referência oferecidos às empresas.
          </p>
        </div>
        <Button render={<Link href="/admin/planos/novo" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Novo plano
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {planos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <Package2 className="h-8 w-8" />
              <p>Nenhum plano cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Limite de usuários</TableHead>
                  <TableHead>Preço de referência</TableHead>
                  <TableHead>Empresas</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {planos.map((plano) => (
                  <TableRow key={plano.id}>
                    <TableCell className="font-medium">{plano.nome}</TableCell>
                    <TableCell>{plano.limiteUsuarios ?? "—"}</TableCell>
                    <TableCell>
                      {plano.precoReferencia != null
                        ? plano.precoReferencia.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>{plano._count.tenants}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          render={<Link href={`/admin/planos/${plano.id}/editar`} />}
                          nativeButton={false}
                          variant="ghost"
                          size="icon"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {plano._count.tenants === 0 && (
                          <form action={excluirPlano.bind(null, plano.id)}>
                            <Button type="submit" variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        )}
                      </div>
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
