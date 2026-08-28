import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader } from "./Card";
import { BRL, formatMesLabel } from "@/lib/format";
import { useFluxoCaixaSerie } from "@/lib/dashboard-queries";

export function FluxoCaixaChart({ mesAte }: { mesAte: string }) {
  const { data, isLoading } = useFluxoCaixaSerie(mesAte);
  const rows = (data ?? []).map((d) => ({ ...d, mesLabel: formatMesLabel(d.mes) }));

  return (
    <Card>
      <CardHeader title="Fluxo de Caixa" subtitle="Receita vs Despesa — últimos 12 meses" />
      <div className="h-72">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Carregando…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="mesLabel" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }}
                formatter={(v: number) => BRL.format(v)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              <Bar dataKey="receita" name="Receita" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="despesa" name="Despesa" fill="var(--color-destructive)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
