"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NavSidebar, BrandMark } from "@/components/nav-sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  Search,
  Bell,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "vet-sidebar-collapsed";

export function AppShell({
  papel,
  nome,
  email,
  iniciais,
  onSignOut,
  children,
}: {
  papel: string;
  nome: string;
  email: string | null | undefined;
  iniciais: string;
  onSignOut: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "true");
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-1 bg-bg">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen flex-col border-r border-border bg-bg-elevated pb-4 transition-[width] duration-200 md:flex",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border px-3",
            collapsed && "justify-center"
          )}
        >
          <BrandMark collapsed={collapsed} />
        </div>
        <button
          type="button"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          onClick={toggle}
          className="absolute top-8 right-0 z-10 flex h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-bg-elevated text-text-tertiary shadow-sm transition-colors hover:bg-bg-sunken hover:text-text"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>
        <div className="mt-4 flex-1">
          <NavSidebar papel={papel} collapsed={collapsed} />
        </div>
        <div className="border-t border-border px-3 pt-4">
          <div
            className={cn(
              "flex items-center gap-3 rounded-md px-1 py-1",
              collapsed && "justify-center px-0"
            )}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>{iniciais}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{nome}</p>
                <p className="truncate text-xs text-text-tertiary">{email}</p>
              </div>
            )}
          </div>
          <form action={onSignOut}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              title={collapsed ? "Sair" : undefined}
              className={cn(
                "mt-2 w-full text-text-secondary",
                collapsed ? "justify-center" : "justify-start"
              )}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && "Sair"}
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-bg-elevated px-4 md:px-8">
          <div className="md:hidden">
            <BrandMark />
          </div>
          <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-bg-sunken px-3 py-1.5 text-sm text-text-tertiary md:flex">
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">Buscar clientes, pets, agendamentos…</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Notificações">
              <Bell className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Configurações"
              render={<Link href="/empresa" />}
              nativeButton={false}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 bg-bg p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
