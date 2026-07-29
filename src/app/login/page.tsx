import { redirect } from "next/navigation";
import { AuthError, CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PawPrint,
  Mail,
  Lock,
  Stethoscope,
  CalendarDays,
  Syringe,
  HeartPulse,
} from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;

  async function autenticar(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: params.callbackUrl || "/dashboard",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        const code =
          error instanceof CredentialsSignin ? error.code : "1";
        redirect(`/login?error=${code}${params.callbackUrl ? `&callbackUrl=${params.callbackUrl}` : ""}`);
      }
      throw error;
    }
  }

  const mensagemErro =
    params.error === "empresa-suspensa"
      ? "Sua empresa está inativa. Entre em contato com o suporte para reativar o acesso."
      : params.error === "conta-bloqueada"
        ? "Muitas tentativas de login incorretas. Tente novamente em alguns minutos."
        : params.error
          ? "E-mail ou senha inválidos."
          : null;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Painel de marca — escondido em telas pequenas */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-hover lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1.5px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-primary-hover/40 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <PawPrint className="h-6 w-6 text-white" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-white">
            VetSistema
          </span>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="font-heading text-3xl font-bold leading-tight text-white text-balance">
            Cuidado veterinário, gestão sem complicação.
          </h1>
          <p className="text-white/90 text-balance">
            Prontuários, agenda, internação, vacinas, financeiro e estoque da
            sua clínica em um só lugar.
          </p>

          <ul className="space-y-3 pt-2">
            {[
              { icon: Stethoscope, texto: "Prontuário clínico completo" },
              { icon: CalendarDays, texto: "Agenda e atendimentos" },
              { icon: Syringe, texto: "Controle de vacinas e alertas" },
              { icon: HeartPulse, texto: "Internação e evolução do paciente" },
            ].map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-white">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white">
                  {texto}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/70">
          © {new Date().getFullYear()} VetSistema. Feito para clínicas
          veterinárias.
        </p>
      </div>

      {/* Painel do formulário */}
      <div className="flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1 text-center lg:text-left">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:hidden">
              <PawPrint className="h-6 w-6" />
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-muted-foreground">
              Entre com seu e-mail e senha para acessar a clínica.
            </p>
          </div>

          <form action={autenticar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="voce@clinica.com"
                  autoComplete="email"
                  className="h-10 pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="h-10 pl-9"
                  required
                />
              </div>
            </div>
            {mensagemErro && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {mensagemErro}
              </p>
            )}
            <Button type="submit" className="h-10 w-full">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
