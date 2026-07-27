"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EstadoAgendamento } from "@/actions/agendamentos";

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

export function AgendamentoForm({
  clientes,
  servicos,
  veterinarios,
  action,
  initialDataHora,
  horarioInicio,
  horarioFim,
}: {
  clientes: ClienteComPets[];
  servicos: ServicoCatalogo[];
  veterinarios: Veterinario[];
  action: (
    prevState: EstadoAgendamento,
    formData: FormData
  ) => Promise<EstadoAgendamento>;
  initialDataHora?: string;
  horarioInicio?: string;
  horarioFim?: string;
}) {
  const [clienteId, setClienteId] = useState<string>("");
  const [servicoId, setServicoId] = useState<string>("");
  const [usuarioId, setUsuarioId] = useState<string>("");
  const [confirmarConflito, setConfirmarConflito] = useState(false);
  const [state, formAction, pending] = useActionState(action, undefined);
  const petsDoCliente =
    clientes.find((c) => c.id === clienteId)?.pets ?? [];

  const clienteItems = Object.fromEntries(
    clientes.map((c) => [c.id, c.nome])
  );
  const petItems = Object.fromEntries(
    petsDoCliente.map((p) => [p.id, p.nome])
  );
  const servicoItems = Object.fromEntries(
    servicos.map((s) => [s.id, s.nome])
  );
  const veterinarioItems = Object.fromEntries(
    veterinarios.map((v) => [v.id, v.nome])
  );
  const nomeServicoSelecionado =
    servicos.find((s) => s.id === servicoId)?.nome ?? "";

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
          Atendimento
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clienteId" className="text-text-secondary">
              Tutor <span className="text-danger">*</span>
            </Label>
            <Select
              name="clienteId"
              items={clienteItems}
              value={clienteId}
              onValueChange={(value) => setClienteId(value ?? "")}
            >
              <SelectTrigger id="clienteId" className="w-full">
                <SelectValue placeholder="Selecione o tutor" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="petId" className="text-text-secondary">
              Pet <span className="text-danger">*</span>
            </Label>
            <Select
              name="petId"
              items={petItems}
              disabled={!clienteId}
              key={clienteId}
            >
              <SelectTrigger id="petId" className="w-full">
                <SelectValue
                  placeholder={
                    clienteId ? "Selecione o pet" : "Escolha o tutor primeiro"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {petsDoCliente.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="usuarioId" className="text-text-secondary">
              Veterinário <span className="text-danger">*</span>
            </Label>
            <Select
              name="usuarioId"
              items={veterinarioItems}
              value={usuarioId}
              onValueChange={(value) => setUsuarioId(value ?? "")}
            >
              <SelectTrigger id="usuarioId" className="w-full">
                <SelectValue placeholder="Selecione o veterinário" />
              </SelectTrigger>
              <SelectContent>
                {veterinarios.map((vet) => (
                  <SelectItem key={vet.id} value={vet.id}>
                    {vet.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataHora" className="text-text-secondary">
              Data e hora <span className="text-danger">*</span>
            </Label>
            <Input
              id="dataHora"
              name="dataHora"
              type="datetime-local"
              className="font-mono"
              defaultValue={initialDataHora}
              key={initialDataHora}
              required
            />
            {horarioInicio && horarioFim && (
              <p className="text-xs text-text-tertiary">
                Funcionamento das {horarioInicio} às {horarioFim}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
          Serviço
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="servicoId" className="text-text-secondary">
              Serviço do catálogo
            </Label>
            <Select
              name="servicoId"
              items={servicoItems}
              value={servicoId}
              onValueChange={(value) => setServicoId(value ?? "")}
            >
              <SelectTrigger id="servicoId" className="w-full">
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {servicos.map((servico) => (
                  <SelectItem key={servico.id} value={servico.id}>
                    {servico.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="servico" className="text-text-secondary">
              Descrição do serviço <span className="text-danger">*</span>
            </Label>
            <Input
              id="servico"
              name="servico"
              defaultValue={nomeServicoSelecionado}
              key={nomeServicoSelecionado}
              placeholder="Consulta, vacina, banho..."
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="observacoes" className="text-text-secondary">
              Observações
            </Label>
            <Textarea id="observacoes" name="observacoes" />
          </div>
        </div>
      </div>

      {state?.error && (
        <div className="space-y-2 rounded-lg border border-danger/30 bg-danger-subtle p-3">
          <p className="text-sm text-danger">{state.error}</p>
          {state.requireConfirm && (
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={confirmarConflito}
                onChange={(e) => setConfirmarConflito(e.target.checked)}
              />
              Confirmar mesmo assim
            </label>
          )}
        </div>
      )}
      {confirmarConflito && (
        <input type="hidden" name="confirmarConflito" value="true" />
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Agendando..." : "Agendar"}
        </Button>
      </div>
    </form>
  );
}
