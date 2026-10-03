import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase-consultorio";

type AuthCtx = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ session: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Valida a sessão no servidor quando a aba volta ao foco
  useEffect(() => {
    const validar = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      const { error } = await supabase.auth.getUser();
      if (!error) return;
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) await supabase.auth.signOut();
    };
    const onFocus = () => void validar();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void validar();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        session,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
