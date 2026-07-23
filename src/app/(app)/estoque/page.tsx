import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { podeGerenciarEstoque } from "@/lib/rbac";
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
import { Plus, Package } from "lucide-react";

export default async function EstoquePage() {
  const session = await requireSession();
  if (!podeGerenciarEstoque(session.user.papel)) redirect("/dashboard");

  const produtos = await prisma.produto.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">Produtos e insumos da clínica.</p>
        </div>
        <Button render={<Link href="/estoque/novo" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Novo produto
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {produtos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <Package className="h-8 w-8" />
              <p>Nenhum produto cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Qtd. atual</TableHead>
                  <TableHead>Qtd. mínima</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => {
                  const estoqueBaixo = produto.quantidadeAtual < produto.quantidadeMinima;
                  return (
                    <TableRow key={produto.id} className="cursor-pointer">
                      <TableCell className="font-medium">
                        <Link
                          href={`/estoque/${produto.id}`}
                          className="block hover:underline"
                        >
                          {produto.nome}
                          {!produto.ativo && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Inativo)
                            </span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>{produto.categoria || "—"}</TableCell>
                      <TableCell>{produto.unidadeMedida}</TableCell>
                      <TableCell>{produto.quantidadeAtual}</TableCell>
                      <TableCell>{produto.quantidadeMinima}</TableCell>
                      <TableCell>
                        {estoqueBaixo && (
                          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
                            Estoque baixo
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
