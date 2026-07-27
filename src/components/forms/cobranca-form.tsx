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
          <Label htmlFor="clienteId" className="text-text-secondary">
            Cliente <span className="text-danger">*</span>
          </Label>
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
          <Label htmlFor="petId" className="text-text-secondary">
            Pet
          </Label>
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
          <Label htmlFor="descricao" className="text-text-secondary">
            Descrição <span className="text-danger">*</span>
          </Label>
          <Input
            id="descricao"
            name="descricao"
            placeholder="Consulta, vacina, cirurgia..."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valor" className="text-text-secondary">
            Valor (R$) <span className="text-danger">*</span>
          </Label>
          <Input
            id="valor"
            name="valor"
            type="number"
            step="0.01"
            min="0"
            className="font-mono"
            defaultValue={precoPadraoSelecionado}
            key={precoPadraoSelecionado}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataVencimento" className="text-text-secondary">
            Vencimento
          </Label>
          <Input
            id="dataVencimento"
            name="dataVencimento"
            type="date"
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="servicoId" className="text-text-secondary">
            Serviço realizado
          </Label>
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
          <Label htmlFor="profissionalId" className="text-text-secondary">
            Profissional
          </Label>
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
          <Label htmlFor="observacoes" className="text-text-secondary">
            Observações
          </Label>
          <Textarea id="observacoes" name="observacoes" />
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="submit">Lançar cobrança</Button>
      </div>
    </form>
  );
}
