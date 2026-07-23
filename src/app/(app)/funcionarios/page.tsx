import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  excluirFuncionario,
  ativarFuncionario,
  desativarFuncionario,
} from "@/actions/funcionarios";
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
import { Plus, Pencil, UserRound, Power, PowerOff, Trash2 } from "lucide-react";
import { PAPEL_LABEL } from "@/lib/labels";

export default async function FuncionariosPage() {
  const session = await requireSession();
  if (session.user.papel !== "ADMIN") redirect("/dashboard");

  const [
    funcionarios,
    prontuarios,
    agendamentos,
    internacoes,
    evolucoes,
    vacinas,
    cobrancas,
  ] = await Promise.all([
    prisma.usuario.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { nome: "asc" },
    }),
    prisma.prontuario.groupBy({
      by: ["usuarioId"],
      where: { tenantId: session.user.tenantId },
      _count: true,
    }),
    prisma.agendamento.groupBy({
      by: ["usuarioId"],
      where: { tenantId: session.user.tenantId },
      _count: true,
    }),
    prisma.internacao.groupBy({
      by: ["usuarioId"],
      where: { tenantId: session.user.tenantId },
      _count: true,
    }),
    prisma.internacaoEvolucao.groupBy({
      by: ["usuarioId"],
      where: { tenantId: session.user.tenantId },
      _count: true,
    }),
    prisma.vacina.groupBy({
      by: ["usuarioId"],
      where: { tenantId: session.user.tenantId },
      _count: true,
    }),
    prisma.cobranca.groupBy({
      by: ["usuarioId"],
      where: { tenantId: session.user.tenantId },
      _count: true,
    }),
  ]);

  const usuarioIdsComRegistro = new Set(
    [...prontuarios, ...agendamentos, ...internacoes, ...evolucoes, ...vacinas, ...cobrancas].map(
      (registro) => registro.usuarioId
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            Funcionários
          </h1>
          <p className="text-muted-foreground">
            Usuários com acesso ao sistema.
          </p>
        </div>
        <Button render={<Link href="/funcionarios/novo" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Novo funcionário
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {funcionarios.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <UserRound className="h-8 w-8" />
              <p>Nenhum funcionário cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcionarios.map((funcionario) => {
                  const souEu = funcionario.id === session.user.id;
                  const podeExcluir = !usuarioIdsComRegistro.has(funcionario.id);

                  return (
                    <TableRow key={funcionario.id}>
                      <TableCell className="font-medium">
                        {funcionario.nome}
                        {!funcionario.ativo && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Inativo)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{funcionario.email}</TableCell>
                      <TableCell>{PAPEL_LABEL[funcionario.papel]}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            render={<Link href={`/funcionarios/${funcionario.id}/editar`} />}
                            nativeButton={false}
                            variant="ghost"
                            size="icon"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {!souEu && (
                            <form
                              action={
                                funcionario.ativo
                                  ? desativarFuncionario.bind(null, funcionario.id)
                                  : ativarFuncionario.bind(null, funcionario.id)
                              }
                            >
                              <Button type="submit" variant="ghost" size="icon">
                                {funcionario.ativo ? (
                                  <PowerOff className="h-4 w-4" />
                                ) : (
                                  <Power className="h-4 w-4" />
                                )}
                              </Button>
                            </form>
                          )}

                          {!souEu && podeExcluir && (
                            <form action={excluirFuncionario.bind(null, funcionario.id)}>
                              <Button type="submit" variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          )}
                        </div>
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
