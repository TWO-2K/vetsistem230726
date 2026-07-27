import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pet } from "@/generated/prisma/client";

export function PetForm({
  pet,
  clienteId,
  action,
}: {
  pet?: Pet;
  clienteId: string;
  action: (formData: FormData) => void;
}) {
  const dataNascimento = pet?.dataNascimento
    ? pet.dataNascimento.toISOString().slice(0, 10)
    : "";

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="clienteId" value={clienteId} />

      <div className="space-y-4">
        <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
          Identificação
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-text-secondary">
              Nome <span className="text-danger">*</span>
            </Label>
            <Input id="nome" name="nome" defaultValue={pet?.nome} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="especie" className="text-text-secondary">
              Espécie <span className="text-danger">*</span>
            </Label>
            <Input
              id="especie"
              name="especie"
              defaultValue={pet?.especie}
              placeholder="Cão, gato..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="raca" className="text-text-secondary">
              Raça
            </Label>
            <Input id="raca" name="raca" defaultValue={pet?.raca ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sexo" className="text-text-secondary">
              Sexo
            </Label>
            <Select
              name="sexo"
              items={{ MACHO: "Macho", FEMEA: "Fêmea" }}
              defaultValue={pet?.sexo ?? undefined}
            >
              <SelectTrigger id="sexo" className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MACHO">Macho</SelectItem>
                <SelectItem value="FEMEA">Fêmea</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
          Detalhes clínicos
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dataNascimento" className="text-text-secondary">
              Data de nascimento
            </Label>
            <Input
              id="dataNascimento"
              name="dataNascimento"
              type="date"
              className="font-mono"
              defaultValue={dataNascimento}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="peso" className="text-text-secondary">
              Peso (kg)
            </Label>
            <Input
              id="peso"
              name="peso"
              type="number"
              step="0.01"
              min="0"
              className="font-mono"
              defaultValue={pet?.peso ?? ""}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="observacoes" className="text-text-secondary">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              defaultValue={pet?.observacoes ?? ""}
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
