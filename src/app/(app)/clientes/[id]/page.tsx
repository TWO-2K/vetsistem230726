import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Plus, PawPrint, Trash2, Wallet, User } from "lucide-react";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
            <User className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
              {cliente.nome}
            </h1>
            <p className="font-mono text-sm text-text-secondary">
              {cliente.telefone}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Dados de contato</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-text-secondary">E-mail: </span>
            <span className="text-text">{cliente.email || "—"}</span>
          </p>
          <p>
            <span className="text-text-secondary">CPF: </span>
            <span className="font-mono text-text">{cliente.cpf || "—"}</span>
          </p>
          <p className="sm:col-span-2">
            <span className="text-text-secondary">Endereço: </span>
            <span className="text-text">{cliente.endereco || "—"}</span>
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
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
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-text-tertiary">
                <PawPrint className="h-6 w-6" />
              </div>
              <p className="text-sm text-text-secondary">
                Nenhum pet cadastrado para este cliente.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {cliente.pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/pets/${pet.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-bg-sunken"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                    <PawPrint className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text">{pet.nome}</p>
                    <p className="truncate text-xs text-text-tertiary">
                      {pet.especie}
                      {pet.raca ? ` · ${pet.raca}` : ""}
                    </p>
                  </div>
                  {pet.sexo && (
                    <span className="shrink-0 rounded-full bg-info-subtle px-2.5 py-1 text-xs font-medium text-info">
                      {pet.sexo === "MACHO" ? "Macho" : "Fêmea"}
                    </span>
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
