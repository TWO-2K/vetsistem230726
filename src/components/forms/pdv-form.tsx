"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VendaItemPicker } from "@/components/forms/venda-item-picker";
import { FORMA_PAGAMENTO_LABEL } from "@/lib/labels";

type ClienteComPets = {
  id: string;
  nome: string;
  pets: { id: string; nome: string }[];
};

type ProdutoOption = {
  id: string;
  nome: string;
  unidadeMedida: string;
  quantidadeAtual: number;
  precoVenda: number | null;
};

export function PdvForm({
  clientes,
  produtos,
  action,
}: {
  clientes: ClienteComPets[];
  produtos: ProdutoOption[];
  action: (formData: FormData) => void;
}) {
  const [clienteId, setClienteId] = useState("");
  const petsDoCliente = clientes.find((c) => c.id === clienteId)?.pets ?? [];

  const clienteItems = Object.fromEntries(clientes.map((c) => [c.id, c.nome]));
  const petItems = Object.fromEntries(petsDoCliente.map((p) => [p.id, p.nome]));

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
          <Select name="petId" items={petItems} disabled={!clienteId} key={clienteId}>
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
      </div>

      <div className="space-y-2">
        <Label>Itens</Label>
        <VendaItemPicker produtos={produtos} />
      </div>

      <div className="space-y-2 sm:w-64">
        <Label htmlFor="formaPagamento">Forma de pagamento *</Label>
        <Select name="formaPagamento" items={FORMA_PAGAMENTO_LABEL} defaultValue="DINHEIRO">
          <SelectTrigger id="formaPagamento" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(FORMA_PAGAMENTO_LABEL) as (keyof typeof FORMA_PAGAMENTO_LABEL)[]).map(
              (forma) => (
                <SelectItem key={forma} value={forma}>
                  {FORMA_PAGAMENTO_LABEL[forma]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Finalizar venda</Button>
      </div>
    </form>
  );
}
