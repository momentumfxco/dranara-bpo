import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader } from "./Card";
import { useConsultaVsRetorno, useDreMes } from "@/lib/dashboard-queries";
import { DreSectionDetail } from "./DreSectionDetail";
import type { Section } from "./DreWaterfall";

const COLORS = ["var(--color-chart-1)", "var(--color-chart-4)"];

export function ConsultaRetornoDonut({
  mes,
  detailSection,
  onCloseDetail,
}: {
  mes: string;
  detailSection?: Section | null;
  onCloseDetail?: () => void;
}) {
  const { data, isLoading } = useConsultaVsRetorno(mes);
  const dre = useDreMes(mes);
  const rows = data ?? [];
  const total = rows.reduce((s, r) => s + r.value, 0);
  const showDetail = !!detailSection;

  return (
    <Card className="overflow-hidden">
      {!showDetail && <CardHeader title="Consulta x Retorno" subtitle="Composição de atendimentos do mês" />}
      <div className="relative h-72">
        <div
          className={`absolute inset-0 flex items-center gap-4 transition-all duration-300 ease-out ${
            showDetail ? "translate-x-6 scale-[.97] opacity-0" : "translate-x-0 scale-100 opacity-100"
          }`}
        >
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
                      contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold text-foreground">{total}</span>
                  <span className="text-xs text-muted-foreground">Total</span>
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
                    <span className="font-medium text-foreground">{r.value}</span> · {pct.toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {detailSection && (
          <div
            className={`absolute inset-0 transition-all duration-300 ease-out ${
              showDetail
                ? "translate-x-0 scale-100 opacity-100 shadow-[-16px_0_28px_-22px_rgba(0,0,0,0.35)]"
                : "pointer-events-none -translate-x-8 scale-[.97] opacity-0"
            }`}
          >
            {dre.data && (
              <DreSectionDetail
                section={detailSection}
                data={dre.data}
                bruta={Number(dre.data.total_receita_bruta ?? 0)}
                onClose={() => onCloseDetail?.()}
              />
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
