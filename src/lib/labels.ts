import {
  StatusAgendamento,
  TipoProntuario,
  StatusInternacao,
  Papel,
  FormaPagamento,
  StatusCobranca,
  TipoMovimentoEstoque,
  StatusTenant,
} from "@/generated/prisma/client";
import {
  Stethoscope,
  CalendarClock,
  FlaskConical,
  Syringe,
  Scissors,
  FileText,
  type LucideIcon,
} from "lucide-react";

export const STATUS_LABEL: Record<StatusAgendamento, string> = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  EM_ATENDIMENTO: "Em atendimento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export const STATUS_VARIANT: Record<
  StatusAgendamento,
  "default" | "secondary" | "destructive" | "outline"
> = {
  AGENDADO: "outline",
  CONFIRMADO: "secondary",
  EM_ATENDIMENTO: "default",
  CONCLUIDO: "secondary",
  CANCELADO: "destructive",
};

export const STATUS_COLOR: Record<StatusAgendamento, string> = {
  AGENDADO: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  CONFIRMADO:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  EM_ATENDIMENTO:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  CONCLUIDO:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-400",
  CANCELADO:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
};

export const TIPO_PRONTUARIO_LABEL: Record<TipoProntuario, string> = {
  CONSULTA: "Consulta",
  RETORNO: "Retorno",
  EXAME: "Exame",
  VACINA: "Vacina",
  CIRURGIA: "Cirurgia",
  OUTRO: "Outro",
};

export const TIPO_PRONTUARIO_ICON: Record<TipoProntuario, LucideIcon> = {
  CONSULTA: Stethoscope,
  RETORNO: CalendarClock,
  EXAME: FlaskConical,
  VACINA: Syringe,
  CIRURGIA: Scissors,
  OUTRO: FileText,
};

export const TIPO_PRONTUARIO_COLOR: Record<
  TipoProntuario,
  { solid: string; soft: string }
> = {
  CONSULTA: {
    solid: "bg-blue-600 hover:bg-blue-700",
    soft: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  },
  RETORNO: {
    solid: "bg-amber-600 hover:bg-amber-700",
    soft: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  EXAME: {
    solid: "bg-rose-600 hover:bg-rose-700",
    soft: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  },
  VACINA: {
    solid: "bg-orange-500 hover:bg-orange-600",
    soft: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  },
  CIRURGIA: {
    solid: "bg-violet-600 hover:bg-violet-700",
    soft: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  },
  OUTRO: {
    solid: "bg-slate-600 hover:bg-slate-700",
    soft: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-400",
  },
};

export const STATUS_INTERNACAO_LABEL: Record<StatusInternacao, string> = {
  ATIVA: "Internado",
  ALTA: "Alta",
};

export const STATUS_INTERNACAO_COLOR: Record<StatusInternacao, string> = {
  ATIVA: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  ALTA: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
};

export const PAPEL_LABEL: Record<Papel, string> = {
  ADMIN: "Administrador",
  VET: "Veterinário(a)",
  RECEPCAO: "Recepção",
};

export type StatusVacina = "VENCIDA" | "PROXIMA" | "EM_DIA";

export const STATUS_VACINA_LABEL: Record<StatusVacina, string> = {
  VENCIDA: "Vencida",
  PROXIMA: "Vence em breve",
  EM_DIA: "Em dia",
};

export const STATUS_VACINA_COLOR: Record<StatusVacina, string> = {
  VENCIDA: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  PROXIMA:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  EM_DIA:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
};

export function getStatusVacina(
  proximaDose: Date | null,
  hoje: Date = new Date()
): StatusVacina | null {
  if (!proximaDose) return null;
  const dias = Math.ceil(
    (proximaDose.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (dias < 0) return "VENCIDA";
  if (dias <= 7) return "PROXIMA";
  return "EM_DIA";
}

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  CARTAO_CREDITO: "Cartão de crédito",
  CARTAO_DEBITO: "Cartão de débito",
  OUTRO: "Outro",
};

export const STATUS_COBRANCA_LABEL: Record<StatusCobranca, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
};

export type StatusCobrancaVisual = StatusCobranca | "VENCIDA";

export const STATUS_COBRANCA_COLOR: Record<StatusCobrancaVisual, string> = {
  PENDENTE:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  VENCIDA: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  PAGO:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  CANCELADO:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-400",
};

export const STATUS_COBRANCA_VISUAL_LABEL: Record<StatusCobrancaVisual, string> = {
  ...STATUS_COBRANCA_LABEL,
  VENCIDA: "Vencida",
};

export function getStatusCobrancaVisual(
  status: StatusCobranca,
  dataVencimento: Date | null,
  hoje: Date = new Date()
): StatusCobrancaVisual {
  if (status === "PENDENTE" && dataVencimento && dataVencimento < hoje) {
    return "VENCIDA";
  }
  return status;
}

export const TIPO_MOVIMENTO_LABEL: Record<TipoMovimentoEstoque, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
};

export const TIPO_MOVIMENTO_COLOR: Record<TipoMovimentoEstoque, string> = {
  ENTRADA:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  SAIDA: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  AJUSTE:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
};

export const STATUS_TENANT_LABEL: Record<StatusTenant, string> = {
  ATIVO: "Ativo",
  TRIAL: "Trial",
  SUSPENSO: "Suspenso",
};

export const STATUS_TENANT_COLOR: Record<StatusTenant, string> = {
  ATIVO:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  TRIAL:
    "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  SUSPENSO: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
};
