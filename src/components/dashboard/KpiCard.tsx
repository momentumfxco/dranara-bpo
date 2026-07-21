import { Card } from "./Card";
import { TrendBadge } from "./TrendBadge";

export function KpiCard({
  label,
  value,
  trendPct,
  hint,
}: {
  label: string;
  value: string;
  trendPct?: number | null;
  hint?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {trendPct !== undefined && <TrendBadge pct={trendPct} />}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
