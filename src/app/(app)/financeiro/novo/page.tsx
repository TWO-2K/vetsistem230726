import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { podeGerenciarFinanceiro } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CobrancaForm } from "@/components/forms/cobranca-form";
import { criarCobranca } from "@/actions/financeiro";

export default async function NovaCobrancaPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const session = await requireSession();
  if (!podeGerenciarFinanceiro(session.user.papel)) redirect("/dashboard");
  const { clienteId } = await searchParams;

  const clientes = await prisma.cliente.findMany({
    where: { tenantId: session.user.tenantId },
    select: { id: true, nome: true, pets: { select: { id: true, nome: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">
          Nova cobrança
        </h1>
        <p className="text-muted-foreground">
          Lance uma conta a receber para um cliente.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dados da cobrança</CardTitle>
        </CardHeader>
        <CardContent>
          <CobrancaForm
            clientes={clientes}
            clienteIdInicial={clienteId}
            action={criarCobranca}
          />
        </CardContent>
      </Card>
    </div>
  );
}
