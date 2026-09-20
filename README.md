# Finamob Curitiba

Site da Finamob Curitiba: funding imobiliário para incorporadores e loteadores.

A landing segue a estrutura do site nacional — produtos, elo, mercado de capitais, veículos, formulário, Farejador e imprensa — sempre como **Finamob Curitiba**.

- Site: https://finamobcuritiba.vercel.app
- Código: https://github.com/contatovinicaetano93-commits/finamobcuritiba

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://127.0.0.1:43123`.

- `/` — landing (Produtos, Formulário, Farejador, Contato)
- `/solucoes` — catálogo completo
- `/contato` — formulário incorporador / parceiro originador
- `/folder` — folder em slides + PDF

## PDF

[`Folder-Institucional-Finamob-Curitiba.pdf`](./Folder-Institucional-Finamob-Curitiba.pdf)

Para regenerar o PDF a partir do original em `source/`:

```bash
python3 -m pip install -r requirements.txt
python3 scripts/apply_curitiba.py
```
