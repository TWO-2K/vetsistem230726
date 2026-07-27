import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { podeGerenciarServicos } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicoForm } from "@/components/forms/servico-form";
import { atualizarServico } from "@/actions/servicos";

export default async function EditarServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (!podeGerenciarServicos(session.user.papel)) redirect("/dashboard");
  const { id } = await params;

  const servico = await prisma.servico.findUnique({
    where: { id, tenantId: session.user.tenantId },
  });

  if (!servico) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-text">
          Editar serviço
        </h1>
        <p className="text-text-secondary">{servico.nome}</p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Dados do serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <ServicoForm
            servico={servico}
            action={atualizarServico.bind(null, servico.id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
