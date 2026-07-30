import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-consultorio";
import {
  currentMonth,
  useDreMes,
  useKpisMes,
} from "@/lib/dashboard-queries";
import { BRL, BRL2, formatMesLabel, variationPct } from "@/lib/format";

import { MonthPicker } from "@/components/dashboard/MonthPicker";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FluxoCaixaChart } from "@/components/dashboard/FluxoCaixaChart";
import { AtendimentosDiaSemanaChart } from "@/components/dashboard/AtendimentosDiaSemanaChart";
import { DreWaterfall } from "@/components/dashboard/DreWaterfall";
import { ConsultaRetornoDonut } from "@/components/dashboard/ConsultaRetornoDonut";
import { RecebimentosDonut } from "@/components/dashboard/RecebimentosDonut";
import { AlertaTaxaCartao } from "@/components/dashboard/AlertaTaxaCartao";

const searchSchema = z.object({
  mes: fallback(z.string(), currentMonth()).default(currentMonth()),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  ssr: false,
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Dashboard — Consultório Dra Nara" },
      { name: "description", content: "Visão financeira e operacional do consultório da Dra Nara." },
    ],
  }),
});

function DashboardPage() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = Route.useSearch();
  const rawMes = search.mes && /^\d{4}-\d{2}$/.test(search.mes) ? search.mes : currentMonth();
  const mes = rawMes > currentMonth() ? currentMonth() : rawMes;

  const kpis = useKpisMes(mes);
  const dre = useDreMes(mes);

  async function handleLogout() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  const receita = kpis.data?.receita ?? 0;
  const despesa = kpis.data?.despesa ?? 0;
  const resultado = receita - despesa;
  const resultadoAnt = (kpis.data?.receitaAnt ?? 0) - (kpis.data?.despesaAnt ?? 0);
  const margem =
    dre.data && Number(dre.data.receita_bruta) > 0
      ? (Number(dre.data.lucro_final) / Number(dre.data.receita_bruta)) * 100
      : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold">
              N
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Consultório Dra Nara</h1>
              <p className="text-xs text-muted-foreground">{session?.user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-card transition hover:bg-accent"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Visão geral</h2>
            <p className="text-sm text-muted-foreground">
              Indicadores financeiros e operacionais do consultório
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MonthPicker
              value={mes.slice(5, 7)}
              ano={mes.slice(0, 4)}
              onChange={(m) =>
                navigate({
                  to: "/dashboard",
                  search: { mes: `${mes.slice(0, 4)}-${m}` },
                  replace: true,
                })
              }
            />
            <YearPicker
              value={mes.slice(0, 4)}
              onChange={(a) =>
                navigate({
                  to: "/dashboard",
                  search: { mes: `${a}-${mes.slice(5, 7)}` },
                  replace: true,
                })
              }
            />
          </div>
        </div>

        {/* Linha 1 — KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard
            label="Receita do mês"
            value={BRL.format(receita)}
            trendPct={variationPct(receita, kpis.data?.receitaAnt ?? 0)}
          />
          <KpiCard
            label="Despesa do mês"
            value={BRL.format(despesa)}
            trendPct={variationPct(despesa, kpis.data?.despesaAnt ?? 0)}
          />
          <KpiCard
            label="Resultado do mês"
            value={BRL.format(resultado)}
            trendPct={variationPct(resultado, resultadoAnt)}
          />
          <KpiCard
            label="Ticket médio"
            value={BRL2.format(kpis.data?.ticket ?? 0)}
            trendPct={variationPct(kpis.data?.ticket ?? 0, kpis.data?.ticketAnt ?? 0)}
          />
          <KpiCard
            label="Margem de Lucro"
            value={margem === null ? "—" : `${margem.toFixed(1)}%`}
            hint={`DRE — ${formatMesLabel(mes)}`}
          />
        </div>

        {/* Linha 2 */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FluxoCaixaChart mesAte={mes} />
          <AtendimentosDiaSemanaChart mes={mes} />
        </div>

        {/* Linha 3 */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DreWaterfall mes={mes} />
          <ConsultaRetornoDonut mes={mes} />
        </div>

        {/* Linha 4 */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RecebimentosDonut mes={mes} />
          <AlertaTaxaCartao mes={mes} />
        </div>

        <footer className="mt-8 pb-6 text-center text-xs text-muted-foreground">
          {dre.data?.atualizado_em
            ? `DRE atualizada em ${new Date(dre.data.atualizado_em).toLocaleString("pt-BR")}`
            : ""}
        </footer>
      </main>
    </div>
  );
}
