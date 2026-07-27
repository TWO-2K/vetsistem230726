import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FuncionarioForm } from "@/components/forms/funcionario-form";
import { atualizarFuncionario } from "@/actions/funcionarios";

export default async function EditarFuncionarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (session.user.papel !== "ADMIN") redirect("/dashboard");
  const { id } = await params;

  const funcionario = await prisma.usuario.findUnique({
    where: { id, tenantId: session.user.tenantId },
  });

  if (!funcionario) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-text">
          Editar funcionário
        </h1>
        <p className="text-text-secondary">{funcionario.nome}</p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Dados do funcionário</CardTitle>
        </CardHeader>
        <CardContent>
          <FuncionarioForm
            funcionario={funcionario}
            action={atualizarFuncionario.bind(null, funcionario.id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
