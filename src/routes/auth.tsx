import { createFileRoute, useNavigate, HeadContent } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { supabase } from "@/lib/supabase-consultorio";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acesso — Consultório Dra Nara" },
      { name: "description", content: "Acesso seguro ao painel do consultório da Dra Nara." },
      { property: "og:title", content: "Acesso — Consultório Dra Nara" },
      { property: "og:description", content: "Acesso seguro ao painel do consultório da Dra Nara." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) navigate({ to: "/dashboard", replace: true });
  }, [session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <>
      <HeadContent />
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
        {/* Soft ambient background shapes */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-60" />
          <div className="absolute -left-24 top-1/2 h-72 w-72 rounded-full bg-chart-4/10 blur-3xl opacity-80" />
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-card backdrop-blur-xl md:p-12">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Heart className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
                Consultório Dra Nara
              </h1>
              <p className="mt-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Psiquiatria & Bem-estar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 ml-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="h-auto rounded-xl border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 ml-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-auto rounded-xl border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-auto w-full rounded-xl py-4 text-sm font-semibold shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
              >
                {loading ? "Entrando…" : "Acessar Painel"}
              </Button>
            </form>

            <div className="mt-10 border-t border-border pt-8 text-center">
              <p className="text-xs text-muted-foreground">
                Acesso exclusivo para profissionais autorizados.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs tracking-wide text-muted-foreground">
            © {new Date().getFullYear()} Consultório Dra Nara. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </>
  );
}
