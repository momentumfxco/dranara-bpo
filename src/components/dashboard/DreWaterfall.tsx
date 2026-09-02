import { useState } from "react";
import { ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { Card, CardHeader } from "./Card";
import { BRL2, formatMesLabel, variationPct } from "@/lib/format";
import { useDreMes, useDreAno, currentYear, prevMonth, type DreAtual } from "@/lib/dashboard-queries";
import { YearPicker } from "./YearPicker";
import { TrendBadge } from "./TrendBadge";

type Field = keyof DreAtual;

type Section = {
  totalField: Field;
  totalLabel: string;
  tip: string;
  color: string;
  sign: 1 | -1;
  details: { label: string; field: Field; sign?: 1 | -1 }[];
};

const SECTIONS: Section[] = [
  {
    totalField: "total_receita_bruta",
    totalLabel: "Total Receita Bruta",
    tip: "Tudo o que entrou no período, antes de descontar taxas e impostos.",
    color: "var(--color-success)",
    sign: 1,
    details: [
      { label: "Receitas de Cartão", field: "receitas_cartao" },
      { label: "Receitas de PIX", field: "receitas_pix" },
      { label: "Receitas Antecipadas", field: "receitas_antecipadas" },
      { label: "Outras Receitas", field: "outras_receitas" },
      { label: "Aporte Dra Nara", field: "aporte_dra_nara" },
    ],
  },
  {
    totalField: "total_deducoes_receita",
    totalLabel: "Total de Deduções",
    tip: "Valores que saem direto da receita: taxas de cartão, impostos e devoluções.",
    color: "var(--color-success)",
    sign: -1,
    details: [
      { label: "Taxas de Cartão", field: "taxas_cartao" },
      { label: "Impostos", field: "impostos" },
      { label: "Devoluções/Cancelamento", field: "devolucoes_cancelamento" },
      { label: "Outras Deduções", field: "outras_deducoes" },
    ],
  },
  {
    totalField: "receita_liquida",
    totalLabel: "Receita Líquida",
    tip: "O que sobra da receita bruta depois das deduções — a base real do negócio.",
    color: "var(--color-success)",
    sign: 1,
    details: [],
  },
  {
    totalField: "total_despesas_operacionais",
    totalLabel: "Total Despesas Operacionais",
    tip: "Custos para o consultório funcionar no dia a dia (aluguel, transporte, equipe).",
    color: "var(--color-chart-3)",
    sign: -1,
    details: [
      { label: "Uber", field: "uber" },
      { label: "Aluguel", field: "aluguel" },
      { label: "Gasolina", field: "gasolina" },
      { label: "Secretárias e IA", field: "secretarias_ia" },
      { label: "Outros Custos Operacionais", field: "outros_despesas_operacionais" },
    ],
  },
  {
    totalField: "total_despesas_comerciais_marketing",
    totalLabel: "Total Desp. Comerciais/Marketing",
    tip: "Gastos para atrair pacientes: anúncios, mídia e produção de conteúdo.",
    color: "var(--color-chart-1)",
    sign: -1,
    details: [
      { label: "Ferramentas de Marketing", field: "ferramentas_marketing" },
      { label: "Anúncios Online", field: "anuncios_online" },
      { label: "Editor de Vídeo", field: "editor_video" },
      { label: "Outros Gastos com Marketing", field: "outros_marketing" },
    ],
  },
  {
    totalField: "total_despesas_administrativas",
    totalLabel: "Total Despesas Administrativas",
    tip: "Gastos de gestão do negócio: pró-labore, contabilidade e BPO.",
    color: "var(--color-warning)",
    sign: -1,
    details: [
      { label: "Pró-labore", field: "pro_labore" },
      { label: "Contabilidade", field: "contabilidade" },
      { label: "BPO Financeiro", field: "bpo_financeiro" },
      { label: "Outras Desp. Administrativas", field: "outras_despesas_administrativas" },
      { label: "Gastos Pessoais da Sócia", field: "gastos_pessoais_socia" },
    ],
  },
  {
    totalField: "total_despesas_financeiras",
    totalLabel: "Total Despesas Financeiras",
    tip: "Custos do dinheiro: juros, tarifas do banco e encargos.",
    color: "var(--color-destructive)",
    sign: -1,
    details: [
      { label: "Juros", field: "juros" },
      { label: "Manutenção de Conta", field: "manutencao_conta" },
      { label: "Tarifas Bancárias", field: "tarifas_bancarias" },
      { label: "Outros Encargos Financeiros", field: "outros_encargos_financeiros" },
    ],
  },
  {
    totalField: "lucro_prejuizo_periodo",
    totalLabel: "Lucro / Prejuízo do Período",
    tip: "O resultado final: o que sobrou (ou faltou) depois de todas as despesas e da antecipação de lucro retirada pela Dra Nara.",
    color: "var(--color-primary)",
    sign: 1,
    details: [
      { label: "Resultado do Mês", field: "resultado_do_mes", sign: 1 },
      { label: "Antecipação de Lucro", field: "antecipacao_lucro", sign: -1 },
    ],
  },
];

function Tip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <HelpCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
      <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-1 hidden w-56 rounded-lg border border-border bg-popover p-2 text-[11px] leading-snug font-normal text-popover-foreground shadow-card group-hover:block">
        {text}
      </span>
    </span>
  );
}

