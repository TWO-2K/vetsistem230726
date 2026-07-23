"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { criarVacina } from "@/actions/vacinas";
import { Syringe } from "lucide-react";

export function VacinaQuickAdd({ petId }: { petId: string }) {
  const [aberto, setAberto] = useState(false);
  const hoje = new Date().toISOString().slice(0, 10);

  if (!aberto) {
    return (
      <Button type="button" variant="outline" onClick={() => setAberto(true)}>
        <Syringe className="h-4 w-4" /> Registrar vacina
      </Button>
    );
  }

  return (
    <form action={criarVacina} className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <input type="hidden" name="petId" value={petId} />
      <div className="space-y-2">
        <Label htmlFor="nome">Vacina *</Label>
        <Input id="nome" name="nome" placeholder="V10, Antirrábica..." required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dataAplicacao">Data de aplicação *</Label>
          <Input
            id="dataAplicacao"
            name="dataAplicacao"
            type="date"
            defaultValue={hoje}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="proximaDose">Próxima dose</Label>
          <Input id="proximaDose" name="proximaDose" type="date" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
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
