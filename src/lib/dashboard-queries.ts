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
  cartao_credito: number; cartao_debito: number; pix: number; boleto: number;
  receita_bruta: number; taxas_cartao: number; impostos: number; receita_liquida: number;
  despesas_operacionais: number; despesas_administrativas: number; resultado_operacional: number;
  despesas_financeiras: number; lucro_liquido: number; retirada_lucro: number; lucro_final: number;
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
