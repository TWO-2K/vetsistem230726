import { notFound } from "next/navigation";
import { requireSuperAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  atualizarEmpresa,
  suspenderEmpresa,
  ativarEmpresa,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Power, PowerOff } from "lucide-react";
import { PAPEL_LABEL, STATUS_TENANT_LABEL, STATUS_TENANT_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";

export default async function EmpresaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdminSession();
  const { id } = await params;

  const [tenant, planos] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id },
      include: { usuarios: { orderBy: { nome: "asc" } } },
    }),
    prisma.plano.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!tenant) notFound();

  const planoItems = Object.fromEntries(planos.map((p) => [p.id, p.nome]));

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            {tenant.nome}
          </h1>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              STATUS_TENANT_COLOR[tenant.status]
            )}
          >
            {STATUS_TENANT_LABEL[tenant.status]}
          </span>
        </div>
        <form
          action={
            tenant.status === "SUSPENSO"
              ? ativarEmpresa.bind(null, tenant.id)
              : suspenderEmpresa.bind(null, tenant.id)
          }
        >
          <Button type="submit" variant="outline">
            {tenant.status === "SUSPENSO" ? (
              <>
                <Power className="h-4 w-4" /> Ativar
              </>
            ) : (
              <>
                <PowerOff className="h-4 w-4" /> Suspender
              </>
            )}
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={atualizarEmpresa.bind(null, tenant.id)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da empresa *</Label>
              <Input id="nome" name="nome" defaultValue={tenant.nome} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planoId">Plano</Label>
              <Select
                name="planoId"
                items={planoItems}
                defaultValue={tenant.planoId ?? undefined}
              >
                <SelectTrigger id="planoId" className="w-full">
                  <SelectValue placeholder="Sem plano" />
                </SelectTrigger>
                <SelectContent>
                  {planos.map((plano) => (
                    <SelectItem key={plano.id} value={plano.id}>
                      {plano.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenant.usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">
                    {usuario.nome}
                    {!usuario.ativo && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Inativo)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{PAPEL_LABEL[usuario.papel]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
