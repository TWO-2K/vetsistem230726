import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { podeGerenciarServicos } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicoForm } from "@/components/forms/servico-form";
import { criarServico } from "@/actions/servicos";

export default async function NovoServicoPage() {
  const session = await requireSession();
  if (!podeGerenciarServicos(session.user.papel)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">Novo serviço</h1>
        <p className="text-muted-foreground">Cadastre um novo serviço do catálogo.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dados do serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <ServicoForm action={criarServico} />
        </CardContent>
      </Card>
    </div>
  );
}
