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
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" name="nome" defaultValue={cliente?.nome} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            name="telefone"
            defaultValue={cliente?.telefone}
            placeholder="(00) 00000-0000"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={cliente?.email ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" name="cpf" defaultValue={cliente?.cpf ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            name="endereco"
            defaultValue={cliente?.endereco ?? ""}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
