"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Produto = {
  nome: string;
  categoria: string | null;
  unidadeMedida: string;
  quantidadeMinima: number;
  precoCusto: number | null;
  precoVenda: number | null;
};

export function ProdutoForm({
  produto,
  action,
}: {
  produto?: Produto;
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
            defaultValue={produto?.nome}
            placeholder="Ex: Vacina V10, Seringa 3ml..."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Input
            id="categoria"
            name="categoria"
            defaultValue={produto?.categoria ?? ""}
            placeholder="Medicamento, insumo..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unidadeMedida">Unidade de medida *</Label>
          <Input
            id="unidadeMedida"
            name="unidadeMedida"
            defaultValue={produto?.unidadeMedida}
            placeholder="UN, ML, MG, KG..."
            required
          />
        </div>
        {!produto && (
          <div className="space-y-2">
            <Label htmlFor="quantidadeInicial">Quantidade inicial</Label>
            <Input
              id="quantidadeInicial"
              name="quantidadeInicial"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="quantidadeMinima">Quantidade mínima (alerta)</Label>
          <Input
            id="quantidadeMinima"
            name="quantidadeMinima"
            type="number"
            min="0"
            step="0.01"
            defaultValue={produto?.quantidadeMinima ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="precoCusto">Preço de custo (R$)</Label>
          <Input
            id="precoCusto"
            name="precoCusto"
            type="number"
            min="0"
            step="0.01"
            defaultValue={produto?.precoCusto ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="precoVenda">Preço de venda (R$)</Label>
          <Input
            id="precoVenda"
            name="precoVenda"
            type="number"
            min="0"
            step="0.01"
            defaultValue={produto?.precoVenda ?? ""}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">{produto ? "Salvar alterações" : "Cadastrar produto"}</Button>
      </div>
    </form>
  );
}
