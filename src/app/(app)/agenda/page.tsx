import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AgendaCalendar } from "@/components/agenda-calendar";

function inicioDaSemana(data: Date) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; visao?: string }>;
}) {
  const session = await requireSession();
  const { data, visao } = await searchParams;

  const referencia = data ? new Date(`${data}T00:00:00`) : new Date();
  referencia.setHours(0, 0, 0, 0);
  const inicioSemana = inicioDaSemana(referencia);
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(fimSemana.getDate() + 7);
  const visaoAtual = visao === "dia" ? "dia" : "semana";

  const [empresa, agendamentos, clientes, servicos, veterinarios] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({
      where: { id: session.user.tenantId },
      select: { horarioInicio: true, horarioFim: true, diasFuncionamento: true },
    }),
    prisma.agendamento.findMany({
      where: {
        tenantId: session.user.tenantId,
        dataHora: { gte: inicioSemana, lt: fimSemana },
      },
      include: { pet: true, cliente: true, usuario: true },
      orderBy: { dataHora: "asc" },
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
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-text">
          Agenda
        </h1>
        <p className="text-text-secondary">
          Visão semanal ou diária dos atendimentos.
        </p>
      </div>

      <AgendaCalendar
        inicioSemana={inicioSemana.toISOString()}
        dataReferencia={referencia.toISOString()}
        visao={visaoAtual}
        clientes={clientes}
        servicos={servicos}
        veterinarios={veterinarios}
        horarioInicio={empresa.horarioInicio}
        horarioFim={empresa.horarioFim}
        diasFuncionamento={empresa.diasFuncionamento}
        agendamentos={agendamentos.map((ag) => ({
          id: ag.id,
          petId: ag.pet.id,
          petNome: ag.pet.nome,
          clienteNome: ag.cliente.nome,
          servico: ag.servico,
          vetNome: ag.usuario.nome,
          status: ag.status,
          dataHora: ag.dataHora.toISOString(),
        }))}
      />
    </div>
  );
}
