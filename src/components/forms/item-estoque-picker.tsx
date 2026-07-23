"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

type ProdutoOption = {
  id: string;
  nome: string;
  unidadeMedida: string;
  quantidadeAtual: number;
};

type Linha = { chave: string; produtoId: string; quantidade: string };

export function ItemEstoquePicker({ produtos }: { produtos: ProdutoOption[] }) {
  const [linhas, setLinhas] = useState<Linha[]>([]);

  const produtoItems = Object.fromEntries(
    produtos.map((p) => [p.id, `${p.nome} (${p.unidadeMedida})`])
  );

  const serializado = JSON.stringify(
    linhas
      .filter((l) => l.produtoId && Number(l.quantidade) > 0)
      .map((l) => ({ produtoId: l.produtoId, quantidade: l.quantidade }))
  );

  function adicionarLinha() {
    setLinhas((atual) => [
      ...atual,
      { chave: crypto.randomUUID(), produtoId: "", quantidade: "1" },
    ]);
  }

  function atualizarLinha(chave: string, alteracoes: Partial<Linha>) {
    setLinhas((atual) =>
      atual.map((l) => (l.chave === chave ? { ...l, ...alteracoes } : l))
    );
  }

  function removerLinha(chave: string) {
    setLinhas((atual) => atual.filter((l) => l.chave !== chave));
  }

  if (produtos.length === 0) {
    return (
      <input type="hidden" name="itensEstoque" value={serializado} />
    );
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="itensEstoque" value={serializado} />
      {linhas.map((linha) => (
        <div key={linha.chave} className="flex items-center gap-2">
          <Select
            items={produtoItems}
            value={linha.produtoId}
            onValueChange={(value) =>
              atualizarLinha(linha.chave, { produtoId: value ?? "" })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o produto" />
            </SelectTrigger>
            <SelectContent>
              {produtos.map((produto) => (
                <SelectItem key={produto.id} value={produto.id}>
                  {produto.nome} ({produto.unidadeMedida})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min="0"
            step="0.01"
            className="w-24"
            value={linha.quantidade}
            onChange={(e) =>
              atualizarLinha(linha.chave, { quantidade: e.target.value })
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removerLinha(linha.chave)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={adicionarLinha}>
        <Plus className="h-4 w-4" /> Adicionar item
      </Button>
    </div>
  );
}
