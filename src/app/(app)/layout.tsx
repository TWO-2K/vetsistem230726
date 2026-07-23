import { requireSession } from "@/lib/session";
import { signOut } from "@/auth";
import { NavSidebar, BrandMark } from "@/components/nav-sidebar";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

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
    <div className="flex min-h-screen flex-1">
      <aside className="hidden w-64 flex-col border-r bg-background py-4 md:flex">
        <BrandMark />
        <div className="mt-4 flex-1">
          <NavSidebar papel={session.user.papel} />
        </div>
        <div className="border-t px-3 pt-4">
          <div className="flex items-center gap-3 rounded-md px-1 py-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{iniciais}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{nome}</p>
              <p className="truncate text-xs text-muted-foreground">
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
              className="mt-2 w-full justify-start text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
          <BrandMark />
        </header>
        <main className="flex-1 bg-muted/30 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
