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
import { Syringe } from "lucide-react";
import { STATUS_VACINA_LABEL, STATUS_VACINA_COLOR, getStatusVacina } from "@/lib/labels";
import { cn } from "@/lib/utils";

export default async function VacinasPage() {
  const session = await requireSession();

  const vacinas = await prisma.vacina.findMany({
    where: { tenantId: session.user.tenantId },
    include: { pet: { include: { cliente: true } } },
    orderBy: [{ proximaDose: "asc" }, { dataAplicacao: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
          Vacinas
        </h1>
        <p className="text-sm text-text-secondary">
          Vacinas aplicadas e próximas doses de todos os pets.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {vacinas.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-text-tertiary">
                <Syringe className="h-6 w-6" />
              </div>
              <p className="text-text-secondary">Nenhuma vacina registrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Pet</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Vacina</TableHead>
                  <TableHead>Aplicada em</TableHead>
                  <TableHead>Próxima dose</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vacinas.map((vacina) => {
                  const status = getStatusVacina(vacina.proximaDose);
                  return (
                    <TableRow key={vacina.id}>
                      <TableCell className="font-medium text-text">
                        <Link
                          href={`/pets/${vacina.pet.id}`}
                          className="block hover:underline"
                        >
                          {vacina.pet.nome}
                        </Link>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {vacina.pet.cliente.nome}
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {vacina.nome}
                      </TableCell>
                      <TableCell className="font-mono text-text-secondary">
                        {vacina.dataAplicacao.toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-mono text-text-secondary">
                        {vacina.proximaDose
                          ? vacina.proximaDose.toLocaleDateString("pt-BR")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {status && (
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium",
                              STATUS_VACINA_COLOR[status]
                            )}
                          >
                            {STATUS_VACINA_LABEL[status]}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
