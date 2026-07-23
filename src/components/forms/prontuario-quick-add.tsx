"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TextareaDitado } from "@/components/forms/textarea-ditado";
import { ItemEstoquePicker } from "@/components/forms/item-estoque-picker";
import { criarProntuario } from "@/actions/prontuarios";
import {
  TIPO_PRONTUARIO_LABEL,
  TIPO_PRONTUARIO_ICON,
  TIPO_PRONTUARIO_COLOR,
} from "@/lib/labels";
import { TipoProntuario } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const TIPOS = Object.keys(TIPO_PRONTUARIO_LABEL) as TipoProntuario[];

type ProdutoOption = {
  id: string;
  nome: string;
  unidadeMedida: string;
  quantidadeAtual: number;
};

export function ProntuarioQuickAdd({
  petId,
  produtos = [],
}: {
  petId: string;
  produtos?: ProdutoOption[];
}) {
  const [tipo, setTipo] = useState<TipoProntuario | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {TIPOS.map((t) => {
          const Icon = TIPO_PRONTUARIO_ICON[t];
          const selecionado = tipo === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(selecionado ? null : t)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 rounded-lg py-3 text-xs font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                TIPO_PRONTUARIO_COLOR[t].solid,
                selecionado && "ring-2 ring-foreground/40 ring-offset-2 ring-offset-background"
              )}
            >
              <Icon className="h-4 w-4" />
              {TIPO_PRONTUARIO_LABEL[t]}
            </button>
          );
        })}
      </div>

      {tipo && (
        <form
          action={criarProntuario}
          className="space-y-3 rounded-lg border bg-muted/30 p-4"
        >
          <input type="hidden" name="petId" value={petId} />
          <input type="hidden" name="tipo" value={tipo} />
          <div className="flex items-center gap-2 text-sm font-medium">
            <span
              className={cn(
                "inline-flex h-2 w-2 rounded-full",
                TIPO_PRONTUARIO_COLOR[tipo].solid
              )}
            />
            Novo registro · {TIPO_PRONTUARIO_LABEL[tipo]}
          </div>
          <div className="space-y-2">
            <Label htmlFor="anamnese">Anamnese</Label>
            <Textarea id="anamnese" name="anamnese" rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diagnostico">Diagnóstico</Label>
            <Textarea id="diagnostico" name="diagnostico" rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prescricao">Prescrição</Label>
            <TextareaDitado id="prescricao" name="prescricao" rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" name="observacoes" rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Itens utilizados (opcional)</Label>
            <ItemEstoquePicker produtos={produtos} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setTipo(null)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar registro</Button>
          </div>
        </form>
      )}
    </div>
  );
}
