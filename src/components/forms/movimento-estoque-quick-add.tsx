"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registrarMovimentoEstoque } from "@/actions/estoque";
import { TIPO_MOVIMENTO_LABEL } from "@/lib/labels";
import { TipoMovimentoEstoque } from "@/generated/prisma/client";
import { ArrowDownUp } from "lucide-react";

const TIPOS = Object.keys(TIPO_MOVIMENTO_LABEL) as TipoMovimentoEstoque[];

export function MovimentoEstoqueQuickAdd({ produtoId }: { produtoId: string }) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<TipoMovimentoEstoque>("ENTRADA");

  if (!aberto) {
    return (
      <Button type="button" variant="outline" onClick={() => setAberto(true)}>
        <ArrowDownUp className="h-4 w-4" /> Registrar movimentação
      </Button>
    );
  }

  return (
    <form
      action={registrarMovimentoEstoque}
      className="space-y-3 rounded-lg border border-border bg-bg-sunken p-4"
    >
      <input type="hidden" name="produtoId" value={produtoId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tipo" className="text-text-secondary">
            Tipo <span className="text-danger">*</span>
          </Label>
          <Select
            name="tipo"
            items={TIPO_MOVIMENTO_LABEL}
            value={tipo}
            onValueChange={(value) =>
              setTipo((value as TipoMovimentoEstoque) ?? "ENTRADA")
            }
          >
            <SelectTrigger id="tipo" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS.map((t) => (
                <SelectItem key={t} value={t}>
                  {TIPO_MOVIMENTO_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantidade" className="text-text-secondary">
            Quantidade{" "}
            {tipo === "AJUSTE" ? (
              "(use negativo para reduzir)"
            ) : (
              <span className="text-danger">*</span>
            )}
          </Label>
          <Input
            id="quantidade"
            name="quantidade"
            type="number"
            step="0.01"
            min={tipo === "AJUSTE" ? undefined : "0"}
            className="font-mono"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="observacoes" className="text-text-secondary">
          Observações
        </Label>
        <Textarea id="observacoes" name="observacoes" rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setAberto(false)}>
          Cancelar
        </Button>
        <Button type="submit">Registrar</Button>
      </div>
    </form>
  );
}
