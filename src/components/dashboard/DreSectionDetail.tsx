import { ArrowLeft } from "lucide-react";
import { BRL2 } from "@/lib/format";
import type { DreAtual } from "@/lib/dashboard-queries";
import type { Field, Section } from "./DreWaterfall";

export function DreSectionDetail({
  section,
  data,
  bruta,
  onClose,
}: {
  section: Section;
  data: DreAtual;
  bruta: number;
  onClose: () => void;
}) {
  const n = (f: Field) => Number(data?.[f] ?? 0);
  const totalRaw = n(section.totalField);
  const total = section.sign === -1 ? -Math.abs(totalRaw) : totalRaw;
  const rows = section.details.map((d) => {
    const sign = d.sign ?? section.sign;
    const value = sign === -1 ? -n(d.field) : n(d.field);
    return { label: d.label, value };
  });
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.value)), 1);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Detalhamento</p>
          <h3 className="truncate text-sm font-semibold text-foreground">{section.totalLabel}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Total do item: <span className="font-medium tabular-nums text-foreground">{BRL2.format(total)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Voltar para Consulta x Retorno"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-input bg-card text-muted-foreground shadow-card transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">Esse item não tem composição própria — é um resultado calculado.</p>
      ) : (
        <ul className="flex-1 space-y-3 overflow-y-auto pr-1">
          {rows.map((r) => {
            const pct = bruta ? (r.value / bruta) * 100 : 0;
            return (
              <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_44px] items-center gap-3">
                <span className="truncate text-xs font-medium text-foreground">{r.label}</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(Math.abs(r.value) / maxAbs) * 100}%`, background: section.color }}
                  />
                </div>
                <span className={`text-right text-xs tabular-nums ${r.value < 0 ? "text-destructive" : "text-foreground"}`}>
                  {BRL2.format(r.value)}
                </span>
                <span className="text-right text-[11px] tabular-nums text-muted-foreground">{pct.toFixed(1)}%</span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 border-t border-dashed border-border pt-3 text-[11px] text-muted-foreground">
        Clique de novo em "{section.totalLabel}" na DRE, ou na seta acima, pra voltar.
      </p>
    </div>
  );
}
