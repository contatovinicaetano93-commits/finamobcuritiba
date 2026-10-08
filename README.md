# Finamob Curitiba

Site da Finamob Curitiba: funding imobiliário para incorporadores e loteadores.

A landing segue a estrutura do site nacional — produtos, elo, mercado de capitais, veículos, formulário, Farejador e imprensa — sempre como **Finamob Curitiba**.

O `/farejador` reproduz o motor de leitura da mesa (praça, produto, economics e player) para o incorporador avaliar o projeto neste site.

As áreas `/incorporador` e `/parceiro` separam o canal de funding do canal de originação. `/area` é a escolha entre os dois.

- Site: https://finamobcuritiba.vercel.app
- Código: https://github.com/contatovinicaetano93-commits/finamobcuritiba

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://127.0.0.1:43123`.

## Neon

A mesa lê a base no Neon (`DATABASE_URL` no `.env`, fora do git). Já entram 8.498 empresas do Brasil e 40.521 empreendimentos. O CRM abre na praça Curitiba (420) e filtra por Paraná, Sul, Brasil, UF e cidade.

```bash
python3 scripts/apply_neon_schema.py
python3 scripts/seed_neon_radar.py
npm run dev
```

A API local/Vercel fica em `/api/crm`. Copie `DATABASE_URL` no painel da Vercel para a mesa em produção.

- `/` — landing (Produtos, Formulário, Farejador, Contato)
- `/area` — escolha entre incorporador e originador parceiro
- `/incorporador` — área do incorporador / loteador (formulário travado)
- `/parceiro` — área do originador parceiro (formulário travado)
- `/farejador` — motor de leitura (praça, produto, economics, player)
- `/solucoes` — catálogo completo
- `/contato` — formulário incorporador / parceiro originador
- `/folder` — folder em slides + PDF
- `/mostruario` — mostruário de cliente (20 páginas) + download do PDF
- `/sofa-aberto` — convite Sofá Aberto (incorporadores e construtores) + artes para disparar
- `/admin` — mesa dos sócios (Vini, Rafa, Tadeu): CRM da praça, fila do dia, KPIs e metas

## Mesa dos sócios (`/admin`)

Área fechada para os três. Não aparece no menu público.

- CRM no Neon: 8.498 empresas do Brasil e 40.521 empreendimentos. O recorte padrão é a **praça Curitiba** (420 no raio de 100 km)
- Filtros: Praça Curitiba, Paraná, Sul, Brasil, região, UF e cidade
- Card da empresa lista os empreendimentos do dump (nome, cidade, estágio, unidades)
- Lista e pipeline (Novo → Abordar → Em conversa → Follow-up → Mandato)
- Fila do dia, KPIs e metas no Neon (`activity_log` + `month_goals`), com identidade do sócio na sessão
- Importar Excel, CSV, JSON ou ZIP (merge: não apaga ativação já registrada)
- `/admin/integracao` — porta para uma API oficial: cole URL e token que a casa emitir

Senha local padrão: `cwb-socios` (troquem com `VITE_ADMIN_PASSWORD` e `ADMIN_PASSWORD`). A base de contas vive no Postgres; não commite `DATABASE_URL`.

A mesa **não** abre o CRM de outro sistema por conta própria.

## PDF

[`Folder-Institucional-Finamob-Curitiba.pdf`](./Folder-Institucional-Finamob-Curitiba.pdf) — folder institucional.

[`Finamob-Curitiba-Mostruario.pdf`](./Finamob-Curitiba-Mostruario.pdf) — mostruário para o cliente: quem somos, como operamos, tese de funding, prateleira e veículos. Não é material de treinamento interno.

Para regenerar o folder institucional a partir do original em `source/`:

```bash
python3 -m pip install -r requirements.txt
python3 scripts/apply_curitiba.py
```

Para regenerar o mostruário:

```bash
python3 -m pip install -r requirements.txt
python3 scripts/build_curitiba_showcase.py
```
