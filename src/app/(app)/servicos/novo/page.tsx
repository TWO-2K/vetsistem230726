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
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text">Novo serviço</h1>
        <p className="text-sm text-text-secondary">Cadastre um novo serviço do catálogo.</p>
      </div>
      <Card className="shadow-sm">
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
