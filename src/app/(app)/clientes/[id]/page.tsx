import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, PawPrint, Trash2, Wallet } from "lucide-react";
import { excluirCliente } from "@/actions/clientes";
import { podeGerenciarFinanceiro } from "@/lib/rbac";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id, tenantId: session.user.tenantId },
    include: { pets: { orderBy: { nome: "asc" } } },
  });

  if (!cliente) notFound();

  const podeFinanceiro = podeGerenciarFinanceiro(session.user.papel);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            {cliente.nome}
          </h1>
          <p className="text-muted-foreground">{cliente.telefone}</p>
        </div>
        <div className="flex gap-2">
          {podeFinanceiro && (
            <Button
              render={<Link href={`/financeiro/novo?clienteId=${cliente.id}`} />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              <Wallet className="h-4 w-4" /> Cobrar
            </Button>
          )}
          <Button
            render={<Link href={`/clientes/${cliente.id}/editar`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <Pencil className="h-4 w-4" /> Editar
          </Button>
          <form action={excluirCliente.bind(null, cliente.id)}>
            <Button type="submit" variant="outline" size="sm">
              <Trash2 className="h-4 w-4" /> Excluir
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados de contato</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">E-mail: </span>
            {cliente.email || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">CPF: </span>
            {cliente.cpf || "—"}
          </p>
          <p className="sm:col-span-2">
            <span className="text-muted-foreground">Endereço: </span>
            {cliente.endereco || "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Pets</CardTitle>
          <Button
            render={<Link href={`/clientes/${cliente.id}/pets/novo`} />}
            nativeButton={false}
            size="sm"
          >
            <Plus className="h-4 w-4" /> Novo pet
          </Button>
        </CardHeader>
        <CardContent>
          {cliente.pets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum pet cadastrado para este cliente.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {cliente.pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/pets/${pet.id}`}
                  className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <PawPrint className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{pet.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {pet.especie}
                      {pet.raca ? ` · ${pet.raca}` : ""}
                    </p>
                  </div>
                  {pet.sexo && (
                    <Badge variant="outline">
                      {pet.sexo === "MACHO" ? "Macho" : "Fêmea"}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
