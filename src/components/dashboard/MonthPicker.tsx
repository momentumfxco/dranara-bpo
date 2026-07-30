import { currentMonth } from "@/lib/dashboard-queries";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function MonthPicker({
  value,
  ano,
  onChange,
}: {
  /** mês no formato "01".."12" */
  value: string;
  /** ano selecionado, usado para desabilitar meses futuros */
  ano: string;
  onChange: (mes: string) => void;
}) {
  const [anoAtual, mesAtual] = currentMonth().split("-");
  const limite = ano === anoAtual ? Number(mesAtual) : 12;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium text-foreground shadow-card outline-none focus:ring-2 focus:ring-ring"
    >
      {MESES.map((nome, i) => {
        const num = String(i + 1).padStart(2, "0");
        return (
          <option key={num} value={num} disabled={i + 1 > limite}>
            {nome}
          </option>
        );
      })}
    </select>
  );
}
