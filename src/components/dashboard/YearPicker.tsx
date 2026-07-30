export function YearPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (ano: string) => void;
}) {
  const now = new Date().getFullYear();
  const anos = Array.from({ length: 5 }, (_, i) => String(now - i));

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium text-foreground shadow-card outline-none focus:ring-2 focus:ring-ring"
    >
      {anos.map((ano) => (
        <option key={ano} value={ano}>
          {ano}
        </option>
      ))}
    </select>
  );
}
