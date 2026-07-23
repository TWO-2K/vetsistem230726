"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Servico = {
  nome: string;
  precoPadrao: number;
  percentualComissao: number;
};

export function ServicoForm({
  servico,
  action,
}: {
  servico?: Servico;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            name="nome"
            defaultValue={servico?.nome}
            placeholder="Ex: Consulta, Banho, Vacina..."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="precoPadrao">Preço padrão (R$) *</Label>
          <Input
            id="precoPadrao"
            name="precoPadrao"
            type="number"
            min="0"
            step="0.01"
            defaultValue={servico?.precoPadrao}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="percentualComissao">Comissão (%)</Label>
          <Input
            id="percentualComissao"
            name="percentualComissao"
            type="number"
            min="0"
            max="100"
            step="0.1"
            defaultValue={servico?.percentualComissao ?? 0}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">{servico ? "Salvar alterações" : "Cadastrar serviço"}</Button>
      </div>
    </form>
  );
}
