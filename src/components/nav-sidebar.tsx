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

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/internacoes", label: "Internações", icon: BedDouble },
  { href: "/vacinas", label: "Vacinas", icon: Syringe },
];

const linksFinanceiro = [
  { href: "/pdv", label: "PDV", icon: ShoppingCart },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
];

const linksAdmin = [
  { href: "/funcionarios", label: "Funcionários", icon: UserRound },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/servicos", label: "Serviços", icon: Scissors },
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/empresa", label: "Minha Empresa", icon: Building2 },
];

const linksComissao = [{ href: "/comissoes", label: "Comissões", icon: Percent }];

export function NavSidebar({ papel }: { papel: string }) {
  const pathname = usePathname();
  const itens = [
    ...links,
    ...(papel === "ADMIN" || papel === "RECEPCAO" ? linksFinanceiro : []),
    ...(papel === "ADMIN" ? linksAdmin : []),
    ...(papel === "ADMIN" || papel === "VET" ? linksComissao : []),
  ];

  return (
    <nav className="flex flex-col gap-1 px-3">
      {itens.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BrandMark() {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <PawPrint className="h-4 w-4" />
      </div>
      <span className="font-heading text-lg font-bold tracking-tight">VetSistema</span>
    </div>
  );
}
