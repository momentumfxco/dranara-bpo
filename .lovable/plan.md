## Objetivo
Dashboard single-user (Dra Nara / Andreia) atrás de login Supabase, consumindo tabelas existentes (`fluxo_caixa_historico`, view `fluxo_caixa_resumo_mensal`, `atendimentos_historico`) e uma nova tabela `dre_atual` alimentada por n8n a partir da planilha Google Sheets.

## 1. Backend / Supabase
- Conectar Lovable Cloud ao projeto Supabase existente (ref `vfhsvzvbnfuavtjxwmxu`).
- Migration: criar tabela `dre_atual` (linha única por chave fixa, atualizada pelo n8n diariamente):
  - colunas: `id` (pk), `atualizado_em` (timestamptz), campos numéricos para cada linha do range B7:C23 — `cartao_credito`, `cartao_debito`, `pix`, `boleto`, `receita_bruta`, `taxas_cartao`, `impostos`, `receita_liquida`, `despesas_operacionais`, `despesas_administrativas`, `resultado_operacional`, `despesas_financeiras`, `lucro_liquido`, `retirada_lucro`, `lucro_final`.
  - GRANTs para `authenticated` e `service_role`.
- Verificar/ativar RLS em todas as 4 tabelas e criar policy `SELECT TO authenticated USING (true)` — a app é single-user autenticada; `dre_atual` também recebe policy de UPDATE/INSERT via `service_role` (n8n usa service key).
- Não criar signup / reset password. Login fixo email+senha via Supabase Auth.

## 2. Estrutura de rotas (TanStack)
- `src/routes/auth.tsx` — tela pública de login (email/senha).
- `src/routes/_authenticated/route.tsx` — gate gerenciado (ssr:false, redireciona para `/auth`).
- `src/routes/_authenticated/dashboard.tsx` — dashboard principal (rota home protegida).
- `src/routes/index.tsx` — landing mínima que redireciona: se logado → `/dashboard`, senão → `/auth`.
- Header com botão sair + nome da usuária.

## 3. Filtro global mês/ano
- Estado na URL via `validateSearch` (`?mes=YYYY-MM`), default = mês corrente.
- Componente `<MonthPicker>` no topo do dashboard. Não afeta cards de DRE nem cálculos da DRE (sempre mês corrente).

## 4. Server functions (leitura, `requireSupabaseAuth`)
Todas em `src/lib/dashboard.functions.ts`:
- `getKpisMes({ mes })` → soma receitas, despesas, resultado, ticket médio, + mesmos valores do mês anterior para variação %.
- `getMargemLucro()` → lê `dre_atual`, retorna `lucro_final / receita_bruta * 100` e delta vs. nada (badge sem variação; ou omitida se não houver histórico).
- `getFluxoCaixaSerie({ mesAte })` → últimos 12 meses até o mês selecionado, da view `fluxo_caixa_resumo_mensal`, agrupado por mês/categoria/conta.
- `getAtendimentosPorDiaSemana({ mes })` → COUNT group by extract(dow from data).
- `getConsultaVsRetorno({ mes })` → COUNT group by tipo_consulta.
- `getDreAtual()` → linha única de `dre_atual` para waterfall + donut de recebimentos + alerta de taxa.

Todas TanStack Query com `queryKey` incluindo `mes`, primadas via `ensureQueryData` no loader de `/dashboard`.

## 5. Componentes visuais (estilo Nexus)
`src/components/dashboard/`:
- `MonthPicker.tsx`
- `KpiCard.tsx` — número grande, label, badge ↑/↓ verde/vermelho com % vs mês anterior.
- `KpisRow.tsx` — 5 KPIs: Receita, Despesa, Resultado, Ticket médio, Margem de Lucro (essa sem badge ou com badge desabilitada, pois sempre mês corrente).
- `FluxoCaixaChart.tsx` — barras empilhadas por conta bancária, Receita vs Despesa, últimos 12 meses (recharts).
- `AtendimentosDiaSemanaChart.tsx` — barras verticais Seg–Dom.
- `DreWaterfall.tsx` — cascata com Receita Bruta → deduções → subtotais → Lucro Final, exibindo R$ e % da Receita Bruta em cada linha (recharts BarChart com composição manual — sem dependências novas).
- `ConsultaRetornoDonut.tsx` — donut.
- `RecebimentosDonut.tsx` — donut Cartão Crédito/Débito/Pix/Boleto (valores e %).
- `AlertaTaxaCartao.tsx` — card destaque; se `taxas_cartao / receita_bruta * 100 > 3` usa cor `destructive`; senão neutro. Limite = constante `TAXA_CARTAO_LIMITE_PCT = 3` no código.

Layout: grid responsivo 4 linhas conforme especificação (linha 1: 5 cols; linhas 2-4: 2 cols cada em desktop, empilha no mobile).

## 6. Design system
Atualizar `src/styles.css` com tokens semânticos:
- `--primary` → roxo #5347CE, `--primary-glow` → #887CFD (gradientes).
- `--chart-1..5` mapeando para paleta pedida (roxo, roxo claro, azul #4896FE, teal #16C8C7, cinza).
- Cards brancos, `--radius: 1rem`, sombra suave via `--shadow-card`.
- Fonte Inter via `<link>` em `__root.tsx` head.
- Meta tags específicas de `/dashboard` (título "Dashboard — Consultório Dra Nara").

## 7. Fora deste plano
- Sincronização Sheets → `dre_atual` fica com o n8n (o usuário confirmou). A app apenas lê a tabela.
- Sem contas a pagar/receber, conciliação, histórico DRE.
- Sem tela de configurações (limite de taxa fixo em código).

## Detalhes técnicos
- Client Supabase browser em `@/integrations/supabase/client` (gerado pela integração).
- `attachSupabaseAuth` middleware append em `src/start.ts`.
- Root `__root.tsx`: `onAuthStateChange` filtrado (SIGNED_IN/SIGNED_OUT/USER_UPDATED) invalidando router+queries; botão de logout implementa hygiene (cancel/clear/signOut/navigate replace).
- Variação % vs mês anterior calculada no servidor no mesmo query para evitar round-trip duplo.
- Waterfall: renderizado como lista de linhas + barra proporcional (não requer plugin), somando/subtraindo item a item.
