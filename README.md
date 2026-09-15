# Finamob Curitiba — Folder institucional

Versão do folder institucional da Finamob adaptada para **Finamob Curitiba**.

O que mudou em relação ao V7 original:

- **Curitiba** entra na marca (capa, cabeçalhos e rodapés)
- O texto passa a dizer “Finamob Curitiba”
- O site `finamob.com.br` saiu do último slide, enquanto a operação local não tem site próprio

## PDF pronto

Baixe o arquivo:

[`Folder-Institucional-Finamob-Curitiba.pdf`](./Folder-Institucional-Finamob-Curitiba.pdf)

## Ver os slides no navegador

```bash
npm install
npm run dev
```

Abre em `http://127.0.0.1:43123`. Use as setas do teclado ou os thumbnails para folhear. O botão **Baixar PDF** entrega o arquivo atualizado.

## Regenerar o PDF

Se você substituir o original em `source/`:

```bash
python3 -m pip install -r requirements.txt
python3 scripts/apply_curitiba.py
```
