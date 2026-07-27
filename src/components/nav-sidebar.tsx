"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  PawPrint,
  BedDouble,
  UserRound,
  Syringe,
  Wallet,
  Package,
  ShoppingCart,
  FileBarChart,
  Scissors,
  Percent,
  Building2,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const grupoAtendimento: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/internacoes", label: "Internações", icon: BedDouble },
  { href: "/vacinas", label: "Vacinas", icon: Syringe },
];

const grupoVendas: NavItem[] = [
  { href: "/pdv", label: "PDV", icon: ShoppingCart },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
];

const grupoGestao: NavItem[] = [
  { href: "/funcionarios", label: "Funcionários", icon: UserRound },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/servicos", label: "Serviços", icon: Scissors },
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/comissoes", label: "Comissões", icon: Percent },
  { href: "/empresa", label: "Minha Empresa", icon: Building2 },
];

export function NavSidebar({ papel }: { papel: string }) {
  const pathname = usePathname();

  const podeVendas = papel === "ADMIN" || papel === "RECEPCAO";
  const podeComissao = papel === "ADMIN" || papel === "VET";

  const grupos: NavGroup[] = [
    { label: "Atendimento", items: grupoAtendimento },
    ...(podeVendas ? [{ label: "Vendas", items: grupoVendas }] : []),
    ...(papel === "ADMIN"
      ? [{ label: "Gestão", items: grupoGestao }]
      : podeComissao
        ? [
            {
              label: "Gestão",
              items: grupoGestao.filter((i) => i.href === "/comissoes"),
            },
          ]
        : []),
  ];

  return (
    <nav className="flex flex-col gap-5 px-3">
      {grupos.map((grupo) => (
        <div key={grupo.label} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-medium tracking-wide text-text-tertiary uppercase">
            {grupo.label}
          </p>
          {grupo.items.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-3 rounded-md py-2 pr-3 pl-3 text-sm font-medium transition-colors before:absolute before:inset-y-1 before:left-0 before:w-0.75 before:rounded-full before:bg-transparent before:content-['']",
                  active
                    ? "bg-primary-subtle text-primary before:bg-primary"
                    : "text-text-secondary hover:bg-bg-sunken hover:text-text"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <PawPrint className="h-4 w-4" />
      </div>
      <span className="font-heading text-lg font-semibold tracking-tight text-text">
        VetSistema
      </span>
    </div>
  );
}
