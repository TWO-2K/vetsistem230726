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
import { Plus, Users } from "lucide-react";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Tutores cadastrados na clínica.</p>
        </div>
        <Button render={<Link href="/clientes/novo" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Novo cliente
        </Button>
      </div>

      <form className="max-w-sm">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome..."
          className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </form>

      <Card>
        <CardContent className="p-0">
          {clientes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <Users className="h-8 w-8" />
              <p>Nenhum cliente encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Pets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className="block hover:underline"
                      >
                        {cliente.nome}
                      </Link>
                    </TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell>{cliente.email || "—"}</TableCell>
                    <TableCell>{cliente._count.pets}</TableCell>
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
