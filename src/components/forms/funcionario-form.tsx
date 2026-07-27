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
    <form action={action} className="space-y-6">
      <div className="space-y-4">
        <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
          Identificação
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-text-secondary">
              Nome <span className="text-danger">*</span>
            </Label>
            <Input id="nome" name="nome" defaultValue={funcionario?.nome} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-text-secondary">
              E-mail <span className="text-danger">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={funcionario?.email}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="papel" className="text-text-secondary">
              Papel <span className="text-danger">*</span>
            </Label>
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
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
          Acesso
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="senha" className="text-text-secondary">
              {funcionario ? "Nova senha" : (
                <>
                  Senha <span className="text-danger">*</span>
                </>
              )}
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
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
