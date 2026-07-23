"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { atualizarStatusAgendamento } from "@/actions/agendamentos";
import { StatusAgendamento } from "@/generated/prisma/client";
import { STATUS_LABEL, STATUS_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function AgendamentoStatusSelect({
  agendamentoId,
  status,
}: {
  agendamentoId: string;
  status: StatusAgendamento;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      items={STATUS_LABEL}
      disabled={isPending}
      onValueChange={(novoStatus) => {
        startTransition(() => {
          atualizarStatusAgendamento(
            agendamentoId,
            novoStatus as StatusAgendamento
          );
        });
      }}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          "w-40 border-none font-medium",
          STATUS_COLOR[status]
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_LABEL) as StatusAgendamento[]).map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
