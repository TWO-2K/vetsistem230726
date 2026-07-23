"use client";

import { useState } from "react";
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

type ClienteComPets = {
  id: string;
  nome: string;
  pets: { id: string; nome: string }[];
};

type ServicoCatalogo = {
  id: string;
  nome: string;
  precoPadrao: number;
};

type Profissional = {
  id: string;
  nome: string;
};

export function CobrancaForm({
  clientes,
  clienteIdInicial,
  servicos,
  profissionais,
  action,
}: {
  clientes: ClienteComPets[];
  clienteIdInicial?: string;
  servicos: ServicoCatalogo[];
  profissionais: Profissional[];
  action: (formData: FormData) => void;
}) {
  const [clienteId, setClienteId] = useState<string>(clienteIdInicial ?? "");
  const [servicoId, setServicoId] = useState<string>("");
  const petsDoCliente = clientes.find((c) => c.id === clienteId)?.pets ?? [];

  const clienteItems = Object.fromEntries(clientes.map((c) => [c.id, c.nome]));
  const petItems = Object.fromEntries(petsDoCliente.map((p) => [p.id, p.nome]));
  const servicoItems = Object.fromEntries(servicos.map((s) => [s.id, s.nome]));
  const profissionalItems = Object.fromEntries(profissionais.map((p) => [p.id, p.nome]));
  const precoPadraoSelecionado = servicos.find((s) => s.id === servicoId)?.precoPadrao ?? "";

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clienteId">Cliente *</Label>
          <Select
            name="clienteId"
            items={clienteItems}
            value={clienteId}
            onValueChange={(value) => setClienteId(value ?? "")}
          >
            <SelectTrigger id="clienteId" className="w-full">
              <SelectValue placeholder="Selecione o cliente" />
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
          <Label htmlFor="petId">Pet</Label>
          <Select
            name="petId"
            items={petItems}
            disabled={!clienteId}
            key={clienteId}
          >
            <SelectTrigger id="petId" className="w-full">
              <SelectValue
                placeholder={clienteId ? "Selecione o pet" : "Escolha o cliente primeiro"}
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
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            name="descricao"
            placeholder="Consulta, vacina, cirurgia..."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valor">Valor (R$) *</Label>
          <Input
            id="valor"
            name="valor"
            type="number"
            step="0.01"
            min="0"
            defaultValue={precoPadraoSelecionado}
            key={precoPadraoSelecionado}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataVencimento">Vencimento</Label>
          <Input id="dataVencimento" name="dataVencimento" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="servicoId">Serviço realizado</Label>
          <Select
            name="servicoId"
            items={servicoItems}
            value={servicoId}
            onValueChange={(value) => setServicoId(value ?? "")}
          >
            <SelectTrigger id="servicoId" className="w-full">
              <SelectValue placeholder="Vincular a um serviço (opcional)" />
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
          <Label htmlFor="profissionalId">Profissional</Label>
          <Select name="profissionalId" items={profissionalItems} disabled={!servicoId}>
            <SelectTrigger id="profissionalId" className="w-full">
              <SelectValue
                placeholder={servicoId ? "Quem realizou o serviço" : "Escolha o serviço primeiro"}
              />
            </SelectTrigger>
            <SelectContent>
              {profissionais.map((profissional) => (
                <SelectItem key={profissional.id} value={profissional.id}>
                  {profissional.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea id="observacoes" name="observacoes" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Lançar cobrança</Button>
      </div>
    </form>
  );
}
