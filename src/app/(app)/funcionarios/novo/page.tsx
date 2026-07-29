import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FuncionarioForm } from "@/components/forms/funcionario-form";
import { criarFuncionario } from "@/actions/funcionarios";

export default async function NovoFuncionarioPage() {
  const session = await requireSession();
  if (session.user.papel !== "ADMIN") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
          Novo funcionário
        </h1>
        <p className="text-sm text-text-secondary">
          Cadastre um novo usuário com acesso ao sistema.
        </p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Dados do funcionário</CardTitle>
        </CardHeader>
        <CardContent>
          <FuncionarioForm action={criarFuncionario} />
        </CardContent>
      </Card>
    </div>
  );
}
