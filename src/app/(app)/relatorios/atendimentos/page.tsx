import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getRelatorioAtendimentos } from "@/lib/relatorios";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            Atendimentos por período
          </h1>
          <p className="text-muted-foreground">
            Prontuários registrados no intervalo selecionado.
          </p>
        </div>
        <Button render={<Link href={`/relatorios/atendimentos/export?${query}`} />} nativeButton={false} variant="outline">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="inicio" className="text-sm font-medium">
            De
          </label>
          <input
            id="inicio"
            type="date"
            name="inicio"
            defaultValue={paraInputDate(inicio)}
            className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="fim" className="text-sm font-medium">
            Até
          </label>
          <input
            id="fim"
            type="date"
            name="fim"
            defaultValue={paraInputDate(fim)}
            className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="w-56 space-y-1">
          <label htmlFor="usuarioId" className="text-sm font-medium">
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de atendimentos
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-3xl font-extrabold tracking-tight">
            {prontuarios.length}
          </CardContent>
        </Card>
        {[...porVeterinario.entries()].map(([nome, count]) => (
          <Card key={nome}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {nome}
              </CardTitle>
            </CardHeader>
            <CardContent className="font-display text-3xl font-extrabold tracking-tight">
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
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {TIPO_PRONTUARIO_LABEL[tipo]}: {porTipo[tipo]}
            </span>
          ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {prontuarios.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <CalendarDays className="h-8 w-8" />
              <p>Nenhum atendimento no período.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell>{p.data.toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="font-medium">{p.pet.nome}</TableCell>
                    <TableCell>{p.pet.cliente.nome}</TableCell>
                    <TableCell>{TIPO_PRONTUARIO_LABEL[p.tipo]}</TableCell>
                    <TableCell>{p.usuario.nome}</TableCell>
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
