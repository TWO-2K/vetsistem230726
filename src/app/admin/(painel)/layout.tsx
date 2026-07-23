import Link from "next/link";
import { requireSuperAdminSession } from "@/lib/session";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Building2, Package2, LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSuperAdminSession();

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="hidden w-64 flex-col border-r bg-background py-4 md:flex">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            V
          </div>
          <span className="font-heading text-lg font-bold tracking-tight">
            Plataforma
          </span>
        </div>
        <nav className="mt-4 flex-1 flex flex-col gap-1 px-3">
          <Link
            href="/admin/empresas"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Building2 className="h-4 w-4" /> Empresas
          </Link>
          <Link
            href="/admin/planos"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Package2 className="h-4 w-4" /> Planos
          </Link>
        </nav>
        <div className="border-t px-3 pt-4">
          <p className="truncate px-1 text-xs text-muted-foreground">
            {session.user?.email}
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <main className="flex-1 bg-muted/30 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
