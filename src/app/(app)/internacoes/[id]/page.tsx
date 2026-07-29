import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { podeAtenderClinico } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BedDouble } from "lucide-react";
import { adicionarEvolucao, darAlta } from "@/actions/internacoes";
import { STATUS_INTERNACAO_LABEL, STATUS_INTERNACAO_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";

export default async function InternacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const podeAgir = podeAtenderClinico(session.user.papel);

  const internacao = await prisma.internacao.findUnique({
    where: { id, tenantId: session.user.tenantId },
    include: {
      pet: { include: { cliente: true } },
      usuario: true,
      evolucoes: { orderBy: { data: "desc" }, include: { usuario: true } },
    },
  });

  if (!internacao) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/pets/${internacao.pet.id}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {internacao.pet.nome}
      </Link>

      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
              <BedDouble className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
                  {internacao.pet.nome}
                </h1>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    STATUS_INTERNACAO_COLOR[internacao.status]
                  )}
                >
                  {STATUS_INTERNACAO_LABEL[internacao.status]}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                Tutor: {internacao.pet.cliente.nome}
              </p>
              <p className="text-sm text-text">
                <span className="font-medium">Motivo: </span>
                {internacao.motivo}
              </p>
              {internacao.observacoes && (
                <p className="text-sm text-text">
                  <span className="font-medium">Observações: </span>
                  {internacao.observacoes}
                </p>
              )}
              <p className="font-mono text-xs text-text-tertiary">
                Entrada em {internacao.dataEntrada.toLocaleString("pt-BR")} por{" "}
                {internacao.usuario.nome}
                {internacao.dataAlta &&
                  ` · Alta em ${internacao.dataAlta.toLocaleString("pt-BR")}`}
              </p>
            </div>
          </div>
          {podeAgir && internacao.status === "ATIVA" && (
            <form action={darAlta.bind(null, internacao.id, internacao.pet.id)}>
              <Button type="submit" variant="outline" size="sm">
                Dar alta
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {podeAgir && internacao.status === "ATIVA" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Nova evolução</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={adicionarEvolucao} className="space-y-3">
              <input type="hidden" name="internacaoId" value={internacao.id} />
              <div className="space-y-2">
                <Label htmlFor="texto" className="text-text-secondary">
                  Evolução clínica
                </Label>
                <Textarea id="texto" name="texto" rows={3} required />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Adicionar evolução</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Evoluções</CardTitle>
        </CardHeader>
        <CardContent>
          {internacao.evolucoes.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Nenhuma evolução registrada ainda.
            </p>
          ) : (
            <div className="space-y-4 divide-y divide-border">
              {internacao.evolucoes.map((evolucao) => (
                <div key={evolucao.id} className="pt-4 first:pt-0">
                  <p className="font-mono text-xs text-text-tertiary">
                    {evolucao.data.toLocaleString("pt-BR")} ·{" "}
                    {evolucao.usuario.nome}
                  </p>
                  <p className="mt-1 text-sm text-text">{evolucao.texto}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
