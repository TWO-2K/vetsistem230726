"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  ChevronDown,
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

export function NavSidebar({
  papel,
  collapsed = false,
}: {
  papel: string;
  collapsed?: boolean;
}) {
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

  const grupoAtivoLabel = grupos.find((grupo) =>
    grupo.items.some(
      (item) =>
        pathname === item.href || pathname.startsWith(item.href + "/"),
    ),
  )?.label;

  const [grupoAberto, setGrupoAberto] = useState<string | undefined>(
    grupoAtivoLabel,
  );

  useEffect(() => {
    setGrupoAberto(grupoAtivoLabel);
  }, [grupoAtivoLabel]);

  return (
    <nav className="flex flex-col gap-5 px-3">
      {grupos.map((grupo) => {
        const recolhido = grupoAberto !== grupo.label;

        return (
          <div key={grupo.label} className="flex flex-col gap-1">
            {!collapsed && (
              <button
                type="button"
                onClick={() =>
                  setGrupoAberto((prev) =>
                    prev === grupo.label ? undefined : grupo.label,
                  )
                }
                className="flex items-center justify-between px-3 py-1 text-xs font-medium tracking-wide text-sidebar-foreground/60 uppercase transition-colors hover:text-sidebar-foreground/90"
              >
                {grupo.label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    recolhido && "-rotate-90",
                  )}
                />
              </button>
            )}
            {(collapsed || !recolhido) &&
              grupo.items.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-md py-2.5 pr-3 pl-3 text-sm font-medium transition-colors before:absolute before:inset-y-1 before:left-0 before:w-0.75 before:rounded-full before:bg-transparent before:content-['']",
                      collapsed && "mx-auto w-9 justify-center px-0",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground before:bg-sidebar-accent-foreground"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && label}
                  </Link>
                );
              })}
          </div>
        );
      })}
    </nav>
  );
}

export function BrandMark({
  collapsed = false,
  iconClassName = "bg-primary text-primary-foreground",
  textClassName = "text-text",
}: {
  collapsed?: boolean;
  iconClassName?: string;
  textClassName?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-2.5", collapsed && "justify-center")}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          iconClassName,
        )}
      >
        <PawPrint className="h-[18px] w-[18px]" />
      </div>
      {!collapsed && (
        <span
          className={cn(
            "font-heading text-xl font-semibold tracking-tight",
            textClassName,
          )}
        >
          VetSistema
        </span>
      )}
    </div>
  );
}
