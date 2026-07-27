import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cliente } from "@/generated/prisma/client";

export function ClienteForm({
  cliente,
  action,
}: {
  cliente?: Cliente;
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
            <Input id="nome" name="nome" defaultValue={cliente?.nome} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-text-secondary">
              Telefone <span className="text-danger">*</span>
            </Label>
            <Input
              id="telefone"
              name="telefone"
              className="font-mono"
              defaultValue={cliente?.telefone}
              placeholder="(00) 00000-0000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-text-secondary">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={cliente?.email ?? ""}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
          Documentos e endereço
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-text-secondary">
              CPF
            </Label>
            <Input
              id="cpf"
              name="cpf"
              className="font-mono"
              defaultValue={cliente?.cpf ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endereco" className="text-text-secondary">
              Endereço
            </Label>
            <Input
              id="endereco"
              name="endereco"
              defaultValue={cliente?.endereco ?? ""}
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
