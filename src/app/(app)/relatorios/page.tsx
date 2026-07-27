import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CalendarDays, UserX } from "lucide-react";

const relatorios = [
  {
    href: "/relatorios/financeiro",
    label: "Financeiro por período",
    descricao: "Total recebido e por forma de pagamento num intervalo de datas.",
    icon: Wallet,
  },
  {
    href: "/relatorios/atendimentos",
    label: "Atendimentos por período",
    descricao: "Contagem de atendimentos por veterinário e por tipo.",
    icon: CalendarDays,
  },
  {
    href: "/relatorios/clientes-inativos",
    label: "Clientes inativos",
    descricao: "Clientes sem atendimento ou agendamento recente.",
    icon: UserX,
  },
];

export default async function RelatoriosPage() {
  const session = await requireSession();
  if (!isAdmin(session.user.papel)) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-text">
          Relatórios
        </h1>
        <p className="text-text-secondary">
          Visão agregada do financeiro, atendimentos e clientes da clínica.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {relatorios.map(({ href, label, descricao, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="h-full shadow-sm transition-colors hover:bg-bg-sunken">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-subtle text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <CardTitle className="font-heading text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-text-secondary">
                {descricao}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
