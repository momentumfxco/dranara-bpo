import { currentMonth } from "@/lib/dashboard-queries";

export function MonthPicker({ value, onChange }: { value: string; onChange: (m: string) => void }) {
  const now = currentMonth();
  return (
    <input
      type="month"
      value={value}
      max={now}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium text-foreground shadow-card outline-none focus:ring-2 focus:ring-ring"
    />
  );
}