function ValueRow({
  label,
  value,
  pct,
  width,
  color,
  isTotal,
  tip,
  trend,
  onToggle,
  expanded,
  hasDetails,
}: {
  label: string;
  value: number;
  pct: string;
  width: number;
  color: string;
  isTotal: boolean;
  tip?: string;
  trend?: number | null;
  onToggle?: () => void;
  expanded?: boolean;
  hasDetails?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)_minmax(0,1fr)_44px_64px] items-center gap-3 rounded-lg px-2 py-1.5 ${
        isTotal ? "bg-muted/50" : ""
      }`}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        {isTotal && hasDetails ? (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1 truncate text-left text-xs font-semibold text-foreground"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">{label}</span>
          </button>
        ) : (
          <span
            className={`truncate text-xs ${isTotal ? "pl-5 font-semibold text-foreground" : "pl-5 text-muted-foreground"}`}
          >
            {label}
          </span>
        )}
        {tip && <Tip text={tip} />}
      </span>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${width}%`, background: color, opacity: isTotal ? 1 : 0.55 }}
        />
      </div>
      <span
        className={`text-right text-xs tabular-nums ${
          value < 0 ? "text-destructive" : isTotal ? "font-semibold text-foreground" : "text-foreground"
        }`}
      >
        {BRL2.format(value)}
      </span>
      <span className="text-right text-[11px] tabular-nums text-muted-foreground">{pct}</span>
      <span className="flex justify-end">{isTotal ? <TrendBadge pct={trend ?? null} /> : null}</span>
    </div>
  );
}

function DreRows({
  data,
  anterior,
  detalhado,
}: {
  data: DreAtual;
  anterior: DreAtual | null | undefined;
  detalhado: boolean;
}) {
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const n = (d: DreAtual | null | undefined, f: Field) => Number(d?.[f] ?? 0);

  const bruta = n(data, "total_receita_bruta");
  const temReceita = Math.abs(bruta) > 0.01;
  const todos = SECTIONS.flatMap((s) => [
    n(data, s.totalField),
    ...s.details.map((d) => n(data, d.field)),
  ]);
  const maxAbs = Math.max(...todos.map(Math.abs), 1);

  return (
    <div className="max-h-96 space-y-1 overflow-y-auto pr-1">
      {SECTIONS.map((s) => {
        const raw = n(data, s.totalField);
        const value = s.sign === -1 ? -Math.abs(raw) : raw;
        const trend = variationPct(raw, n(anterior, s.totalField));
        const expanded = detalhado || !!abertos[s.totalField];
        return (
          <div key={s.totalField} className="space-y-1">
            <ValueRow
              label={s.totalLabel}
              value={value}
              pct={temReceita ? `${((value / bruta) * 100).toFixed(1)}%` : "—"}
              width={(Math.abs(value) / maxAbs) * 100}
              color={s.color}
              isTotal
              tip={s.tip}
              trend={trend}
              hasDetails={s.details.length > 0}
              expanded={expanded}
              onToggle={() => setAbertos((p) => ({ ...p, [s.totalField]: !expanded }))}
            />
            {expanded &&
              s.details.map((d) => {
                const dSign = d.sign ?? s.sign;
                const dv = dSign === -1 ? -n(data, d.field) : n(data, d.field);
                return (
                  <ValueRow
                    key={d.field}
                    label={dSign === -1 ? `(−) ${d.label}` : d.label}
                    value={dv}
                    pct={temReceita ? `${((dv / bruta) * 100).toFixed(1)}%` : "—"}
                    width={(Math.abs(dv) / maxAbs) * 100}
                    color={s.color}
                    isTotal={false}
                  />
                );
              })}
          </div>
        );
      })}
    </div>
  );
}

function PeriodoToggle({
  periodo,
  onChange,
}: {
  periodo: "mensal" | "anual";
  onChange: (p: "mensal" | "anual") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-input bg-card p-0.5 text-xs shadow-card">
      {(["mensal", "anual"] as const).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`rounded-md px-2.5 py-1 font-medium capitalize transition ${
            periodo === p
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export function DreWaterfall({ mes }: { mes: string }) {
  const [periodo, setPeriodo] = useState<"mensal" | "anual">("mensal");
  const [ano, setAno] = useState(currentYear());
  const [detalhado, setDetalhado] = useState(false);

  const mensal = useDreMes(mes);
  const mensalAnterior = useDreMes(prevMonth(mes));
  const anual = useDreAno(ano);
  const anualAnterior = useDreAno(String(Number(ano) - 1));

  const isLoading = periodo === "mensal" ? mensal.isLoading : anual.isLoading;
  const data = periodo === "mensal" ? mensal.data : anual.data;
  const anterior = periodo === "mensal" ? mensalAnterior.data : anualAnterior.data;
  const subtitle =
    periodo === "mensal"
      ? `Estrutura de resultado — ${formatMesLabel(mes)}`
      : `Estrutura de resultado — ${ano}${
          anual.data
            ? ` (${anual.data.mesesFechados}${anual.data.mesAtualIncluido ? " + mês atual" : ""} de 12 meses)`
            : ""
        }`;

  return (
    <Card>
      <CardHeader
        title={periodo === "mensal" ? "DRE do mês" : "DRE do ano"}
        subtitle={subtitle}
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDetalhado((v) => !v)}
              className="rounded-lg border border-input bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-card transition hover:text-foreground"
            >
              {detalhado ? "Ocultar detalhes" : "Ver detalhes"}
            </button>
            {periodo === "anual" && <YearPicker value={ano} onChange={setAno} />}
            <PeriodoToggle periodo={periodo} onChange={setPeriodo} />
          </div>
        }
      />
      {isLoading || !data ? (
        <div className="flex h-72 items-center justify-center text-xs text-muted-foreground">
          {isLoading ? "Carregando…" : "Sem dados de DRE ainda."}
        </div>
      ) : (
        <DreRows
          key={`${periodo}-${periodo === "mensal" ? mes : ano}-${detalhado}`}
          data={data}
          anterior={anterior}
          detalhado={detalhado}
        />
      )}
    </Card>
  );
}
