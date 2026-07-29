import { notFound } from "next/navigation";
import { requireSuperAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { atualizarPlano } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditarPlanoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdminSession();
  const { id } = await params;

  const plano = await prisma.plano.findUnique({ where: { id } });
  if (!plano) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          Editar plano
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do plano</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={atualizarPlano.bind(null, plano.id)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" name="nome" defaultValue={plano.nome} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="limiteUsuarios">Limite de usuários</Label>
              <Input
                id="limiteUsuarios"
                name="limiteUsuarios"
                type="number"
                min="1"
                defaultValue={plano.limiteUsuarios ?? undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precoReferencia">Preço de referência (R$)</Label>
              <Input
                id="precoReferencia"
                name="precoReferencia"
                type="number"
                min="0"
                step="0.01"
                defaultValue={plano.precoReferencia ?? undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricaoRecursos">Recursos incluídos</Label>
              <Textarea
                id="descricaoRecursos"
                name="descricaoRecursos"
                rows={3}
                defaultValue={plano.descricaoRecursos ?? ""}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
