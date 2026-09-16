# Finamob Curitiba

Site da operação de Curitiba: funding imobiliário para incorporadores e loteadores, com o folder institucional para download.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://127.0.0.1:43123`.

- `/` — página inicial
- `/solucoes` — catálogo de produtos
- `/contato` — formulário
- `/folder` — folder em slides + PDF

## PDF

[`Folder-Institucional-Finamob-Curitiba.pdf`](./Folder-Institucional-Finamob-Curitiba.pdf)

Para regenerar o PDF a partir do original em `source/`:

```bash
python3 -m pip install -r requirements.txt
python3 scripts/apply_curitiba.py
```
