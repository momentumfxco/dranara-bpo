import { ArrowDown, ArrowUp } from "lucide-react";
import { PCT } from "@/lib/format";

export function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null || !isFinite(pct)) {
    return <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">—</span>;
  }
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
        up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      }`}
    >
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {PCT(Math.abs(pct))}
    </span>
  );
}
