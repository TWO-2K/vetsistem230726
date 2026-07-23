import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.tipo !== "TENANT") {
    redirect("/admin");
  }
  return session as typeof session & {
    user: typeof session.user & { tenantId: string; papel: string };
  };
}

export async function requireSuperAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.tipo !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }
  return session;
}
