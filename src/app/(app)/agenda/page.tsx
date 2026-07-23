import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, CalendarDays } from "lucide-react";
import { AgendamentoStatusSelect } from "@/components/agendamento-status-select";

export default async function AgendaPage() {
  const session = await requireSession();

  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);

  const agendamentos = await prisma.agendamento.findMany({
    where: { tenantId: session.user.tenantId, dataHora: { gte: inicioHoje } },
    include: { pet: true, cliente: true },
    orderBy: { dataHora: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Próximos atendimentos da clínica.
          </p>
        </div>
        <Button render={<Link href="/agenda/novo" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Novo agendamento
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {agendamentos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <CalendarDays className="h-8 w-8" />
              <p>Nenhum agendamento futuro.</p>
            </div>
          ) : (
            <div className="divide-y">
              {agendamentos.map((ag) => (
                <div
                  key={ag.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      <Link href={`/pets/${ag.pet.id}`} className="hover:underline">
                        {ag.pet.nome}
                      </Link>{" "}
                      <span className="text-muted-foreground">
                        · {ag.cliente.nome}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ag.servico} ·{" "}
                      {ag.dataHora.toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <AgendamentoStatusSelect
                    agendamentoId={ag.id}
                    status={ag.status}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
