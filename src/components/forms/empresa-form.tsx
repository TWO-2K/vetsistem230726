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

      <div className="space-y-4">
        <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
          Identificação
        </p>
        <div className="space-y-2">
          <Label className="text-text-secondary">Logo</Label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-border bg-bg-sunken">
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
                <Building2 className="h-8 w-8 text-text-tertiary" />
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
                  className="w-fit text-xs text-text-tertiary hover:text-danger"
                >
                  Remover logo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-text-secondary">
              Nome da empresa <span className="text-danger">*</span>
            </Label>
            <Input id="nome" name="nome" defaultValue={empresa.nome} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj" className="text-text-secondary">
              CNPJ
            </Label>
            <Input id="cnpj" name="cnpj" className="font-mono" defaultValue={empresa.cnpj ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-text-secondary">
              Telefone
            </Label>
            <Input
              id="telefone"
              name="telefone"
              className="font-mono"
              defaultValue={empresa.telefone ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-text-secondary">
              E-mail
            </Label>
            <Input id="email" name="email" type="email" defaultValue={empresa.email ?? ""} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="endereco" className="text-text-secondary">
              Endereço
            </Label>
            <Textarea id="endereco" name="endereco" defaultValue={empresa.endereco ?? ""} />
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div>
          <h3 className="font-heading text-sm font-semibold text-text">Horário de funcionamento</h3>
          <p className="text-sm text-text-secondary">
            A agenda só permite marcar atendimentos dentro desse horário e nesses dias.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
          <div className="space-y-2">
            <Label htmlFor="horarioInicio" className="text-text-secondary">
              Abre às <span className="text-danger">*</span>
            </Label>
            <Input
              id="horarioInicio"
              name="horarioInicio"
              type="time"
              className="font-mono"
              defaultValue={empresa.horarioInicio}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horarioFim" className="text-text-secondary">
              Fecha às <span className="text-danger">*</span>
            </Label>
            <Input
              id="horarioFim"
              name="horarioFim"
              type="time"
              className="font-mono"
              defaultValue={empresa.horarioFim}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-text-secondary">
            Dias de funcionamento <span className="text-danger">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {DIAS.map((dia) => {
              const ativo = diasSelecionados.includes(dia.valor);
              return (
                <button
                  key={dia.valor}
                  type="button"
                  onClick={() => alternarDia(dia.valor)}
                  className={cn(
                    "h-9 w-14 rounded-lg border text-sm font-medium transition-colors",
                    ativo
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-text-secondary hover:bg-bg-sunken"
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

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="submit">Salvar alterações</Button>
      </div>
    </form>
  );
}
