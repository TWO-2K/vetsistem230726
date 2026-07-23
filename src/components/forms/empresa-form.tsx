"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const DIAS = [
  { valor: 0, label: "Dom" },
  { valor: 1, label: "Seg" },
  { valor: 2, label: "Ter" },
  { valor: 3, label: "Qua" },
  { valor: 4, label: "Qui" },
  { valor: 5, label: "Sex" },
  { valor: 6, label: "Sáb" },
];

type Empresa = {
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  logoUrl: string | null;
  horarioInicio: string;
  horarioFim: string;
  diasFuncionamento: number[];
};

export function EmpresaForm({
  empresa,
  action,
}: {
  empresa: Empresa;
  action: (formData: FormData) => void;
}) {
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>(
    empresa.diasFuncionamento
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(empresa.logoUrl);
  const [removerLogo, setRemoverLogo] = useState(false);

  function alternarDia(dia: number) {
    setDiasSelecionados((atual) =>
      atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia].sort()
    );
  }

  function selecionarLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setRemoverLogo(false);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(arquivo);
  }

  function removerLogoAtual() {
    setLogoPreview(null);
    setRemoverLogo(true);
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="removerLogo" value={removerLogo ? "true" : "false"} />

      <div className="space-y-2">
        <Label>Logo</Label>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Logo da empresa"
                width={80}
                height={80}
                unoptimized
                className="h-full w-full object-contain"
              />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Input
              type="file"
              name="logo"
              accept="image/*"
              onChange={selecionarLogo}
              className="max-w-64"
            />
            {logoPreview && (
              <button
                type="button"
                onClick={removerLogoAtual}
                className="w-fit text-xs text-muted-foreground hover:text-destructive"
              >
                Remover logo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da empresa *</Label>
          <Input id="nome" name="nome" defaultValue={empresa.nome} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input id="cnpj" name="cnpj" defaultValue={empresa.cnpj ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" name="telefone" defaultValue={empresa.telefone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" defaultValue={empresa.email ?? ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Textarea id="endereco" name="endereco" defaultValue={empresa.endereco ?? ""} />
        </div>
      </div>

      <div className="space-y-3 border-t pt-4">
        <div>
          <h3 className="font-heading text-sm font-semibold">Horário de funcionamento</h3>
          <p className="text-sm text-muted-foreground">
            A agenda só permite marcar atendimentos dentro desse horário e nesses dias.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
          <div className="space-y-2">
            <Label htmlFor="horarioInicio">Abre às *</Label>
            <Input
              id="horarioInicio"
              name="horarioInicio"
              type="time"
              defaultValue={empresa.horarioInicio}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horarioFim">Fecha às *</Label>
            <Input
              id="horarioFim"
              name="horarioFim"
              type="time"
              defaultValue={empresa.horarioFim}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Dias de funcionamento *</Label>
          <div className="flex flex-wrap gap-2">
            {DIAS.map((dia) => {
              const ativo = diasSelecionados.includes(dia.valor);
              return (
                <button
                  key={dia.valor}
                  type="button"
                  onClick={() => alternarDia(dia.valor)}
                  className={cn(
                    "h-9 w-14 rounded-md border text-sm font-medium transition-colors",
                    ativo
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {dia.label}
                </button>
              );
            })}
          </div>
          {diasSelecionados.map((dia) => (
            <input key={dia} type="hidden" name="diasFuncionamento" value={dia} />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Salvar alterações</Button>
      </div>
    </form>
  );
}
