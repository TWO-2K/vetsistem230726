import Link from "next/link";
import { requireSession } from "@/lib/session";
import { signOut } from "@/auth";
import { NavSidebar, BrandMark } from "@/components/nav-sidebar";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { LogOut, Search, Bell, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const nome = session.user?.name ?? "Usuário";
  const iniciais = nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-1 bg-bg">
      <aside className="hidden w-64 flex-col border-r border-border bg-bg-elevated py-4 md:flex">
        <BrandMark />
        <div className="mt-4 flex-1 overflow-y-auto">
          <NavSidebar papel={session.user.papel} />
        </div>
        <div className="border-t border-border px-3 pt-4">
          <div className="flex items-center gap-3 rounded-md px-1 py-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{iniciais}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">{nome}</p>
              <p className="truncate text-xs text-text-tertiary">
                {session.user?.email}
              </p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start text-text-secondary"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-bg-elevated px-4 py-3 md:px-8">
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
