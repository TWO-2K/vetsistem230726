import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getRelatorioAtendimentos } from "@/lib/relatorios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, CalendarDays } from "lucide-react";
import { TIPO_PRONTUARIO_LABEL } from "@/lib/labels";
import { TipoProntuario } from "@/generated/prisma/client";

function paraInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function RelatorioAtendimentosPage({
  searchParams,
}: {
  searchParams: Promise<{ inicio?: string; fim?: string; usuarioId?: string }>;
}) {
  const session = await requireSession();
  if (!isAdmin(session.user.papel)) redirect("/dashboard");

  const params = await searchParams;
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  const inicio = params.inicio ? new Date(`${params.inicio}T00:00:00`) : inicioMes;
  const fim = params.fim ? new Date(`${params.fim}T23:59:59`) : hoje;
  const usuarioId = params.usuarioId || undefined;

  const [usuarios, { prontuarios, porVeterinario, porTipo }] = await Promise.all([
    prisma.usuario.findMany({
      where: { tenantId: session.user.tenantId, ativo: true },
      orderBy: { nome: "asc" },
    }),
    getRelatorioAtendimentos(session.user.tenantId, inicio, fim, usuarioId),
  ]);

  const usuarioItems = Object.fromEntries(usuarios.map((u) => [u.id, u.nome]));

  const query = `inicio=${paraInputDate(inicio)}&fim=${paraInputDate(fim)}${
    usuarioId ? `&usuarioId=${usuarioId}` : ""
  }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
            Atendimentos por período
          </h1>
          <p className="text-sm text-text-secondary">
            Prontuários registrados no intervalo selecionado.
          </p>
        </div>
        <Button render={<Link href={`/relatorios/atendimentos/export?${query}`} />} nativeButton={false} variant="outline">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="inicio" className="text-sm font-medium text-text-secondary">
            De
          </label>
          <Input
            id="inicio"
            type="date"
            name="inicio"
            className="h-9 w-auto font-mono"
            defaultValue={paraInputDate(inicio)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="fim" className="text-sm font-medium text-text-secondary">
            Até
          </label>
          <Input
            id="fim"
            type="date"
            name="fim"
            className="h-9 w-auto font-mono"
            defaultValue={paraInputDate(fim)}
          />
        </div>
        <div className="w-56 space-y-1">
          <label htmlFor="usuarioId" className="text-sm font-medium text-text-secondary">
            Veterinário
          </label>
          <Select name="usuarioId" items={usuarioItems} defaultValue={usuarioId}>
            <SelectTrigger id="usuarioId" className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              {usuarios.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Total de atendimentos
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold tracking-tight text-text">
            {prontuarios.length}
          </CardContent>
        </Card>
        {[...porVeterinario.entries()].map(([nome, count]) => (
          <Card key={nome} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                {nome}
              </CardTitle>
            </CardHeader>
            <CardContent className="font-mono text-3xl font-semibold tracking-tight text-text">
              {count}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(TIPO_PRONTUARIO_LABEL) as TipoProntuario[])
          .filter((tipo) => porTipo[tipo] > 0)
          .map((tipo) => (
            <span
              key={tipo}
              className="rounded-full bg-bg-sunken px-3 py-1 text-xs font-medium text-text-secondary"
            >
              {TIPO_PRONTUARIO_LABEL[tipo]}: {porTipo[tipo]}
            </span>
          ))}
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {prontuarios.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-text-tertiary">
                <CalendarDays className="h-6 w-6" />
              </div>
              <p className="text-text-secondary">Nenhum atendimento no período.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Data</TableHead>
                  <TableHead>Pet</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Veterinário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prontuarios.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-text-secondary">
                      {p.data.toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-medium text-text">{p.pet.nome}</TableCell>
                    <TableCell className="text-text-secondary">{p.pet.cliente.nome}</TableCell>
                    <TableCell className="text-text-secondary">
                      {TIPO_PRONTUARIO_LABEL[p.tipo]}
                    </TableCell>
                    <TableCell className="text-text-secondary">{p.usuario.nome}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
