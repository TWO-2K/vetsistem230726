"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { criarInternacao } from "@/actions/internacoes";
import { BedDouble } from "lucide-react";

export function InternacaoQuickAdd({ petId }: { petId: string }) {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <Button type="button" variant="outline" onClick={() => setAberto(true)}>
        <BedDouble className="h-4 w-4" /> Internar pet
      </Button>
    );
  }

  return (
    <form action={criarInternacao} className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <input type="hidden" name="petId" value={petId} />
      <div className="space-y-2">
        <Label htmlFor="motivo">Motivo *</Label>
        <Input id="motivo" name="motivo" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setAberto(false)}>
          Cancelar
        </Button>
        <Button type="submit">Internar</Button>
      </div>
    </form>
  );
}
