"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, PawPrint, Plus, Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgendamentoStatusSelect } from "@/components/agendamento-status-select";
import { NovoAgendamentoDialog } from "@/components/novo-agendamento-dialog";
import { STATUS_COLOR, STATUS_BORDER, STATUS_LABEL } from "@/lib/labels";
import { StatusAgendamento } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type AgendamentoEvento = {
  id: string;
  petId: string;
  petNome: string;
  clienteNome: string;
  servico: string;
  vetNome: string;
  status: StatusAgendamento;
  dataHora: string;
};

type ClienteComPets = {
  id: string;
  nome: string;
  pets: { id: string; nome: string }[];
};

type Visao = "semana" | "dia";

const ALTURA_HORA = 56; // px por hora
const DURACAO_PADRAO_MIN = 50;

// Pontinho sólido usado na legenda de status abaixo da grade (mesma cor de
// texto usada em STATUS_COLOR, mas como fundo).
const STATUS_LEGENDA_DOT: Record<StatusAgendamento, string> = {
  AGENDADO: "bg-info",
  CONFIRMADO: "bg-warning",
  EM_ATENDIMENTO: "bg-success",
  CONCLUIDO: "bg-text-secondary",
  CANCELADO: "bg-danger",
};

const DIA_SEMANA_LONGO = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

