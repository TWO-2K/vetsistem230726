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
  precoVenda: number | null;
};

type Linha = {
  chave: string;
  produtoId: string;
  quantidade: string;
  precoUnitario: string;
};

export function VendaItemPicker({ produtos }: { produtos: ProdutoOption[] }) {
  const [linhas, setLinhas] = useState<Linha[]>([]);

  const produtoItems = Object.fromEntries(
    produtos.map((p) => [p.id, `${p.nome} (${p.unidadeMedida})`])
  );

  const linhasValidas = linhas.filter(
    (l) => l.produtoId && Number(l.quantidade) > 0 && Number(l.precoUnitario) >= 0
  );
  const serializado = JSON.stringify(
    linhasValidas.map((l) => ({
      produtoId: l.produtoId,
      quantidade: l.quantidade,
      precoUnitario: l.precoUnitario,
    }))
  );
  const total = linhasValidas.reduce(
    (soma, l) => soma + Number(l.quantidade) * Number(l.precoUnitario),
    0
  );

  function adicionarLinha() {
    setLinhas((atual) => [
      ...atual,
      { chave: crypto.randomUUID(), produtoId: "", quantidade: "1", precoUnitario: "" },
    ]);
  }

  function atualizarLinha(chave: string, alteracoes: Partial<Linha>) {
    setLinhas((atual) =>
      atual.map((l) => (l.chave === chave ? { ...l, ...alteracoes } : l))
    );
  }

  function selecionarProduto(chave: string, produtoId: string) {
    const produto = produtos.find((p) => p.id === produtoId);
    atualizarLinha(chave, {
      produtoId,
      precoUnitario: produto?.precoVenda != null ? String(produto.precoVenda) : "",
    });
  }

  function removerLinha(chave: string) {
    setLinhas((atual) => atual.filter((l) => l.chave !== chave));
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="itensVenda" value={serializado} />
      {linhas.map((linha) => (
        <div key={linha.chave} className="flex items-center gap-2">
          <Select
            items={produtoItems}
            value={linha.produtoId}
            onValueChange={(value) => selecionarProduto(linha.chave, value ?? "")}
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
            onChange={(e) => atualizarLinha(linha.chave, { quantidade: e.target.value })}
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            className="w-28"
            value={linha.precoUnitario}
            onChange={(e) =>
              atualizarLinha(linha.chave, { precoUnitario: e.target.value })
            }
          />
          <span className="w-28 text-right text-sm text-muted-foreground">
            {(
              Number(linha.quantidade || 0) * Number(linha.precoUnitario || 0)
            ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
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
      <div className="flex justify-end pt-2 text-lg font-bold">
        Total: {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </div>
    </div>
  );
}
