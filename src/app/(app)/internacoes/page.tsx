import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BedDouble } from "lucide-react";
import { STATUS_INTERNACAO_LABEL, STATUS_INTERNACAO_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";

export default async function InternacoesPage() {
  const session = await requireSession();

  const internacoes = await prisma.internacao.findMany({
    where: { tenantId: session.user.tenantId },
    include: { pet: { include: { cliente: true } } },
    orderBy: [{ status: "asc" }, { dataEntrada: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">
          Internações
        </h1>
        <p className="text-muted-foreground">
          Pets internados e histórico de internações.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {internacoes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <BedDouble className="h-8 w-8" />
              <p>Nenhuma internação registrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internacoes.map((internacao) => (
                  <TableRow key={internacao.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link
                        href={`/internacoes/${internacao.id}`}
                        className="block hover:underline"
                      >
                        {internacao.pet.nome}
                      </Link>
                    </TableCell>
                    <TableCell>{internacao.pet.cliente.nome}</TableCell>
                    <TableCell>{internacao.motivo}</TableCell>
                    <TableCell>
                      {internacao.dataEntrada.toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          STATUS_INTERNACAO_COLOR[internacao.status]
                        )}
                      >
                        {STATUS_INTERNACAO_LABEL[internacao.status]}
                      </span>
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
