import { requireSession } from "@/lib/session";
import { signOut } from "@/auth";
import { AppShell } from "@/components/app-shell";

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

  async function onSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <AppShell
      papel={session.user.papel}
      nome={nome}
      email={session.user?.email}
      iniciais={iniciais}
      onSignOut={onSignOut}
    >
      {children}
    </AppShell>
  );
}
