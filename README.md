# Dra Nara Insights

# Prompt de construção — Dashboard Consultório Dra Nara

## Contexto
Dashboard financeiro/operacional para a proprietária de um consultório médico. Público: 1 usuária (não-técnica), acesso via login fixo. Estilo visual de referência: dashboard SaaS "Nexus" (Dipa Product) — limpo, cards brancos arredondados, sombra leve, tipografia tipo Inter/SF Pro, paleta roxo #5347CE / #887CFD, azul #4896FE, teal #16C8C7. Badges de tendência: verde ↑ / vermelho ↓.

## Autenticação
Conectar ao projeto Supabase existente (ref vfhsvzvbnfuavtjxwmxu) via integração nativa do Lovable. Usar Supabase Auth (e-mail/senha) para uma tela de login simples — já existe 1 usuário criado (andreia.bpofinanceiro2025@gmail.com). Sem cadastro público, sem "esqueci minha senha" visível (usuária única). Toda a aplicação fica atrás do login — nenhuma tela acessível sem autenticar.

IMPORTANTE — verificar RLS: antes de finalizar, confirmar que as tabelas abaixo têm Row Level Security habilitado com policy permitindo SELECT para usuários autenticados (authenticated) — sem isso, a proteção de login é só cosmética.

## Fonte de dados
Supabase (mesmo projeto), tabelas e view já existentes:

fluxo_caixa_historico: id, mes_referencia (date), data (date), descricao (text), categoria (text: 'Despesa'|'Receita'), valor (numeric), conta_bancaria (text: 'Banco Inter'|'Banco Itau'|'Mercado Pago'|'Dinheiro'), created_at

fluxo_caixa_resumo_mensal (view): mes_referencia, conta_bancaria, categoria, total

atendimentos_historico: id, mes_referencia (date), data (date), paciente (text), tipo_consulta (text: 'Consulta'|'Retorno'), valor (numeric), pagamento (text), origem (text), created_at

Mais uma fonte externa (Google Sheets, leitura periódica — não faz parte do Supabase):

Planilha: 1yeM9e2pgskpsHZiKHWNRyW0g_7gfHUNPavj861dKfHA
Aba "DRE" (gid 1537863017), range B7:C23, estrutura fixa linha a linha:
  Cartão Crédito, Cartão Débito, Pix, Boleto → Receita Bruta
  Taxas de cartão, Impostos → Receita Líquida
  Despesa Operacionais, Despesas Administrativas → Resultado Operacional
  Despesas Financeiras → Lucro Líquido
  Retirada de Lucro → Lucro Final

(Essa leitura pode ser feita via uma Edge Function/rota de API que busca esse range e devolve JSON — ou, mais simples pro MVP, um n8n que sincroniza esses valores pra uma tabela pequena no Supabase, ex: dre_atual, uma vez por dia. Decidir a abordagem técnica na implementação; o importante é sempre refletir o mês corrente, sem histórico.)

## Filtro global
Seletor de Mês/Ano no topo do dashboard. Aplica a todos os cards, EXCETO os cards de DRE (sempre mês corrente, sem seletor).

## Layout — 4 linhas de cards

Linha 1 — KPIs (5 cards, número grande + badge de variação % vs. mês anterior)
1. Receita do mês — SUM(valor) de fluxo_caixa_historico WHERE categoria='Receita' AND mes_referencia=:mes
2. Despesa do mês — idem, categoria='Despesa'
3. Resultado do mês — Receita − Despesa
4. Ticket médio por consulta — AVG(valor) de atendimentos_historico WHERE mes_referencia=:mes
5. Margem de Lucro (%) — da DRE atual: Lucro Final ÷ Receita Bruta × 100 (sempre mês corrente, sem seletor)

Linha 2
- Fluxo de Caixa mensal (gráfico de área/barra empilhada, estilo "Sales Overview" do Nexus): fluxo_caixa_resumo_mensal, últimos 6-12 meses, eixo X = mes_referencia, séries por conta_bancaria, separado por categoria (Receita vs Despesa)
- Atendimentos por dia da semana (gráfico de barras, estilo "Total Subscriber"): COUNT(*) de atendimentos_historico WHERE mes_referencia=:mes GROUP BY dia da semana extraído de data

Linha 3
- DRE do mês (waterfall/cascata): Receita Bruta → (−) Taxas de cartão → (−) Impostos → Receita Líquida → (−) Desp. Operacionais → (−) Desp. Administrativas → Resultado Operacional → (−) Desp. Financeiras → Lucro Líquido → (−) Retirada de Lucro → Lucro Final. Mostrar valor em R$ e % sobre a Receita Bruta em cada linha. Sempre mês corrente.
- Consulta x Retorno (donut): COUNT(*) de atendimentos_historico WHERE mes_referencia=:mes GROUP BY tipo_consulta

Linha 4
- Receita por forma de recebimento (donut): direto da DRE atual — Cartão Crédito, Cartão Débito, Pix, Boleto (valores absolutos e %)
- Alerta de taxa de cartão (card de destaque/callout, não gráfico): Taxas de cartão ÷ Receita Bruta × 100, da DRE atual. Se acima de um limite configurável (ex: 3%), destacar visualmente (cor de atenção)

## Fora de escopo (não incluir)
- Contas a Pagar / Contas a Receber
- Conciliação de Cartão
- Conciliação Bancária Completa
- Histórico de DRE por mês (funcionalidade futura, sem dado histórico disponível ainda)

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://dranara-bpo.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/617245c0-dd40-499b-8418-c2ae1175bb86).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
