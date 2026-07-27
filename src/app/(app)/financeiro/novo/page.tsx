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

  const [clientes, servicos, profissionais] = await Promise.all([
    prisma.cliente.findMany({
      where: { tenantId: session.user.tenantId },
      select: { id: true, nome: true, pets: { select: { id: true, nome: true } } },
      orderBy: { nome: "asc" },
    }),
    prisma.servico.findMany({
      where: { tenantId: session.user.tenantId, ativo: true },
      select: { id: true, nome: true, precoPadrao: true },
      orderBy: { nome: "asc" },
    }),
    prisma.usuario.findMany({
      where: { tenantId: session.user.tenantId, papel: { in: ["ADMIN", "VET"] }, ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-text">
          Nova cobrança
        </h1>
        <p className="text-text-secondary">
          Lance uma conta a receber para um cliente.
        </p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Dados da cobrança</CardTitle>
        </CardHeader>
        <CardContent>
          <CobrancaForm
            clientes={clientes}
            clienteIdInicial={clienteId}
            servicos={servicos}
            profissionais={profissionais}
            action={criarCobranca}
          />
        </CardContent>
      </Card>
    </div>
  );
}
