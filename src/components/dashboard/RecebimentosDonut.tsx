import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader } from "./Card";
import { BRL2, formatMesLabel } from "@/lib/format";
import { useDreMes } from "@/lib/dashboard-queries";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

export function RecebimentosDonut({ mes }: { mes: string }) {
  const { data, isLoading } = useDreMes(mes);
  const rows = data
    ? [
        { name: "Receitas de Cartão", value: Number(data.receitas_cartao) },
        { name: "Receitas de PIX", value: Number(data.receitas_pix) },
        { name: "Aporte Dra Nara", value: Number(data.aporte_dra_nara) },
      ].filter((r) => r.value > 0)
    : [];
  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <Card>
      <CardHeader title="Receita por forma de recebimento" subtitle={`DRE — ${formatMesLabel(mes)}`} />
      <div className="flex h-72 items-center gap-4">
        <div className="relative h-full w-1/2">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Carregando…</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rows} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {rows.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => BRL2.format(v)}
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold text-foreground">{BRL2.format(total)}</span>
                <span className="text-xs text-muted-foreground">Receita Bruta</span>
              </div>
            </>
          )}
        </div>
        <ul className="flex-1 space-y-2 text-sm">
          {rows.map((r, i) => {
            const pct = total ? (r.value / total) * 100 : 0;
            return (
              <li key={r.name} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-foreground">{r.name}</span>
                </span>
                <span className="tabular-nums text-muted-foreground">
                  <span className="font-medium text-foreground">{BRL2.format(r.value)}</span> · {pct.toFixed(1)}%
                </span>
              </li>
            );
          })}
          {!rows.length && !isLoading && (
            <li className="text-xs text-muted-foreground">Sem dados de DRE ainda.</li>
          )}
        </ul>
      </div>
    </Card>
  );
}
