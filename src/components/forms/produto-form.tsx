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
    <form action={action} className="space-y-6">
      <div className="space-y-4">
        <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
          Identificação
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nome" className="text-text-secondary">
              Nome <span className="text-danger">*</span>
            </Label>
            <Input
              id="nome"
              name="nome"
              defaultValue={produto?.nome}
              placeholder="Ex: Vacina V10, Seringa 3ml..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-text-secondary">
              Categoria
            </Label>
            <Input
              id="categoria"
              name="categoria"
              defaultValue={produto?.categoria ?? ""}
              placeholder="Medicamento, insumo..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unidadeMedida" className="text-text-secondary">
              Unidade de medida <span className="text-danger">*</span>
            </Label>
            <Input
              id="unidadeMedida"
              name="unidadeMedida"
              defaultValue={produto?.unidadeMedida}
              placeholder="UN, ML, MG, KG..."
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
          Estoque e preços
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {!produto && (
            <div className="space-y-2">
              <Label htmlFor="quantidadeInicial" className="text-text-secondary">
                Quantidade inicial
              </Label>
              <Input
                id="quantidadeInicial"
                name="quantidadeInicial"
                type="number"
                min="0"
                step="0.01"
                className="font-mono"
                defaultValue="0"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="quantidadeMinima" className="text-text-secondary">
              Quantidade mínima (alerta)
            </Label>
            <Input
              id="quantidadeMinima"
              name="quantidadeMinima"
              type="number"
              min="0"
              step="0.01"
              className="font-mono"
              defaultValue={produto?.quantidadeMinima ?? 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precoCusto" className="text-text-secondary">
              Preço de custo (R$)
            </Label>
            <Input
              id="precoCusto"
              name="precoCusto"
              type="number"
              min="0"
              step="0.01"
              className="font-mono"
              defaultValue={produto?.precoCusto ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precoVenda" className="text-text-secondary">
              Preço de venda (R$)
            </Label>
            <Input
              id="precoVenda"
              name="precoVenda"
              type="number"
              min="0"
              step="0.01"
              className="font-mono"
              defaultValue={produto?.precoVenda ?? ""}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="submit">{produto ? "Salvar alterações" : "Cadastrar produto"}</Button>
      </div>
    </form>
  );
}
