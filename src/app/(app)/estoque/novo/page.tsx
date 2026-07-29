import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { podeGerenciarEstoque } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProdutoForm } from "@/components/forms/produto-form";
import { criarProduto } from "@/actions/estoque";

export default async function NovoProdutoPage() {
  const session = await requireSession();
  if (!podeGerenciarEstoque(session.user.papel)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
          Novo produto
        </h1>
        <p className="text-sm text-text-secondary">Cadastre um novo produto ou insumo.</p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Dados do produto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProdutoForm action={criarProduto} />
        </CardContent>
      </Card>
    </div>
  );
}
