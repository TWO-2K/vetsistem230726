import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgendamentoForm } from "@/components/forms/agendamento-form";
import { criarAgendamento } from "@/actions/agendamentos";

export default async function NovoAgendamentoPage() {
  const session = await requireSession();

  const [empresa, clientes, servicos, veterinarios] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({
      where: { id: session.user.tenantId },
      select: { horarioInicio: true, horarioFim: true },
    }),
    prisma.cliente.findMany({
      where: { tenantId: session.user.tenantId },
      select: { id: true, nome: true, pets: { select: { id: true, nome: true } } },
      orderBy: { nome: "asc" },
    }),
    prisma.servico.findMany({
      where: { tenantId: session.user.tenantId, ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
    prisma.usuario.findMany({
      where: { tenantId: session.user.tenantId, papel: { in: ["ADMIN", "VET"] } },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
          Novo agendamento
        </h1>
        <p className="text-sm text-text-secondary">
          Marque um atendimento na agenda da clínica.
        </p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Dados do agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <AgendamentoForm
            clientes={clientes}
            servicos={servicos}
            veterinarios={veterinarios}
            action={criarAgendamento}
            horarioInicio={empresa.horarioInicio}
            horarioFim={empresa.horarioFim}
          />
        </CardContent>
      </Card>
    </div>
  );
}
