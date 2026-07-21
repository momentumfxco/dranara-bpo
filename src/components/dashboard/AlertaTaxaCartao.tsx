import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "./Card";
import { BRL2 } from "@/lib/format";
import { useDreAtual } from "@/lib/dashboard-queries";

export const TAXA_CARTAO_LIMITE_PCT = 3;

export function AlertaTaxaCartao() {
  const { data, isLoading } = useDreAtual();
  const receita = Number(data?.receita_bruta ?? 0);
  const taxa = Number(data?.taxas_cartao ?? 0);
  const pct = receita > 0 ? (taxa / receita) * 100 : 0;
  const alto = pct > TAXA_CARTAO_LIMITE_PCT;

  return (
    <Card className={alto ? "border border-destructive/40 bg-destructive/5" : ""}>
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            alto ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
          }`}
        >
          {alto ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Taxa de cartão</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Limite alerta: {TAXA_CARTAO_LIMITE_PCT}% da Receita Bruta (mês corrente)
          </p>
          <div className="mt-4 flex items-baseline gap-3">
            <span
              className={`text-3xl font-semibold tracking-tight ${alto ? "text-destructive" : "text-foreground"}`}
            >
              {isLoading ? "—" : `${pct.toFixed(2)}%`}
            </span>
            <span className="text-xs text-muted-foreground">
              {BRL2.format(taxa)} de {BRL2.format(receita)}
            </span>
          </div>
          <p className={`mt-3 text-xs ${alto ? "text-destructive" : "text-muted-foreground"}`}>
            {alto
              ? "Acima do limite — revise contratos de maquininha."
              : "Dentro do limite aceitável."}
          </p>
        </div>
      </div>
    </Card>
  );
}
