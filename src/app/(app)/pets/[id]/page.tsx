import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Trash2, PawPrint, Phone, Weight, Cake, BedDouble, Syringe } from "lucide-react";
import { excluirPet } from "@/actions/pets";
import { ProntuarioQuickAdd } from "@/components/forms/prontuario-quick-add";
import { InternacaoQuickAdd } from "@/components/forms/internacao-quick-add";
import { VacinaQuickAdd } from "@/components/forms/vacina-quick-add";
import {
  TIPO_PRONTUARIO_LABEL,
  TIPO_PRONTUARIO_ICON,
  TIPO_PRONTUARIO_COLOR,
  STATUS_INTERNACAO_COLOR,
  STATUS_VACINA_LABEL,
  STATUS_VACINA_COLOR,
  getStatusVacina,
} from "@/lib/labels";
import { formatIdade } from "@/lib/pet-format";
import { podeAtenderClinico } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export default async function PetDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const pet = await prisma.pet.findUnique({
    where: { id, tenantId: session.user.tenantId },
    include: {
      cliente: true,
      prontuarios: {
        orderBy: { data: "desc" },
        include: { usuario: true },
      },
      internacoes: {
        where: { status: "ATIVA" },
        take: 1,
      },
      vacinas: {
        orderBy: { dataAplicacao: "desc" },
      },
    },
  });

  if (!pet) notFound();

  const podeAgir = podeAtenderClinico(session.user.papel);
  const internacaoAtiva = pet.internacoes[0];

  const produtos = podeAgir
    ? await prisma.produto.findMany({
        where: { tenantId: session.user.tenantId, ativo: true },
        orderBy: { nome: "asc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/clientes/${pet.cliente.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {pet.cliente.nome}
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PawPrint className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-heading font-bold tracking-tight">
                  {pet.nome}
                </h1>
                {pet.sexo && (
                  <Badge variant="outline">
                    {pet.sexo === "MACHO" ? "Macho" : "Fêmea"}
                  </Badge>
                )}
                {internacaoAtiva && (
                  <Link
                    href={`/internacoes/${internacaoAtiva.id}`}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      STATUS_INTERNACAO_COLOR.ATIVA
                    )}
                  >
                    Internado
                  </Link>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {pet.especie}
                {pet.raca ? ` · ${pet.raca}` : ""}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                Tutor:{" "}
                <Link
                  href={`/clientes/${pet.cliente.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {pet.cliente.nome}
                </Link>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" /> {pet.cliente.telefone}
                </span>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {pet.peso && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                    <Weight className="h-3 w-3" /> {pet.peso} kg
                  </span>
                )}
                {pet.dataNascimento && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">
                    <Cake className="h-3 w-3" /> {formatIdade(pet.dataNascimento)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              render={<Link href={`/pets/${pet.id}/editar`} />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              <Pencil className="h-4 w-4" /> Editar
            </Button>
            <form action={excluirPet.bind(null, pet.id, pet.cliente.id)}>
              <Button type="submit" variant="outline" size="sm">
                <Trash2 className="h-4 w-4" /> Excluir
              </Button>
            </form>
          </div>
        </CardContent>
        {pet.observacoes && (
          <CardContent className="pt-0 text-sm">
            <span className="text-muted-foreground">Observações: </span>
            {pet.observacoes}
          </CardContent>
        )}
      </Card>

      {podeAgir && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Novo registro</CardTitle>
          </CardHeader>
          <CardContent>
            <ProntuarioQuickAdd petId={pet.id} produtos={produtos} />
          </CardContent>
        </Card>
      )}

      {podeAgir && !internacaoAtiva && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BedDouble className="h-4 w-4" /> Internação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InternacaoQuickAdd petId={pet.id} />
          </CardContent>
        </Card>
      )}

      {podeAgir && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Syringe className="h-4 w-4" /> Vacinas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <VacinaQuickAdd petId={pet.id} />
            {pet.vacinas.length > 0 && (
              <div className="divide-y">
                {pet.vacinas.map((vacina) => {
                  const status = getStatusVacina(vacina.proximaDose);
                  return (
                    <div
                      key={vacina.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{vacina.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Aplicada em{" "}
                          {vacina.dataAplicacao.toLocaleDateString("pt-BR")}
                          {vacina.proximaDose &&
                            ` · Próxima dose em ${vacina.proximaDose.toLocaleDateString("pt-BR")}`}
                        </p>
                      </div>
                      {status && (
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            STATUS_VACINA_COLOR[status]
                          )}
                        >
                          {STATUS_VACINA_LABEL[status]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {pet.prontuarios.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum registro de prontuário ainda.
            </p>
          ) : (
            <div className="space-y-5">
              {pet.prontuarios.map((registro, index) => {
                const Icon = TIPO_PRONTUARIO_ICON[registro.tipo];
                return (
                  <div key={registro.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
                          TIPO_PRONTUARIO_COLOR[registro.tipo].solid
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {index < pet.prontuarios.length - 1 && (
                        <div className="mt-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            TIPO_PRONTUARIO_COLOR[registro.tipo].soft
                          )}
                        >
                          {TIPO_PRONTUARIO_LABEL[registro.tipo]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {registro.data.toLocaleString("pt-BR")} ·{" "}
                          {registro.usuario.nome}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        {registro.anamnese && (
                          <p>
                            <span className="font-medium">Anamnese: </span>
                            {registro.anamnese}
                          </p>
                        )}
                        {registro.diagnostico && (
                          <p>
                            <span className="font-medium">Diagnóstico: </span>
                            {registro.diagnostico}
                          </p>
                        )}
                        {registro.prescricao && (
                          <p>
                            <span className="font-medium">Prescrição: </span>
                            {registro.prescricao}
                          </p>
                        )}
                        {registro.observacoes && (
                          <p>
                            <span className="font-medium">Observações: </span>
                            {registro.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
