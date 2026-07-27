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
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-text">
          Internações
        </h1>
        <p className="text-text-secondary">
          Pets internados e histórico de internações.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {internacoes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-text-tertiary">
                <BedDouble className="h-6 w-6" />
              </div>
              <p className="text-text-secondary">
                Nenhuma internação registrada.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
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
                    <TableCell className="font-medium text-text">
                      <Link
                        href={`/internacoes/${internacao.id}`}
                        className="block hover:underline"
                      >
                        {internacao.pet.nome}
                      </Link>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {internacao.pet.cliente.nome}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {internacao.motivo}
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">
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
