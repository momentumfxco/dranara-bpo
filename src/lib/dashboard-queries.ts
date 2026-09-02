import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase-consultorio";

// Utilidades de mês
export function monthStart(mes: string): string {
  // mes = "YYYY-MM"
  return `${mes}-01`;
}
export function nextMonthStart(mes: string): string {
  const [y, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 1));
  return d.toISOString().slice(0, 10);
}
export function prevMonth(mes: string): string {
  const [y, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
export function currentYear(): string {
  return String(new Date().getFullYear());
}
export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
export function last12Months(mesAte: string): string[] {
  const [y, m] = mesAte.split("-").map(Number);
  const out: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

// KPIs do mês + variação vs. mês anterior
export function useKpisMes(mes: string) {
  return useQuery({
    queryKey: ["kpis", mes],
    queryFn: async () => {
      const anterior = prevMonth(mes);
      const [fluxoAtual, fluxoAnt, atendAtual, atendAnt] = await Promise.all([
        supabase.from("fluxo_caixa_historico").select("categoria, valor").eq("mes_referencia", monthStart(mes)),
        supabase.from("fluxo_caixa_historico").select("categoria, valor").eq("mes_referencia", monthStart(anterior)),
        supabase.from("atendimentos_historico").select("valor").eq("mes_referencia", monthStart(mes)),
        supabase.from("atendimentos_historico").select("valor").eq("mes_referencia", monthStart(anterior)),
      ]);
      const sum = (rows: { categoria: string; valor: number }[] | null, cat: string) =>
        (rows ?? []).filter((r) => r.categoria === cat).reduce((s, r) => s + Number(r.valor), 0);
      const avg = (rows: { valor: number }[] | null) => {
        const arr = rows ?? [];
        if (!arr.length) return 0;
        return arr.reduce((s, r) => s + Number(r.valor), 0) / arr.length;
      };
      return {
        receita: sum(fluxoAtual.data as any, "Receita"),
        despesa: sum(fluxoAtual.data as any, "Despesa"),
        receitaAnt: sum(fluxoAnt.data as any, "Receita"),
        despesaAnt: sum(fluxoAnt.data as any, "Despesa"),
        ticket: avg(atendAtual.data as any),
        ticketAnt: avg(atendAnt.data as any),
      };
    },
  });
}

export function useFluxoCaixaSerie(mesAte: string) {
  return useQuery({
    queryKey: ["fluxo-serie", mesAte],
    queryFn: async () => {
      const meses = last12Months(mesAte);
      const from = monthStart(meses[0]);
      const to = nextMonthStart(meses[meses.length - 1]);
      const { data, error } = await supabase
        .from("fluxo_caixa_resumo_mensal")
        .select("mes_referencia, categoria, total")
        .gte("mes_referencia", from)
        .lt("mes_referencia", to);
      if (error) throw error;
      const byMes = new Map<string, { mes: string; receita: number; despesa: number }>();
      meses.forEach((m) => byMes.set(m, { mes: m, receita: 0, despesa: 0 }));
      (data ?? []).forEach((r: any) => {
        const key = String(r.mes_referencia).slice(0, 7);
        const b = byMes.get(key);
        if (!b) return;
        if (r.categoria === "Receita") b.receita += Number(r.total);
        else if (r.categoria === "Despesa") b.despesa += Number(r.total);
      });
      return Array.from(byMes.values());
    },
  });
}

export function useAtendimentosPorDiaSemana(mes: string) {
  return useQuery({
    queryKey: ["atend-dia-semana", mes],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("atendimentos_historico")
        .select("data")
        .eq("mes_referencia", monthStart(mes));
      if (error) throw error;
      const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const counts = [0, 0, 0, 0, 0, 0, 0];
      (data ?? []).forEach((r: any) => {
        const d = new Date(r.data + "T12:00:00");
        counts[d.getDay()]++;
      });
      return labels.map((label, i) => ({ label, total: counts[i] }));
    },
  });
}

export function useConsultaVsRetorno(mes: string) {
  return useQuery({
    queryKey: ["consulta-retorno", mes],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("atendimentos_historico")
        .select("tipo_consulta")
        .eq("mes_referencia", monthStart(mes));
      if (error) throw error;
      const m = new Map<string, number>();
      (data ?? []).forEach((r: any) => m.set(r.tipo_consulta, (m.get(r.tipo_consulta) ?? 0) + 1));
      return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
    },
  });
}

export type DreAtual = {
  receitas_cartao: number; receitas_pix: number; receitas_antecipadas: number; outras_receitas: number;
  aporte_dra_nara: number; total_receita_bruta: number;
  taxas_cartao: number; impostos: number; devolucoes_cancelamento: number; outras_deducoes: number;
  total_deducoes_receita: number; receita_liquida: number;
  uber: number; aluguel: number; gasolina: number; secretarias_ia: number;
  outros_despesas_operacionais: number; total_despesas_operacionais: number;
  canva: number; google_ads: number; editor_video: number; outros_marketing: number;
  total_despesas_comerciais_marketing: number;
  pro_labore: number; contabilidade: number; bpo_financeiro: number; outras_despesas_administrativas: number;
  total_despesas_administrativas: number;
  juros: number; manutencao_conta: number; tarifas_bancarias: number; outros_encargos_financeiros: number;
  total_despesas_financeiras: number;
  resultado_do_mes: number; antecipacao_lucro: number;
  lucro_prejuizo_periodo: number;
  atualizado_em: string;
};

export function useDreAtual() {
  return useQuery({
    queryKey: ["dre-atual"],
    queryFn: async (): Promise<DreAtual | null> => {
      const { data, error } = await supabase.from("dre_atual").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return (data as DreAtual) ?? null;
    },
  });
}

// DRE do mês selecionado: usa dre_historico se o mês estiver fechado,
// senão cai para dre_atual (snapshot ao vivo do mês corrente).
export function useDreMes(mes: string) {
  return useQuery({
    queryKey: ["dre-mes", mes],
    queryFn: async (): Promise<DreAtual | null> => {
      const { data: hist, error: histErr } = await supabase
        .from("dre_historico")
        .select("*")
        .eq("mes_referencia", monthStart(mes))
        .maybeSingle();
      if (histErr && histErr.code !== "PGRST116") {
        // tabela ausente ou erro de leitura: segue para o fallback
        console.warn("[dre_historico]", histErr.message);
      }
      if (hist) return hist as unknown as DreAtual;

      if (mes === currentMonth()) {
        const { data, error } = await supabase.from("dre_atual").select("*").eq("id", 1).maybeSingle();
        if (error) throw error;
        return (data as DreAtual) ?? null;
      }
      return null;
    },
  });
}

// DRE acumulada do ano: soma as linhas fechadas de dre_historico do ano
// e, se for o ano corrente, adiciona o snapshot ao vivo de dre_atual
// (quando o mês corrente ainda não tem linha fechada).
export type DreAno = DreAtual & { mesesFechados: number; mesAtualIncluido: boolean };

const DRE_CAMPOS = [
  "receitas_cartao", "receitas_pix", "receitas_antecipadas", "outras_receitas", "aporte_dra_nara", "total_receita_bruta",
  "taxas_cartao", "impostos", "devolucoes_cancelamento", "outras_deducoes", "total_deducoes_receita",
  "receita_liquida",
  "uber", "aluguel", "gasolina", "secretarias_ia", "outros_despesas_operacionais", "total_despesas_operacionais",
  "canva", "google_ads", "editor_video", "outros_marketing", "total_despesas_comerciais_marketing",
  "pro_labore", "contabilidade", "bpo_financeiro", "outras_despesas_administrativas", "total_despesas_administrativas",
  "juros", "manutencao_conta", "tarifas_bancarias", "outros_encargos_financeiros", "total_despesas_financeiras",
  "resultado_do_mes", "antecipacao_lucro",
  "lucro_prejuizo_periodo",
] as const;

export function useDreAno(ano: string) {
  return useQuery({
    queryKey: ["dre-ano", ano],
    queryFn: async (): Promise<DreAno | null> => {
      const { data: hist, error } = await supabase
        .from("dre_historico")
        .select("*")
        .gte("mes_referencia", `${ano}-01-01`)
        .lte("mes_referencia", `${ano}-12-01`);
      if (error) console.warn("[dre_historico ano]", error.message);

      const linhas = (hist ?? []) as unknown as Array<DreAtual & { mes_referencia: string }>;
      const mesesFechados = linhas.length;

      let mesAtualIncluido = false;
      let atual: DreAtual | null = null;
      if (ano === currentYear()) {
        const jaFechado = linhas.some((l) => String(l.mes_referencia).slice(0, 7) === currentMonth());
        if (!jaFechado) {
          const { data } = await supabase.from("dre_atual").select("*").eq("id", 1).maybeSingle();
          if (data) {
            atual = data as DreAtual;
            mesAtualIncluido = true;
          }
        }
      }

      if (mesesFechados === 0 && !atual) return null;

      const soma = {} as Record<(typeof DRE_CAMPOS)[number], number>;
      for (const campo of DRE_CAMPOS) {
        soma[campo] =
          linhas.reduce((acc, l) => acc + Number(l[campo] ?? 0), 0) + Number(atual?.[campo] ?? 0);
      }

      return {
        ...(soma as unknown as DreAtual),
        atualizado_em: atual?.atualizado_em ?? "",
        mesesFechados,
        mesAtualIncluido,
      };
    },
  });
}
