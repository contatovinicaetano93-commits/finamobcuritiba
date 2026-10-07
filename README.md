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

- CRM próprio da praça: incorporadoras, construtoras e novos, com dono, estágio da ativação, contato, telefone, e-mail e próximo passo
- Lista densa e pipeline (Novo → Abordar → Em conversa → Follow-up → Mandato)
- Base da praça: 420 incorporadoras e construtoras no raio de Curitiba (backup Radar). Botão **Carregar praça Curitiba** no CRM
- Importar Excel, CSV, JSON ou ZIP (merge: não apaga ativação já registrada)
- Fila do dia (sua e da casa)
- KPIs do mês e pipeline
- Metas da casa e de cada sócio
- Exportar o quadro JSON para os três trabalharem no mesmo navegador até existir servidor
- `/admin/integracao` — porta para uma API oficial: cole URL e token que a casa emitir. Sem chave, a base entra pelo arquivo.

Senha local padrão: `cwb-socios` (troquem com `VITE_ADMIN_PASSWORD`). Os dados ficam neste navegador; usem exportar para passar o quadro ao outro sócio.

A mesa **não** abre o CRM de outro sistema por conta própria. Quando houver URL, token e o JSON no formato da mesa (`VITE_CRM_API_URL` / `VITE_CRM_API_TOKEN`, ou os campos em Integração), o botão **Puxar agora** troca as contas locais pelas da API.

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