function formatarIntervalo(inicioSemana: Date, visao: Visao) {
  if (visao === "dia") {
    return inicioSemana.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  const fim = new Date(inicioSemana);
  fim.setDate(fim.getDate() + 6);
  const mesmoMes = inicioSemana.getMonth() === fim.getMonth();
  const opcoesInicio: Intl.DateTimeFormatOptions = mesmoMes
    ? { day: "2-digit", month: "long" }
    : { day: "2-digit", month: "long" };
  const opcoesFim: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  return `${inicioSemana.toLocaleDateString("pt-BR", opcoesInicio)} – ${fim.toLocaleDateString(
    "pt-BR",
    opcoesFim
  )}`;
}

function toISODateOnly(d: Date) {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function toDateTimeLocal(d: Date) {
  return `${toISODateOnly(d)}T${String(d.getHours()).padStart(2, "0")}:00`;
}

type EventoPosicionado = {
  ag: AgendamentoEvento;
  inicioMin: number;
  col: number;
  cols: number;
};

type ItemLayout = {
  ag: AgendamentoEvento;
  inicioMin: number;
  fimMin: number;
  col: number;
  cols: number;
  clusterId: number;
};

// Agrupa eventos que se sobrepõem no tempo e distribui cada grupo em colunas
// lado a lado (mesma lógica de Google Calendar/Outlook), pra não empilhar
// eventos no mesmo horário um em cima do outro.
function layoutEventosDoDia(eventos: AgendamentoEvento[]): ItemLayout[] {
  const itens: ItemLayout[] = eventos
    .map((ag) => {
      const inicio = new Date(ag.dataHora);
      const inicioMin = inicio.getHours() * 60 + inicio.getMinutes();
      return {
        ag,
        inicioMin,
        fimMin: inicioMin + DURACAO_PADRAO_MIN,
        col: 0,
        cols: 1,
        clusterId: 0,
      };
    })
    .sort((a, b) => a.inicioMin - b.inicioMin || a.fimMin - b.fimMin);

  let cluster: typeof itens = [];
  let clusterFim = -Infinity;
  let proximoClusterId = 0;

  function fecharCluster() {
    if (cluster.length === 0) return;
    const idAtual = proximoClusterId++;
    const finsPorColuna: number[] = [];
    for (const item of cluster) {
      let colIdx = finsPorColuna.findIndex((fim) => fim <= item.inicioMin);
      if (colIdx === -1) {
        colIdx = finsPorColuna.length;
        finsPorColuna.push(item.fimMin);
      } else {
        finsPorColuna[colIdx] = item.fimMin;
      }
      item.col = colIdx;
      item.clusterId = idAtual;
    }
    const totalCols = finsPorColuna.length;
    for (const item of cluster) item.cols = totalCols;
    cluster = [];
  }

  for (const item of itens) {
    if (cluster.length > 0 && item.inicioMin >= clusterFim) {
      fecharCluster();
      clusterFim = -Infinity;
    }
    cluster.push(item);
    clusterFim = Math.max(clusterFim, item.fimMin);
  }
  fecharCluster();

  return itens;
}

type ItemRenderizavel =
  | { tipo: "evento"; item: EventoPosicionado }
  | {
      tipo: "mais";
      inicioMin: number;
      col: number;
      cols: number;
      ocultos: AgendamentoEvento[];
    };

// Quando um cluster tem mais eventos do que colunas visíveis cabem (a coluna
// fica estreita demais pra ler), junta o excedente num indicador "+N mais"
// clicável em vez de espremer todo mundo lado a lado.
function aplicarLimiteColunas(
  itens: ItemLayout[],
  maxColsVisiveis: number
): ItemRenderizavel[] {
  const porCluster = new Map<number, ItemLayout[]>();
  for (const item of itens) {
    const lista = porCluster.get(item.clusterId) ?? [];
    lista.push(item);
    porCluster.set(item.clusterId, lista);
  }

  const resultado: ItemRenderizavel[] = [];
  for (const grupo of porCluster.values()) {
    const totalCols = grupo[0].cols;
    if (totalCols <= maxColsVisiveis) {
      for (const item of grupo) {
        resultado.push({
          tipo: "evento",
          item: { ag: item.ag, inicioMin: item.inicioMin, col: item.col, cols: totalCols },
        });
      }
      continue;
    }

    const colOverflow = maxColsVisiveis - 1;
    const visiveis = grupo.filter((item) => item.col < colOverflow);
    const ocultos = grupo.filter((item) => item.col >= colOverflow);

    for (const item of visiveis) {
      resultado.push({
        tipo: "evento",
        item: { ag: item.ag, inicioMin: item.inicioMin, col: item.col, cols: maxColsVisiveis },
      });
    }
    if (ocultos.length > 0) {
      resultado.push({
        tipo: "mais",
        inicioMin: Math.min(...ocultos.map((item) => item.inicioMin)),
        col: colOverflow,
        cols: maxColsVisiveis,
        ocultos: ocultos.map((item) => item.ag),
      });
    }
  }
  return resultado;
}

export function AgendaCalendar({
  inicioSemana,
  dataReferencia,
  visao,
  agendamentos,
  clientes,
  servicos,
  veterinarios,
  horarioInicio,
  horarioFim,
  diasFuncionamento,
}: {
  inicioSemana: string;
  dataReferencia: string;
  visao: Visao;
  agendamentos: AgendamentoEvento[];
  clientes: ClienteComPets[];
  servicos: { id: string; nome: string }[];
  veterinarios: { id: string; nome: string }[];
  horarioInicio: string;
  horarioFim: string;
  diasFuncionamento: number[];
}) {
  const semanaInicio = useMemo(() => new Date(inicioSemana), [inicioSemana]);
  const referencia = useMemo(() => new Date(dataReferencia), [dataReferencia]);
  const hoje = new Date();
  const [selecionado, setSelecionado] = useState<AgendamentoEvento | null>(null);
  const [ocultosVisiveis, setOcultosVisiveis] = useState<AgendamentoEvento[] | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);
  const [novoDataHora, setNovoDataHora] = useState<string | undefined>(undefined);
  const maxColsVisiveis = visao === "dia" ? 5 : 3;

  const HORA_INICIO = Number(horarioInicio.split(":")[0]);
  const minutoFim = Number(horarioFim.split(":")[1]);
  const HORA_FIM = Number(horarioFim.split(":")[0]) + (minutoFim > 0 ? 1 : 0);
  const DIAS_FECHADOS = [0, 1, 2, 3, 4, 5, 6].filter(
    (dia) => !diasFuncionamento.includes(dia)
  );

  const dias = useMemo(() => {
    if (visao === "dia") return [referencia];
    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(semanaInicio);
      dia.setDate(dia.getDate() + i);
      return dia;
    });
  }, [semanaInicio, referencia, visao]);

  const passo = visao === "dia" ? 1 : 7;
  const anterior = new Date(referencia);
  anterior.setDate(anterior.getDate() - passo);
  const seguinte = new Date(referencia);
  seguinte.setDate(seguinte.getDate() + passo);

  const horas = Array.from(
    { length: HORA_FIM - HORA_INICIO + 1 },
    (_, i) => HORA_INICIO + i
  );

  const eventosPorDia = useMemo(() => {
    const mapa = new Map<string, AgendamentoEvento[]>();
    for (const ag of agendamentos) {
      const chave = toISODateOnly(new Date(ag.dataHora));
      const lista = mapa.get(chave) ?? [];
      lista.push(ag);
      mapa.set(chave, lista);
    }
    return mapa;
  }, [agendamentos]);

  function abrirNovo(dia: Date, hora?: number) {
    const base = new Date(dia);
    base.setHours(hora ?? 9, 0, 0, 0);
    setNovoDataHora(toDateTimeLocal(base));
    setNovoAberto(true);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              render={
                <Link
                  href={`/agenda?data=${toISODateOnly(anterior)}&visao=${visao}`}
                />
              }
              nativeButton={false}
              aria-label={visao === "dia" ? "Dia anterior" : "Semana anterior"}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={
                <Link href={`/agenda?data=${toISODateOnly(hoje)}&visao=${visao}`} />
              }
              nativeButton={false}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              render={
                <Link
                  href={`/agenda?data=${toISODateOnly(seguinte)}&visao=${visao}`}
                />
              }
              nativeButton={false}
              aria-label={visao === "dia" ? "Próximo dia" : "Próxima semana"}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="font-heading text-sm font-semibold capitalize">
            {formatarIntervalo(visao === "dia" ? referencia : semanaInicio, visao)}
          </p>
          <div className="flex items-center gap-0.5 rounded-full border border-border bg-bg-sunken/60 p-0.5 text-sm">
            <Link
              href={`/agenda?data=${toISODateOnly(referencia)}&visao=semana`}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                visao === "semana"
                  ? "bg-bg-elevated font-medium shadow-sm"
                  : "text-text-secondary hover:text-text"
              )}
            >
              Semana
            </Link>
            <Link
              href={`/agenda?data=${toISODateOnly(referencia)}&visao=dia`}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                visao === "dia"
                  ? "bg-bg-elevated font-medium shadow-sm"
                  : "text-text-secondary hover:text-text"
              )}
            >
              Dia
            </Link>
          </div>
        </div>
        <Button onClick={() => abrirNovo(referencia)}>
          <Plus className="h-4 w-4" /> Novo agendamento
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-auto">
        <div
          className={cn("flex flex-1 flex-col", visao === "semana" && "min-w-180")}
        >
          {/* Cabeçalho dos dias */}
          <div className="sticky top-0 z-10 flex border-b border-border bg-bg-elevated">
            <div className="w-14 shrink-0 border-r border-border" />
            {dias.map((dia) => {
              const ehHoje = toISODateOnly(dia) === toISODateOnly(hoje);
              const fechado = DIAS_FECHADOS.includes(dia.getDay());
              return (
                <div
                  key={dia.toISOString()}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0 border-r border-border py-2 last:border-r-0",
                    fechado && "bg-bg-sunken/50"
                  )}
                >
                  <span className="text-xs font-semibold text-text">
                    {DIA_SEMANA_LONGO[dia.getDay()]}
                  </span>
                  <span
                    className={cn(
                      "text-xs text-text-secondary",
                      ehHoje && "font-semibold text-primary"
                    )}
                  >
                    {toISODateOnly(dia).slice(8, 10)}/
                    {toISODateOnly(dia).slice(5, 7)}
                  </span>
                  {fechado && (
                    <span className="text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
                      Fechado
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grade de horários */}
          <div className="relative flex flex-1">
            <div className="w-14 shrink-0 border-r border-border">
              {horas.map((h, i) => (
                <div
                  key={h}
                  className="relative border-b border-border text-right text-xs text-text-secondary last:border-b-0"
                  style={{ height: ALTURA_HORA }}
                >
                  <span
                    className={cn(
                      "absolute right-1.5 bg-bg-elevated px-0.5",
                      i === 0 ? "top-0.5" : "-top-2"
                    )}
                  >
                    {String(h).padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>

            {dias.map((dia) => {
              const chave = toISODateOnly(dia);
              const eventos = eventosPorDia.get(chave) ?? [];
              const fechado = DIAS_FECHADOS.includes(dia.getDay());
              return (
                <div
                  key={chave}
                  className={cn(
                    "relative flex-1 border-r border-border last:border-r-0",
                    fechado && "bg-bg-sunken/40"
                  )}
                  style={{ height: ALTURA_HORA * horas.length }}
                >
                  {horas.map((h) => (
                    <button
                      key={h}
                      type="button"
                      disabled={fechado}
                      onClick={() => abrirNovo(dia, h)}
                      className="block w-full border-b border-border last:border-b-0 hover:bg-bg-sunken/60 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      style={{ height: ALTURA_HORA }}
                    />
                  ))}

                  {aplicarLimiteColunas(
                    layoutEventosDoDia(eventos),
                    maxColsVisiveis
                  ).map((renderizavel, idx) => {
                    const inicioMin =
                      renderizavel.tipo === "mais"
                        ? renderizavel.inicioMin
                        : renderizavel.item.inicioMin;
                    const col =
                      renderizavel.tipo === "mais" ? renderizavel.col : renderizavel.item.col;
                    const cols =
                      renderizavel.tipo === "mais" ? renderizavel.cols : renderizavel.item.cols;
                    const top = ((inicioMin - HORA_INICIO * 60) / 60) * ALTURA_HORA;
                    const altura = Math.max(
                      (DURACAO_PADRAO_MIN / 60) * ALTURA_HORA,
                      24
                    );
                    const largura = `calc(${100 / cols}% - 4px)`;
                    const esquerda = `calc(${(100 / cols) * col}% + 2px)`;

                    if (renderizavel.tipo === "mais") {
                      return (
                        <button
                          key={`mais-${chave}-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOcultosVisiveis(renderizavel.ocultos);
                          }}
                          className="absolute z-0 overflow-hidden rounded-md border-l-2 border-text-secondary/40 bg-bg-sunken px-1.5 py-0.5 text-left text-xs font-medium shadow-sm transition-opacity hover:opacity-80 hover:z-10"
                          style={{ top, height: altura, left: esquerda, width: largura }}
                        >
                          +{renderizavel.ocultos.length} mais
                        </button>
                      );
                    }

                    const { ag } = renderizavel.item;
                    const inicio = new Date(ag.dataHora);

                    return (
                      <button
                        key={ag.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelecionado(ag);
                        }}
                        className={cn(
                          "absolute z-0 overflow-hidden rounded-md border-l-2 px-1.5 py-0.5 text-left text-xs shadow-sm transition-opacity hover:opacity-80 hover:z-10",
                          STATUS_COLOR[ag.status],
                          STATUS_BORDER[ag.status]
                        )}
                        style={{ top, height: altura, left: esquerda, width: largura }}
                      >
                        <span className="block truncate font-mono text-[10px] font-bold opacity-85">
                          {inicio.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <p className="truncate font-medium">
                          {ag.petNome} · {ag.servico}
                        </p>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-border px-3 py-2 text-xs text-text-secondary">
        {(Object.keys(STATUS_LABEL) as StatusAgendamento[]).map((status) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-sm", STATUS_LEGENDA_DOT[status])} />
            {STATUS_LABEL[status]}
          </span>
        ))}
      </div>

      <Dialog
        open={selecionado !== null}
        onOpenChange={(open) => !open && setSelecionado(null)}
      >
        <DialogContent>
          {selecionado && (
            <>
              <DialogHeader>
                <DialogTitle>{selecionado.servico}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-text-secondary" />
                  {new Date(selecionado.dataHora).toLocaleString("pt-BR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
                <p className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4 text-text-secondary" />
                  <Link
                    href={`/pets/${selecionado.petId}`}
                    className="hover:underline"
                  >
                    {selecionado.petNome}
                  </Link>
                </p>
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4 text-text-secondary" />
                  {selecionado.clienteNome}
                </p>
                <p className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-text-secondary" />
                  {selecionado.vetNome}
                </p>
              </div>
              <AgendamentoStatusSelect
                agendamentoId={selecionado.id}
                status={selecionado.status}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={ocultosVisiveis !== null}
        onOpenChange={(open) => !open && setOcultosVisiveis(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mais agendamentos no horário</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            {ocultosVisiveis?.map((ag) => {
              const inicio = new Date(ag.dataHora);
              return (
                <button
                  key={ag.id}
                  onClick={() => {
                    setSelecionado(ag);
                    setOcultosVisiveis(null);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md border-l-2 px-2 py-1.5 text-left text-sm shadow-sm transition-opacity hover:opacity-80",
                    STATUS_COLOR[ag.status],
                    STATUS_BORDER[ag.status]
                  )}
                >
                  <span className="font-mono text-xs font-bold opacity-85">
                    {inicio.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="truncate">
                    {ag.petNome} · {ag.servico}
                  </span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <NovoAgendamentoDialog
        open={novoAberto}
        onOpenChange={setNovoAberto}
        clientes={clientes}
        servicos={servicos}
        veterinarios={veterinarios}
        initialDataHora={novoDataHora}
        horarioInicio={horarioInicio}
        horarioFim={horarioFim}
      />
    </div>
  );
}
