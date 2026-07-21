export const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
export const BRL2 = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
export const PCT = (v: number, digits = 1) =>
  `${v >= 0 ? "" : ""}${v.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;

export function variationPct(atual: number, anterior: number): number | null {
  if (!anterior) return null;
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

export const MES_LABEL: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

export function formatMesLabel(mes: string): string {
  const [y, m] = mes.split("-");
  return `${MES_LABEL[m]}/${y.slice(2)}`;
}
