import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase-consultorio";
import { routeTree } from "./routeTree.gen";

function isAuthError(err: unknown): boolean {
  const e = err as { status?: number; code?: string; message?: string } | null;
  if (!e) return false;
  if (e.status === 401 || e.status === 403) return true;
  if (e.code === "PGRST301" || e.code === "PGRST303") return true;
  return /JWT|expired|invalid token|not authenticated/i.test(e.message ?? "");
}

let sessaoExpiradaTratada = false;

function tratarSessaoExpirada() {
  if (sessaoExpiradaTratada) return;
  sessaoExpiradaTratada = true;
  toast.error("Sua sessão expirou. Entre novamente.");
  void supabase.auth.signOut();
}

export const getRouter = () => {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (err) => {
        if (isAuthError(err)) tratarSessaoExpirada();
      },
    }),
    defaultOptions: {
      queries: {
        retry: (n, err) => !isAuthError(err) && n < 2,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
