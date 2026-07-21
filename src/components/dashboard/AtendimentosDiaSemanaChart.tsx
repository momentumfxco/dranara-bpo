import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader } from "./Card";
import { useAtendimentosPorDiaSemana } from "@/lib/dashboard-queries";

export function AtendimentosDiaSemanaChart({ mes }: { mes: string }) {
  const { data, isLoading } = useAtendimentosPorDiaSemana(mes);
  return (
    <Card>
      <CardHeader title="Atendimentos por dia da semana" subtitle="Distribuição semanal do mês" />
      <div className="h-72">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Carregando…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }}
              />
              <Bar dataKey="total" name="Atendimentos" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
