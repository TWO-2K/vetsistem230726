import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgendamentoForm } from "@/components/forms/agendamento-form";
import { criarAgendamento } from "@/actions/agendamentos";

export default async function NovoAgendamentoPage() {
  const session = await requireSession();

  const clientes = await prisma.cliente.findMany({
    where: { tenantId: session.user.tenantId },
    select: { id: true, nome: true, pets: { select: { id: true, nome: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">
          Novo agendamento
        </h1>
        <p className="text-muted-foreground">
          Marque um atendimento na agenda da clínica.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dados do agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <AgendamentoForm clientes={clientes} action={criarAgendamento} />
        </CardContent>
      </Card>
    </div>
  );
}
