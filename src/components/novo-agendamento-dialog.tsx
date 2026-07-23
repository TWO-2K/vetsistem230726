"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgendamentoForm } from "@/components/forms/agendamento-form";
import { criarAgendamento } from "@/actions/agendamentos";

type ClienteComPets = {
  id: string;
  nome: string;
  pets: { id: string; nome: string }[];
};

type ServicoCatalogo = {
  id: string;
  nome: string;
};

type Veterinario = {
  id: string;
  nome: string;
};

export function NovoAgendamentoDialog({
  open,
  onOpenChange,
  clientes,
  servicos,
  veterinarios,
  initialDataHora,
  horarioInicio,
  horarioFim,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: ClienteComPets[];
  servicos: ServicoCatalogo[];
  veterinarios: Veterinario[];
  initialDataHora?: string;
  horarioInicio?: string;
  horarioFim?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
        </DialogHeader>
        <AgendamentoForm
          clientes={clientes}
          servicos={servicos}
          veterinarios={veterinarios}
          action={criarAgendamento}
          initialDataHora={initialDataHora}
          horarioInicio={horarioInicio}
          horarioFim={horarioFim}
        />
      </DialogContent>
    </Dialog>
  );
}
