import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Usuario } from "@/generated/prisma/client";
import { PAPEL_LABEL } from "@/lib/labels";

export function FuncionarioForm({
  funcionario,
  action,
}: {
  funcionario?: Usuario;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" name="nome" defaultValue={funcionario?.nome} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={funcionario?.email}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="papel">Papel *</Label>
          <Select
            name="papel"
            items={PAPEL_LABEL}
            defaultValue={funcionario?.papel ?? "VET"}
          >
            <SelectTrigger id="papel" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PAPEL_LABEL) as (keyof typeof PAPEL_LABEL)[]).map(
                (papel) => (
                  <SelectItem key={papel} value={papel}>
                    {PAPEL_LABEL[papel]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="senha">
            {funcionario ? "Nova senha" : "Senha *"}
          </Label>
          <Input
            id="senha"
            name="senha"
            type="password"
            placeholder={funcionario ? "Deixe em branco para manter" : ""}
            required={!funcionario}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
