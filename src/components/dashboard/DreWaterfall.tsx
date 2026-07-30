import { useState } from "react";
import { Card, CardHeader } from "./Card";
import { BRL2, formatMesLabel } from "@/lib/format";
import { useDreMes, useDreAno, currentYear, type DreAtual } from "@/lib/dashboard-queries";
import { YearPicker } from "./YearPicker";

type Row = { label: string; value: number; kind: "total" | "in" | "out" };

function buildRows(d: DreAtual): Row[] {
  const n = (v: number | string) => Number(v);
  return [
    { label: "Receita Bruta", value: n(d.receita_bruta), kind: "total" },
    { label: "(−) Taxas de cartão", value: -n(d.taxas_cartao), kind: "out" },
    { label: "(−) Impostos", value: -n(d.impostos), kind: "out" },
    { label: "Receita Líquida", value: n(d.receita_liquida), kind: "total" },
    { label: "(−) Desp. Operacionais", value: -n(d.despesas_operacionais), kind: "out" },
    { label: "(−) Desp. Administrativas", value: -n(d.despesas_administrativas), kind: "out" },
    { label: "Resultado Operacional", value: n(d.resultado_operacional), kind: "total" },
    { label: "(−) Desp. Financeiras", value: -n(d.despesas_financeiras), kind: "out" },
    { label: "Lucro Líquido", value: n(d.lucro_liquido), kind: "total" },
    { label: "(−) Retirada de Lucro", value: -n(d.retirada_lucro), kind: "out" },
    { label: "Lucro Final", value: n(d.lucro_final), kind: "total" },
  ];
}

function DreRows({ data }: { data: DreAtual }) {
  const rows = buildRows(data);
  const bruta = Number(data.receita_bruta);
  const temReceita = Math.abs(bruta) > 0.01;
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.value)), 1);

  return (
    <div className="space-y-1">
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
