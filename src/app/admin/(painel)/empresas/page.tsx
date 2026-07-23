import Link from "next/link";
import { requireSuperAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Building2 } from "lucide-react";
import { STATUS_TENANT_LABEL, STATUS_TENANT_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";

export default async function EmpresasPage() {
  await requireSuperAdminSession();

  const tenants = await prisma.tenant.findMany({
    include: { plano: true, _count: { select: { usuarios: true } } },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            Empresas
          </h1>
          <p className="text-muted-foreground">
            Clínicas cadastradas na plataforma.
          </p>
        </div>
        <Button render={<Link href="/admin/empresas/novo" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Nova empresa
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {tenants.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <Building2 className="h-8 w-8" />
              <p>Nenhuma empresa cadastrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/empresas/${tenant.id}`}
                        className="block hover:underline"
                      >
                        {tenant.nome}
                      </Link>
                    </TableCell>
                    <TableCell>{tenant.plano?.nome ?? "—"}</TableCell>
                    <TableCell>{tenant._count.usuarios}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          STATUS_TENANT_COLOR[tenant.status]
                        )}
                      >
                        {STATUS_TENANT_LABEL[tenant.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      {tenant.criadoEm.toLocaleDateString("pt-BR")}
                    </TableCell>
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
