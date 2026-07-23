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

export function AgendamentoForm({
  clientes,
  action,
}: {
  clientes: ClienteComPets[];
  action: (formData: FormData) => void;
}) {
  const [clienteId, setClienteId] = useState<string>("");
  const petsDoCliente =
    clientes.find((c) => c.id === clienteId)?.pets ?? [];

  const clienteItems = Object.fromEntries(
    clientes.map((c) => [c.id, c.nome])
  );
  const petItems = Object.fromEntries(
    petsDoCliente.map((p) => [p.id, p.nome])
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clienteId">Tutor *</Label>
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
          <Label htmlFor="petId">Pet *</Label>
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
          <Label htmlFor="dataHora">Data e hora *</Label>
          <Input id="dataHora" name="dataHora" type="datetime-local" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="servico">Serviço *</Label>
          <Input
            id="servico"
            name="servico"
            placeholder="Consulta, vacina, banho..."
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea id="observacoes" name="observacoes" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Agendar</Button>
      </div>
    </form>
  );
}
