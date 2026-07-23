import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { podeGerenciarEstoque } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProdutoForm } from "@/components/forms/produto-form";
import { atualizarProduto } from "@/actions/estoque";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (!podeGerenciarEstoque(session.user.papel)) redirect("/dashboard");
  const { id } = await params;

  const produto = await prisma.produto.findUnique({
    where: { id, tenantId: session.user.tenantId },
  });

  if (!produto) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">
          Editar produto
        </h1>
        <p className="text-muted-foreground">{produto.nome}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dados do produto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProdutoForm
            produto={produto}
            action={atualizarProduto.bind(null, produto.id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
