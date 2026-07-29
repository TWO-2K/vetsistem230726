import { requireSuperAdminSession } from "@/lib/session";
import { criarPlano } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NovoPlanoPage() {
  await requireSuperAdminSession();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          Novo plano
        </h1>
        <p className="text-sm text-muted-foreground">
          Só informativo — sem cobrança automática nesta fase.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do plano</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={criarPlano} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" name="nome" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="limiteUsuarios">Limite de usuários</Label>
              <Input
                id="limiteUsuarios"
                name="limiteUsuarios"
                type="number"
                min="1"
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricaoRecursos">Recursos incluídos</Label>
              <Textarea
                id="descricaoRecursos"
                name="descricaoRecursos"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Criar plano</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
