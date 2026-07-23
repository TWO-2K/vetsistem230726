import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    tipo: "TENANT" | "SUPER_ADMIN";
    tenantId?: string;
    papel?: string;
  }

  interface Session {
    user: {
      id: string;
      tipo: "TENANT" | "SUPER_ADMIN";
      tenantId?: string;
      papel?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tipo: "TENANT" | "SUPER_ADMIN";
    tenantId?: string;
    papel?: string;
  }
}
