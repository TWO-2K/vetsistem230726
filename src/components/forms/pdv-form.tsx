"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

type ServicoOption = {
  id: string;
  nome: string;
  precoPadrao: number;
};

type Profissional = {
  id: string;
  nome: string;
};

export function PdvForm({
  clientes,
  produtos,
  servicos,
  profissionais,
  action,
}: {
  clientes: ClienteComPets[];
  produtos: ProdutoOption[];
  servicos: ServicoOption[];
  profissionais: Profissional[];
  action: (formData: FormData) => void;
}) {
  const [clienteId, setClienteId] = useState("");
  const petsDoCliente = clientes.find((c) => c.id === clienteId)?.pets ?? [];

  const clienteItems = Object.fromEntries(clientes.map((c) => [c.id, c.nome]));
  const petItems = Object.fromEntries(petsDoCliente.map((p) => [p.id, p.nome]));

  return (
    <form action={action} className="space-y-6">
      <Card className="shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
            Cliente e pet
          </p>
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
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="space-y-3 pt-6">
          <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
            Itens da venda
          </p>
          <VendaItemPicker produtos={produtos} servicos={servicos} profissionais={profissionais} />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="space-y-2 pt-6 sm:w-64">
          <Label htmlFor="formaPagamento" className="text-text-secondary">
            Forma de pagamento <span className="text-danger">*</span>
          </Label>
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
        </CardContent>
      </Card>

      <div className="flex justify-end border-t border-border pt-4">
        <Button
          type="submit"
          size="lg"
          className="bg-brand-accent text-brand-accent-foreground hover:bg-brand-accent-hover"
        >
          Finalizar venda
        </Button>
      </div>
    </form>
  );
}
