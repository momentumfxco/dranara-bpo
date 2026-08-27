import { useState } from "react";
import { Card, CardHeader } from "./Card";
import { BRL2, formatMesLabel } from "@/lib/format";
import { useDreMes, useDreAno, currentYear, type DreAtual } from "@/lib/dashboard-queries";
import { YearPicker } from "./YearPicker";

type Row = { label: string; value: number; kind: "total" | "in" | "out" };

function buildRows(d: DreAtual): Row[] {
  const n = (v: number | string) => Number(v);
  return [
    // 1. Receita Bruta
    { label: "Receitas de Cartão", value: n(d.receitas_cartao), kind: "in" },
    { label: "Receitas de PIX", value: n(d.receitas_pix), kind: "in" },
    { label: "Aporte Dra Nara", value: n(d.aporte_dra_nara), kind: "in" },
    { label: "Total Receita Bruta", value: n(d.total_receita_bruta), kind: "total" },
    // 2. Deduções da Receita
    { label: "(−) Taxas de Cartão", value: -n(d.taxas_cartao), kind: "out" },
    { label: "(−) Impostos", value: -n(d.impostos), kind: "out" },
    { label: "(−) Devoluções/Cancelamento", value: -n(d.devolucoes_cancelamento), kind: "out" },
    { label: "(−) Outras Deduções", value: -n(d.outras_deducoes), kind: "out" },
    // 3. Receita Líquida
    { label: "Receita Líquida", value: n(d.receita_liquida), kind: "total" },
    // 4. Despesas Operacionais
    { label: "(−) Uber", value: -n(d.uber), kind: "out" },
    { label: "(−) Aluguel", value: -n(d.aluguel), kind: "out" },
    { label: "(−) Gasolina", value: -n(d.gasolina), kind: "out" },
    { label: "(−) Secretárias e IA", value: -n(d.secretarias_ia), kind: "out" },
    { label: "(−) Outros Custos Operacionais", value: -n(d.outros_despesas_operacionais), kind: "out" },
    { label: "Total Despesas Operacionais", value: -n(d.total_despesas_operacionais), kind: "total" },
    // 5. Despesas Comerciais / Marketing
    { label: "(−) Canva", value: -n(d.canva), kind: "out" },
    { label: "(−) Google Ads", value: -n(d.google_ads), kind: "out" },
    { label: "(−) Editor de Vídeo", value: -n(d.editor_video), kind: "out" },
    { label: "(−) Outros Gastos com Marketing", value: -n(d.outros_marketing), kind: "out" },
    { label: "Total Desp. Comerciais/Marketing", value: -n(d.total_despesas_comerciais_marketing), kind: "total" },
    // 6. Despesas Administrativas
    { label: "(−) Pró-labore", value: -n(d.pro_labore), kind: "out" },
    { label: "(−) Contabilidade", value: -n(d.contabilidade), kind: "out" },
    { label: "(−) BPO Financeiro", value: -n(d.bpo_financeiro), kind: "out" },
    { label: "(−) Outras Desp. Administrativas", value: -n(d.outras_despesas_administrativas), kind: "out" },
    { label: "Total Despesas Administrativas", value: -n(d.total_despesas_administrativas), kind: "total" },
    // 7. Despesas Financeiras
    { label: "(−) Juros", value: -n(d.juros), kind: "out" },
    { label: "(−) Manutenção de Conta", value: -n(d.manutencao_conta), kind: "out" },
    { label: "(−) Tarifas Bancárias", value: -n(d.tarifas_bancarias), kind: "out" },
    { label: "(−) Outros Encargos Financeiros", value: -n(d.outros_encargos_financeiros), kind: "out" },
    { label: "Total Despesas Financeiras", value: -n(d.total_despesas_financeiras), kind: "total" },
    // 8. Resultado do Período
    { label: "Lucro / Prejuízo do Período", value: n(d.lucro_prejuizo_periodo), kind: "total" },
  ];
}

function DreRows({ data }: { data: DreAtual }) {
  const rows = buildRows(data);
  const bruta = Number(data.total_receita_bruta);
  const temReceita = Math.abs(bruta) > 0.01;
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.value)), 1);

  return (
    <div className="max-h-96 space-y-1 overflow-y-auto pr-1">
      {rows.map((r) => {
        const pctBruta = temReceita ? (r.value / bruta) * 100 : 0;
        const width = (Math.abs(r.value) / maxAbs) * 100;
        const bg =
          r.kind === "total" ? "bg-primary" : r.kind === "out" ? "bg-destructive/70" : "bg-chart-4";
        const isTotal = r.kind === "total";
        return (
          <div
            key={r.label}
            className={`grid grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_minmax(0,1fr)_44px] items-center gap-3 rounded-lg px-2 py-1.5 ${
              isTotal ? "bg-muted/50" : ""
            }`}
          >
            <span
              className={`truncate text-xs ${isTotal ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              {r.label}
            </span>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={`h-full ${bg}`} style={{ width: `${width}%` }} />
            </div>
            <span
              className={`text-right text-xs tabular-nums ${
                r.value < 0
                  ? "text-destructive"
                  : isTotal
                    ? "font-semibold text-foreground"
                    : "text-foreground"
              }`}
            >
              {BRL2.format(r.value)}
            </span>
            <span className="text-right text-[11px] tabular-nums text-muted-foreground">
              {temReceita ? `${pctBruta.toFixed(1)}%` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PeriodoToggle({
  periodo,
  onChange,
}: {
  periodo: "mensal" | "anual";
  onChange: (p: "mensal" | "anual") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-input bg-card p-0.5 text-xs shadow-card">
      {(["mensal", "anual"] as const).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`rounded-md px-2.5 py-1 font-medium capitalize transition ${
            periodo === p
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export function DreWaterfall({ mes }: { mes: string }) {
  const [periodo, setPeriodo] = useState<"mensal" | "anual">("mensal");
  const [ano, setAno] = useState(currentYear());

  const mensal = useDreMes(mes);
  const anual = useDreAno(ano);

  const isLoading = periodo === "mensal" ? mensal.isLoading : anual.isLoading;
  const data = periodo === "mensal" ? mensal.data : anual.data;
  const subtitle =
    periodo === "mensal"
      ? `Estrutura de resultado — ${formatMesLabel(mes)}`
      : `Estrutura de resultado — ${ano}${
          anual.data
            ? ` (${anual.data.mesesFechados}${anual.data.mesAtualIncluido ? " + mês atual" : ""} de 12 meses)`
            : ""
        }`;

  return (
    <Card>
      <CardHeader
        title={periodo === "mensal" ? "DRE do mês" : "DRE do ano"}
        subtitle={subtitle}
        right={
          <div className="flex items-center gap-2">
            {periodo === "anual" && <YearPicker value={ano} onChange={setAno} />}
            <PeriodoToggle periodo={periodo} onChange={setPeriodo} />
          </div>
        }
      />
      {isLoading || !data ? (
        <div className="flex h-72 items-center justify-center text-xs text-muted-foreground">
          {isLoading ? "Carregando…" : "Sem dados de DRE ainda."}
        </div>
      ) : (
        <DreRows data={data} />
      )}
    </Card>
  );
}
