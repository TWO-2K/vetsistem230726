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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
            Estoque
          </h1>
          <p className="text-sm text-text-secondary">Produtos e insumos da clínica.</p>
        </div>
        <Button render={<Link href="/estoque/novo" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Novo produto
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {produtos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-text-tertiary">
                <Package className="h-6 w-6" />
              </div>
              <p className="text-text-secondary">Nenhum produto cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
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
                      <TableCell className="font-medium text-text">
                        <Link
                          href={`/estoque/${produto.id}`}
                          className="block hover:underline"
                        >
                          {produto.nome}
                          {!produto.ativo && (
                            <span className="ml-2 text-xs text-text-tertiary">
                              (Inativo)
                            </span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {produto.categoria || "—"}
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {produto.unidadeMedida}
                      </TableCell>
                      <TableCell className="font-mono text-text-secondary">
                        {produto.quantidadeAtual}
                      </TableCell>
                      <TableCell className="font-mono text-text-secondary">
                        {produto.quantidadeMinima}
                      </TableCell>
                      <TableCell>
                        {estoqueBaixo && (
                          <span className="rounded-full bg-danger-subtle px-2.5 py-1 text-xs font-medium text-danger">
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
