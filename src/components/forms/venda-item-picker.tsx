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

type ServicoOption = {
  id: string;
  nome: string;
  precoPadrao: number;
};

type Profissional = {
  id: string;
  nome: string;
};

type Linha = {
  chave: string;
  tipo: "produto" | "servico";
  produtoId: string;
  servicoId: string;
  profissionalId: string;
  quantidade: string;
  precoUnitario: string;
};

export function VendaItemPicker({
  produtos,
  servicos,
  profissionais,
}: {
  produtos: ProdutoOption[];
  servicos: ServicoOption[];
  profissionais: Profissional[];
}) {
  const [linhas, setLinhas] = useState<Linha[]>([]);

  const produtoItems = Object.fromEntries(
    produtos.map((p) => [p.id, `${p.nome} (${p.unidadeMedida})`])
  );
  const servicoItems = Object.fromEntries(servicos.map((s) => [s.id, s.nome]));
  const profissionalItems = Object.fromEntries(profissionais.map((p) => [p.id, p.nome]));

  const linhasValidas = linhas.filter((l) =>
    l.tipo === "produto"
      ? l.produtoId && Number(l.quantidade) > 0 && Number(l.precoUnitario) >= 0
      : l.servicoId && l.profissionalId && Number(l.precoUnitario) >= 0
  );
  const serializado = JSON.stringify(
    linhasValidas.map((l) =>
      l.tipo === "produto"
        ? {
            tipo: "produto",
            produtoId: l.produtoId,
            quantidade: l.quantidade,
            precoUnitario: l.precoUnitario,
          }
        : {
            tipo: "servico",
            servicoId: l.servicoId,
            profissionalId: l.profissionalId,
            precoUnitario: l.precoUnitario,
          }
    )
  );
  const total = linhasValidas.reduce(
    (soma, l) =>
      soma +
      (l.tipo === "produto" ? Number(l.quantidade) : 1) * Number(l.precoUnitario || 0),
    0
  );

  function adicionarLinha(tipo: "produto" | "servico") {
    setLinhas((atual) => [
      ...atual,
      {
        chave: crypto.randomUUID(),
        tipo,
        produtoId: "",
        servicoId: "",
        profissionalId: "",
        quantidade: "1",
        precoUnitario: "",
      },
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

  function selecionarServico(chave: string, servicoId: string) {
    const servico = servicos.find((s) => s.id === servicoId);
    atualizarLinha(chave, {
      servicoId,
      precoUnitario: servico ? String(servico.precoPadrao) : "",
    });
  }

  function removerLinha(chave: string) {
    setLinhas((atual) => atual.filter((l) => l.chave !== chave));
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="itensVenda" value={serializado} />
      {linhas.length === 0 && (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-text-tertiary">
          Nenhum item adicionado ainda.
        </p>
      )}
      {linhas.map((linha) => (
        <div
          key={linha.chave}
          className="flex items-center gap-2 rounded-lg border border-border bg-bg-sunken/40 p-2"
        >
          {linha.tipo === "produto" ? (
            <>
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
                className="w-24 font-mono"
                value={linha.quantidade}
                onChange={(e) => atualizarLinha(linha.chave, { quantidade: e.target.value })}
              />
            </>
          ) : (
            <>
              <Select
                items={servicoItems}
                value={linha.servicoId}
                onValueChange={(value) => selecionarServico(linha.chave, value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((servico) => (
                    <SelectItem key={servico.id} value={servico.id}>
                      {servico.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                items={profissionalItems}
                value={linha.profissionalId}
                onValueChange={(value) =>
                  atualizarLinha(linha.chave, { profissionalId: value ?? "" })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.map((profissional) => (
                    <SelectItem key={profissional.id} value={profissional.id}>
                      {profissional.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          <Input
            type="number"
            min="0"
            step="0.01"
            className="w-28 font-mono"
            value={linha.precoUnitario}
            onChange={(e) =>
              atualizarLinha(linha.chave, { precoUnitario: e.target.value })
            }
          />
          <span className="w-28 text-right font-mono text-sm text-text-secondary">
            {(
              (linha.tipo === "produto" ? Number(linha.quantidade || 0) : 1) *
              Number(linha.precoUnitario || 0)
            ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removerLinha(linha.chave)}
          >
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => adicionarLinha("produto")}>
          <Plus className="h-4 w-4" /> Adicionar produto
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => adicionarLinha("servico")}>
          <Plus className="h-4 w-4" /> Adicionar serviço
        </Button>
      </div>
      <div className="flex justify-end border-t border-border pt-3">
        <p className="font-mono text-xl font-semibold tracking-tight text-text">
          Total: {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </div>
    </div>
  );
}
