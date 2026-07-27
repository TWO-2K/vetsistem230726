import Link from "next/link";
import { requireSession } from "@/lib/session";
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
import { Plus, Users, Search } from "lucide-react";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireSession();
  const { q } = await searchParams;

  const clientes = await prisma.cliente.findMany({
    where: {
      tenantId: session.user.tenantId,
      ...(q
        ? { nome: { contains: q, mode: "insensitive" as const } }
        : {}),
    },
    include: { _count: { select: { pets: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-text">
            Clientes
          </h1>
          <p className="text-text-secondary">Tutores cadastrados na clínica.</p>
        </div>
        <Button render={<Link href="/clientes/novo" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Novo cliente
        </Button>
      </div>

      <form className="max-w-sm">
        <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3 text-sm has-focus-within:border-ring has-focus-within:ring-3 has-focus-within:ring-ring/50">
          <Search className="h-4 w-4 shrink-0 text-text-tertiary" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome..."
            className="w-full bg-transparent outline-none placeholder:text-text-tertiary"
          />
        </div>
      </form>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {clientes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-text-tertiary">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-text-secondary">Nenhum cliente encontrado.</p>
              <p className="text-sm text-text-tertiary">
                {q
                  ? "Tente buscar por outro nome."
                  : "Cadastre o primeiro tutor da clínica."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Pets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id} className="cursor-pointer">
                    <TableCell className="font-medium text-text">
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className="block hover:underline"
                      >
                        {cliente.nome}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">
                      {cliente.telefone}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {cliente.email || "—"}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {cliente._count.pets}
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
