#!/usr/bin/env python3
"""Build the Finamob Curitiba client showcase PDF.

Client-facing mostruário — not an internal training deck.
No São Paulo staff, no filial/franquia language, no unpublished contacts.
"""

from __future__ import annotations

import shutil
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "Finamob-Curitiba-Mostruario.pdf"
PUBLIC_OUT = ROOT / "public" / "Finamob-Curitiba-Mostruario.pdf"

W, H = 960.0, 540.0
MARGIN = 48.0
GUTTER = 18.0

INK = pymupdf.sRGB_to_pdf(0x050505)
PAPER = pymupdf.sRGB_to_pdf(0xF3EFE6)
BRONZE = pymupdf.sRGB_to_pdf(0x9C8563)
WHITE = (1, 1, 1)
BLACK = (0, 0, 0)

FONT_MARK = ROOT / "fonts" / "Audiowide-Regular.ttf"
FONT_SERIF = Path("/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf")
FONT_SERIF_I = Path("/usr/share/fonts/truetype/noto/NotoSerifDisplay-Italic.ttf")
FONT_SANS = Path("/usr/share/fonts/truetype/macos/Inter-Regular.ttf")
FONT_SANS_M = Path("/usr/share/fonts/truetype/macos/Inter-Medium.ttf")
FONT_SANS_B = Path("/usr/share/fonts/truetype/macos/Inter-SemiBold.ttf")

TOTAL = 20
SITE_URL = "finamobcuritiba.vercel.app"
CITY = "Curitiba, Paraná"


def font(path: Path) -> pymupdf.Font:
    return pymupdf.Font(fontfile=str(path))


MARK = font(FONT_MARK)
SERIF = font(FONT_SERIF)
SERIF_I = font(FONT_SERIF_I)
SANS = font(FONT_SANS)
SANS_M = font(FONT_SANS_M)
SANS_B = font(FONT_SANS_B)


class Slide:
    def __init__(self, doc: pymupdf.Document, index: int, theme: str) -> None:
        self.doc = doc
        self.index = index
        self.theme = theme
        self.page = doc.new_page(width=W, height=H)
        self.dark = theme == "ink"
        self.bg = INK if self.dark else PAPER
        self.fg = WHITE if self.dark else INK
        self.muted = (0.72, 0.72, 0.70) if self.dark else (0.38, 0.36, 0.33)
        self.soft = (0.55, 0.53, 0.50) if self.dark else (0.48, 0.45, 0.40)
        self.page.draw_rect(self.page.rect, color=self.bg, fill=self.bg, width=0)

    def tracked(
        self,
        pos: tuple[float, float],
        text: str,
        fnt: pymupdf.Font,
        size: float,
        color: tuple[float, float, float],
        tracking: float,
    ) -> float:
        tw = pymupdf.TextWriter(self.page.rect)
        x, y = pos
        for ch in text:
            tw.append((x, y), ch, font=fnt, fontsize=size)
            x += fnt.text_length(ch, fontsize=size) + tracking
        tw.write_text(self.page, color=color)
        return x

    def text(
        self,
        pos: tuple[float, float],
        content: str,
        fnt: pymupdf.Font,
        size: float,
        color: tuple[float, float, float],
    ) -> None:
        tw = pymupdf.TextWriter(self.page.rect)
        tw.append(pos, content, font=fnt, fontsize=size)
        tw.write_text(self.page, color=color)

    def wrap(
        self,
        origin: tuple[float, float],
        content: str,
        fnt: pymupdf.Font,
        size: float,
        width: float,
        color: tuple[float, float, float],
        leading: float | None = None,
    ) -> float:
        leading = leading or size * 1.38
        x, y = origin
        line = ""
        tw = pymupdf.TextWriter(self.page.rect)
        for word in content.split():
            trial = (line + " " + word).strip()
            if fnt.text_length(trial, fontsize=size) <= width:
                line = trial
                continue
            if line:
                tw.append((x, y), line, font=fnt, fontsize=size)
                y += leading
            line = word
        if line:
            tw.append((x, y), line, font=fnt, fontsize=size)
            y += leading
        tw.write_text(self.page, color=color)
        return y

    def brand(self, x: float = MARGIN, y: float = 28, light: bool | None = None) -> None:
        on_dark = self.dark if light is None else light
        color = WHITE if on_dark else INK
        sub = (0.72, 0.72, 0.70) if on_dark else (0.38, 0.36, 0.33)
        bar_h = 28
        cx = x + 5
        self.page.draw_rect(
            pymupdf.Rect(cx - 1.1, y, cx + 1.1, y + bar_h),
            color=color,
            fill=color,
            width=0,
        )
        self.page.draw_circle(
            (cx, y + bar_h / 2),
            5.2,
            color=color,
            fill=color,
            width=0,
        )
        self.tracked((x + 18, y + 12), "FINAMOB", MARK, 9, color, 1.9)
        self.tracked((x + 18, y + 24), "CURITIBA", MARK, 6.2, sub, 2.1)

    def kicker(self, x: float, y: float, label: str) -> None:
        self.tracked((x, y), label.upper(), SANS_M, 8, BRONZE, 1.55)
        line_y = y + 8
        self.page.draw_line(
            pymupdf.Point(x, line_y),
            pymupdf.Point(x + 28, line_y),
            color=BRONZE,
            width=0.7,
        )

    def hairline(self, y: float, left: float = MARGIN, right: float = W - MARGIN) -> None:
        color = (1, 1, 1) if self.dark else INK
        self.page.draw_line(
            pymupdf.Point(left, y),
            pymupdf.Point(right, y),
            color=color,
            width=0.35,
            stroke_opacity=0.16,
        )

    def footer(self) -> None:
        self.hairline(H - 28)
        muted = (0.55, 0.53, 0.50) if self.dark else (0.48, 0.45, 0.40)
        self.tracked((MARGIN, H - 14), "FINAMOB CURITIBA", SANS_M, 7, muted, 1.4)
        self.text((W - MARGIN - 70, H - 14), f"{self.index:02d}  /  {TOTAL:02d}", SANS, 8, muted)

    def card(
        self,
        rect: pymupdf.Rect,
        fill: tuple[float, float, float] | None = None,
        stroke: tuple[float, float, float] | None = None,
        fill_opacity: float = 1,
        stroke_opacity: float = 0.22,
    ) -> None:
        if fill is None:
            fill = (1, 1, 1) if self.dark else WHITE
            fill_opacity = 0.06 if self.dark else 0.72
        if stroke is None:
            stroke = WHITE if self.dark else INK
        self.page.draw_rect(
            rect,
            color=stroke,
            fill=fill,
            width=0.45,
            fill_opacity=fill_opacity,
            stroke_opacity=stroke_opacity,
        )


def new(doc: pymupdf.Document, index: int, theme: str) -> Slide:
    return Slide(doc, index, theme)


def slide_cover(doc: pymupdf.Document) -> None:
    s = new(doc, 1, "ink")
    s.page.draw_rect(pymupdf.Rect(0, 0, 8, H), color=BRONZE, fill=BRONZE, width=0)
    s.brand(y=36)
    s.kicker(MARGIN, 118, "Mostruário  ·  Curitiba, Paraná")
    s.text((MARGIN, 188), "Quem somos.", SERIF, 54, WHITE)
    s.text((MARGIN, 248), "Como operamos.", SERIF, 54, WHITE)
    s.text(
        (MARGIN, 292),
        "Funding imobiliário para incorporadores e loteadores.",
        SERIF_I,
        18,
        (0.78, 0.76, 0.72),
    )
    y = s.wrap(
        (MARGIN, 348),
        "A Finamob Curitiba é o elo local entre o projeto que precisa de capital e os agentes que o financiam — com leitura técnica, capilaridade e veículos próprios.",
        SANS,
        12.5,
        520,
        s.muted,
        18,
    )
    s.hairline(y + 18)
    s.text((MARGIN, y + 42), CITY, SANS_M, 10, BRONZE)
    s.tracked((MARGIN, y + 60), SITE_URL.upper(), SANS_M, 9, (0.62, 0.60, 0.56), 1.6)


def slide_sumario(doc: pymupdf.Document) -> None:
    s = new(doc, 2, "paper")
    s.brand()
    s.kicker(MARGIN, 78, "Sumário")
    s.text((MARGIN, 118), "O recorte desta conversa.", SERIF, 32, INK)
    items = [
        ("01", "Quem somos", "A operação em Curitiba e o papel de elo no funding."),
        ("02", "A tese", "Por que o mercado de capitais passou a financiar a obra."),
        ("03", "Como operamos", "Da demanda de capital à alocação, na praça."),
        ("04", "Como lemos o projeto", "Pilares, régua e o Farejador."),
        ("05", "A prateleira", "Ponte, obra, estoque, recebível, corporativo e veículos."),
        ("06", "O que esperar", "O caminho do incorporador com a Finamob Curitiba."),
    ]
    top = 150
    for i, (num, title, lead) in enumerate(items):
        col = i % 2
        row = i // 2
        x = MARGIN + col * 440
        y = top + row * 108
        s.card(pymupdf.Rect(x, y, x + 416, y + 92), fill=PAPER, fill_opacity=1, stroke=INK, stroke_opacity=0.12)
        s.text((x + 22, y + 38), num, SERIF, 22, BRONZE)
        s.text((x + 78, y + 34), title, SANS_B, 14, INK)
        s.wrap((x + 78, y + 54), lead, SANS, 10.5, 310, s.muted, 15)
    s.footer()


def slide_quem_somos(doc: pymupdf.Document) -> None:
    s = new(doc, 3, "ink")
    s.brand()
    s.kicker(MARGIN, 78, "01  ·  Quem somos")
    s.text((MARGIN, 124), "Finamob Curitiba.", SERIF, 36, WHITE)
    y = s.wrap(
        (MARGIN, 158),
        "Operamos na praça de Curitiba, na Região Metropolitana e no Paraná. Viabilizamos o financiamento do projeto imobiliário com embasamento técnico, mais de 200 agentes financiadores e veículos próprios de investimento.",
        SANS,
        13,
        560,
        s.muted,
        19,
    )
    points = [
        ("Praça", "Curitiba, RMC e Paraná — leitura local do mercado e do incorporador."),
        ("Elo", "Traduzimos o projeto para o mercado de capitais e o mercado para o projeto."),
        ("Mesa", "Estrutura, precifica e conecta a operação ao agente e ao veículo aderentes."),
    ]
    top = y + 28
    for i, (title, lead) in enumerate(points):
        x = MARGIN + i * 292
        s.card(pymupdf.Rect(x, top, x + 276, top + 148))
        s.tracked((x + 20, top + 32), title.upper(), SANS_M, 8, BRONZE, 1.5)
        s.wrap((x + 20, top + 58), lead, SANS, 12, 236, WHITE, 17)
    s.footer()


def slide_tese(doc: pymupdf.Document) -> None:
    s = new(doc, 4, "paper")
    s.brand()
    s.kicker(MARGIN, 78, "02  ·  A tese")
    s.text((MARGIN, 128), "O funding imobiliário", SERIF, 34, INK)
    s.text((MARGIN, 168), "está no ápice da transformação.", SERIF_I, 28, INK)
    y = s.wrap(
        (MARGIN, 214),
        "O incorporador pequeno e médio não conhece a Faria Lima. E a Faria Lima não conhece ele. A Finamob Curitiba existe para fechar essa distância — com a operação no formato, na linguagem e no nível de detalhe que o gestor exige.",
        SANS,
        13,
        620,
        s.muted,
        19,
    )
    pillars = [
        "Novas alternativas ao crédito bancário",
        "Conexão direta com investidores e gestores",
        "Tecnologia em todo o funil — o Farejador",
        "Veículos próprios, não só originação",
        "360º do funding: da ponte ao corporativo",
        "Ecossistema, não uma linha isolada de crédito",
    ]
    top = y + 28
    for i, item in enumerate(pillars):
        col = i % 2
        row = i // 2
        x = MARGIN + col * 430
        yy = top + row * 42
        s.page.draw_circle((x + 5, yy - 4), 3.2, color=BRONZE, fill=BRONZE, width=0)
        s.text((x + 20, yy), item, SANS, 12, INK)
    s.footer()


def slide_trajetoria(doc: pymupdf.Document) -> None:
    s = new(doc, 5, "ink")
    s.brand()
    s.kicker(MARGIN, 78, "Trajetória")
    s.text((MARGIN, 118), "A tese nasceu da obra.", SERIF, 32, WHITE)
    events = [
        ("2010–2020", "A origem está na incorporação — na dificuldade real de financiar a produção com o balcão bancário."),
        ("2020–2022", "A especialização no mercado de capitais deixa de ser exceção e vira o caminho para tirar obra do papel."),
        ("2023", "Nasce a Finamob para conectar pequenos e médios incorporadores ao funding que o banco não entrega. Fecha o ano com R$ 150 milhões em operações."),
        ("2024", "Primeiro ano oficial: prospecção ativa e volume dobrado — mais de R$ 300 milhões."),
        ("2025", "Crescimento acelerado: R$ 500 milhões em operações estruturadas."),
        ("2026", "A Finamob Curitiba opera a praça: Curitiba, RMC e Paraná, de frente para o incorporador e o loteador da região."),
    ]
    top = 148
    col_w = 280
    for i, (year, text) in enumerate(events):
        col = i % 3
        row = i // 3
        x = MARGIN + col * (col_w + 16)
        y = top + row * 150
        s.card(pymupdf.Rect(x, y, x + col_w, y + 136))
        s.tracked((x + 18, y + 28), year, SANS_M, 9, BRONZE, 1.2)
        s.wrap((x + 18, y + 50), text, SANS, 11, col_w - 36, s.muted, 15.5)
    s.footer()


def _pct(value: float) -> str:
    if value == int(value):
        return f"{int(value)}%"
    return f"{value:.1f}%".replace(".", ",")


def slide_virada(doc: pymupdf.Document) -> None:
    s = new(doc, 6, "paper")
    s.brand()
    s.kicker(MARGIN, 78, "A virada estrutural do funding")
    s.text((MARGIN, 112), "Os bancos recuam.", SERIF, 26, INK)
    s.text((MARGIN, 142), "O mercado de capitais avança.", SERIF_I, 20, INK)
    s.page.draw_rect(pymupdf.Rect(MARGIN, 166, MARGIN + 10, 176), color=INK, fill=INK, width=0)
    s.text((MARGIN + 16, 175), "Bancos", SANS, 8, s.muted)
    s.page.draw_rect(pymupdf.Rect(MARGIN + 78, 166, MARGIN + 88, 176), color=BRONZE, fill=BRONZE, width=0)
    s.text((MARGIN + 94, 175), "Mercado de capitais", SANS, 8, s.muted)
    stages = [
        ("Até 2010", 100.0, 0.0, "Era dos bancos"),
        ("2010–2020", 94.7, 5.3, "Primeiros movimentos"),
        ("2020–2025", 56.2, 43.8, "Inflexão"),
        ("Futuro", 18.0, 82.0, "Mercado de capitais à frente"),
    ]
    bar_x = MARGIN
    bar_w = 470
    top = 204
    for i, (period, banks, capital, note) in enumerate(stages):
        y = top + i * 58
        s.text((bar_x, y), period, SANS_B, 11, INK)
        s.text((bar_x + 118, y), note, SANS, 10, s.muted)
        by = y + 10
        s.page.draw_rect(
            pymupdf.Rect(bar_x, by, bar_x + bar_w, by + 16),
            color=INK,
            fill=INK,
            width=0,
            fill_opacity=0.08,
        )
        bank_w = bar_w * (banks / 100)
        cap_w = bar_w * (capital / 100)
        s.page.draw_rect(
            pymupdf.Rect(bar_x, by, bar_x + bank_w, by + 16),
            color=INK,
            fill=INK,
            width=0,
        )
        if cap_w > 0.5:
            s.page.draw_rect(
                pymupdf.Rect(bar_x + bank_w, by, bar_x + bank_w + cap_w, by + 16),
                color=BRONZE,
                fill=BRONZE,
                width=0,
            )
        label = _pct(capital) if capital else _pct(banks)
        tone = BRONZE if capital else s.muted
        s.text((bar_x + bar_w + 12, by + 13), label, SANS_M, 9, tone)
    s.card(pymupdf.Rect(W - MARGIN - 248, 168, W - MARGIN, 430), fill=INK, fill_opacity=1, stroke=INK, stroke_opacity=0)
    s.tracked((W - MARGIN - 228, 200), "LEITURA", SANS_M, 8, BRONZE, 1.6)
    s.wrap(
        (W - MARGIN - 228, 228),
        "56,2% dos recursos ainda são bancários no recorte 2020–2025. 43,8% já vieram do mercado de capitais — de zero. Poupança e FGTS rendem abaixo da inflação há uma década.",
        SANS,
        11.5,
        208,
        (0.82, 0.80, 0.76),
        17,
    )
    s.wrap(
        (W - MARGIN - 228, 360),
        "É nesse deslocamento que a Finamob Curitiba opera.",
        SERIF_I,
        13,
        208,
        WHITE,
        18,
    )
    s.footer()


def slide_atuacao(doc: pymupdf.Document) -> None:
    s = new(doc, 7, "ink")
    s.brand()
    s.kicker(MARGIN, 78, "Nossa atuação")
    s.wrap(
        (MARGIN, 118),
        "O incorporador regional precisa de capital. O mercado de capitais precisa de operação bem lida. Nós somos o encontro.",
        SERIF,
        24,
        820,
        WHITE,
        32,
    )
    cols = [
        (
            "01",
            "Demanda de capital",
            "Incorporadores e loteadores — em grande parte negócios familiares, regionais, longe do mercado de capitais e sem a mesa para acessá-lo.",
        ),
        (
            "02",
            "A Finamob Curitiba é o elo",
            "Com inteligência proprietária, identificamos o encontro entre a demanda e a alocação. Estruturamos, precificamos e conectamos.",
        ),
        (
            "03",
            "Alocação de capital",
            "A operação vai para os agentes mais aderentes: gestoras, boutiques, plataformas, FIDCs e os veículos próprios — com mais velocidade e mais chance de fechar.",
        ),
    ]
    top = 220
    for i, (num, title, lead) in enumerate(cols):
        x = MARGIN + i * 292
        s.card(pymupdf.Rect(x, top, x + 276, top + 232))
        s.text((x + 20, top + 42), num, SERIF, 22, BRONZE)
        s.text((x + 20, top + 78), title, SANS_B, 13.5, WHITE)
        s.wrap((x + 20, top + 108), lead, SANS, 11.5, 236, s.muted, 16.5)
    s.footer()


def slide_numeros(doc: pymupdf.Document) -> None:
    s = new(doc, 8, "paper")
    s.brand()
    s.kicker(MARGIN, 78, "Números da plataforma")
    s.text((MARGIN, 118), "Escala que o incorporador sozinho não alcança.", SERIF, 28, INK)
    stats = [
        ("R$ 1,2 bi", "Volume estruturado"),
        ("92", "Operações viabilizadas"),
        ("208", "Agentes financiadores"),
        ("3", "Veículos proprietários"),
    ]
    top = 170
    for i, (value, label) in enumerate(stats):
        x = MARGIN + i * 220
        s.card(
            pymupdf.Rect(x, top, x + 204, top + 168),
            fill=INK,
            fill_opacity=1,
            stroke=INK,
            stroke_opacity=0,
        )
        s.text((x + 18, top + 78), value, SERIF, 28, WHITE)
        s.wrap((x + 18, top + 112), label, SANS, 12, 168, (0.72, 0.70, 0.66), 16)
    s.wrap(
        (MARGIN, 372),
        "Capilaridade genuína: os mais de 200 agentes não são uma lista. São relações construídas operação a operação com gestores e decisores. É isso que a Finamob Curitiba coloca à mesa do seu projeto.",
        SANS,
        12.5,
        860,
        s.muted,
        18,
    )
    s.footer()


def slide_imprensa(doc: pymupdf.Document) -> None:
    s = new(doc, 9, "ink")
    s.brand()
    s.kicker(MARGIN, 78, "Na imprensa")
    s.text((MARGIN, 118), "A tese já está no mercado.", SERIF, 30, WHITE)
    quotes = [
        (
            "Exame",
            "Ele vai levantar R$ 300 milhões em 2024 ao conectar a Faria Lima a construtoras",
            "A Finamob posicionada como ponte entre capital e demanda qualificada do setor.",
        ),
        (
            "Valor",
            "Crowdfunding cresce no setor imobiliário",
            "Matéria que reforça a evolução das novas frentes de funding no imobiliário.",
        ),
        (
            "Estadão",
            "Como a Faria Lima enriquece com imóveis quando menos pessoas investem na poupança",
            "Contexto de transformação do funding e avanço do mercado de capitais.",
        ),
        (
            "Metro Quadrado",
            "Essa proptech está dobrando a aposta para resolver a dor do funding",
            "Fortalece a narrativa de tecnologia aplicada à eficiência de funding.",
        ),
    ]
    top = 160
    for i, (source, title, text) in enumerate(quotes):
        col = i % 2
        row = i // 2
        x = MARGIN + col * 440
        y = top + row * 148
        s.card(pymupdf.Rect(x, y, x + 420, y + 132))
        s.tracked((x + 20, y + 28), source.upper(), SANS_M, 8, BRONZE, 1.5)
        s.wrap((x + 20, y + 50), title, SERIF, 13, 380, WHITE, 17)
        s.wrap((x + 20, y + 96), text, SANS, 10.5, 380, s.muted, 14)
    s.footer()


def slide_operamos(doc: pymupdf.Document) -> None:
    s = new(doc, 10, "paper")
    s.brand()
    s.kicker(MARGIN, 78, "03  ·  Como operamos")
    s.text((MARGIN, 118), "Três passos. Um elo.", SERIF, 32, INK)
    steps = [
        (
            "01",
            "Você apresenta a demanda",
            "Incorporadores, loteadores e outros players trazem o projeto, o estágio, a necessidade financeira e o contexto técnico da captação.",
        ),
        (
            "02",
            "A Finamob Curitiba lê e encaixa",
            "Com o Farejador e a mesa, identificamos o encontro entre a demanda e a alocação — produto, veículo e agente aderentes.",
        ),
        (
            "03",
            "O capital entra no projeto",
            "A operação vai a mercado com o dossiê no formato que o gestor exige. Mais eficiência, mais velocidade, maior probabilidade de viabilização.",
        ),
    ]
    top = 168
    for i, (num, title, lead) in enumerate(steps):
        y = top + i * 100
        s.text((MARGIN, y + 28), num, SERIF, 26, BRONZE)
        s.text((MARGIN + 80, y + 20), title, SANS_B, 16, INK)
        s.wrap((MARGIN + 80, y + 44), lead, SANS, 12, 740, s.muted, 17)
        if i < 2:
            s.hairline(y + 88)
    s.footer()


def slide_linguagem(doc: pymupdf.Document) -> None:
    s = new(doc, 11, "ink")
    s.brand()
    s.kicker(MARGIN, 78, "04  ·  A linguagem do projeto")
    s.text((MARGIN, 118), "Toda conversa de crédito começa pelo VGV.", SERIF, 26, WHITE)
    cards = [
        (
            "VGV",
            "Valor Geral de Vendas — o tamanho do projeto. Define o recorte da operação e o quanto de crédito cabe.",
        ),
        (
            "Exposição de caixa",
            "O buraco entre gastar (terreno, obra) e receber (vendas, repasse). É a dor que os produtos resolvem.",
        ),
        (
            "SPE e afetação",
            "Onde o projeto mora: empresa própria, patrimônio separado — proteção para o comprador e para o credor.",
        ),
        (
            "Instrumento",
            "CCB, CRI, FIDC ou debênture. Quem escolhe o formato é a mesa, a partir da leitura da operação — não uma promessa de rua.",
        ),
    ]
    top = 168
    for i, (title, lead) in enumerate(cards):
        col = i % 2
        row = i // 2
        x = MARGIN + col * 440
        y = top + row * 140
        s.card(pymupdf.Rect(x, y, x + 420, y + 124))
        s.text((x + 22, y + 38), title, SERIF, 18, WHITE)
        s.wrap((x + 22, y + 64), lead, SANS, 12, 376, s.muted, 17)
    s.footer()


def slide_pilares(doc: pymupdf.Document) -> None:
    s = new(doc, 12, "paper")
    s.brand()
    s.kicker(MARGIN, 78, "Os quatro pilares")
    s.text((MARGIN, 118), "Como lemos qualquer operação.", SERIF, 30, INK)
    pillars = [
        (
            "Praça",
            "O mercado local.",
            "Curitiba, Região Metropolitana e Paraná. População, dinâmica econômica e liquidez da praça onde o projeto vive.",
        ),
        (
            "Produto",
            "O empreendimento em si.",
            "Conceito, ticket médio, segmento e a real necessidade de capital no estágio atual.",
        ),
        (
            "Economics",
            "Os números do projeto.",
            "Margem, equity, percentual de vendas e de obras. O caixa que fecha — ou não — a conta.",
        ),
        (
            "Player",
            "Quem executa.",
            "Empreendimentos entregues, robustez da companhia e governança de quem leva a obra até o fim.",
        ),
    ]
    top = 160
    for i, (name, sub, lead) in enumerate(pillars):
        col = i % 2
        row = i // 2
        x = MARGIN + col * 440
        y = top + row * 148
        s.card(pymupdf.Rect(x, y, x + 420, y + 132), fill=WHITE, fill_opacity=1, stroke=INK, stroke_opacity=0.12)
        s.tracked((x + 22, y + 32), name.upper(), SANS_M, 8, BRONZE, 1.6)
        s.text((x + 22, y + 58), sub, SERIF, 16, INK)
        s.wrap((x + 22, y + 84), lead, SANS, 11.5, 376, s.muted, 16)
    s.footer()


def slide_regua(doc: pymupdf.Document) -> None:
    s = new(doc, 13, "ink")
    s.brand()
    s.kicker(MARGIN, 78, "A régua de classificação")
    s.text((MARGIN, 118), "Risco maior não é veto.", SERIF, 30, WHITE)
    s.text((MARGIN, 152), "É preço e estrutura diferentes.", SERIF_I, 22, (0.78, 0.76, 0.72))
    grades = [
        ("High Grade", "4 pilares alinhados", "Operação redonda: estrutura mais leve, spread menor, apetite amplo."),
        ("High Yield", "3 pilares alinhados", "Um pilar desalinha: a estrutura reforça e o spread compensa."),
        ("Distressed", "2 alinhados, 2 fracos", "Fecha — com a garantia e o preço certos. Situações especiais."),
        ("Não fecha", "3 ou mais ruins", "Operação ruim em quase tudo não tem preço que resolva."),
    ]
    top = 196
    for i, (name, rule, lead) in enumerate(grades):
        x = MARGIN + i * 220
        s.card(pymupdf.Rect(x, top, x + 204, top + 240))
        s.text((x + 16, top + 44), f"0{i + 1}", SERIF, 16, BRONZE)
        s.wrap((x + 16, top + 78), name, SERIF, 16, 172, WHITE, 20)
        s.wrap((x + 16, top + 122), rule, SANS_M, 10, 172, BRONZE, 14)
        s.wrap((x + 16, top + 156), lead, SANS, 11, 172, s.muted, 15.5)
    s.footer()


def slide_farejador(doc: pymupdf.Document) -> None:
    s = new(doc, 14, "paper")
    s.brand()
    s.kicker(MARGIN, 78, "Farejador")
    s.text((MARGIN, 118), "Os quatro pilares em nota.", SERIF, 30, INK)
    s.wrap(
        (MARGIN, 156),
        "Ferramenta proprietária de leitura. Transforma praça, produto, economics e player em campos objetivos — o mesmo racional da mesa, disponível no site da Finamob Curitiba.",
        SANS,
        12.5,
        520,
        s.muted,
        18,
    )
    points = [
        ("O que é", "Score a partir dos quatro pilares, com leitura de melhor e pior dimensão."),
        ("Para que serve", "Mostra a saúde da operação antes de ir a mercado — e orienta a conversa de estrutura."),
        ("Onde rodar", "finamobcuritiba.vercel.app/farejador — o incorporador avalia o projeto agora."),
    ]
    y = 232
    for title, lead in points:
        s.tracked((MARGIN, y), title.upper(), SANS_M, 8, BRONZE, 1.4)
        s.wrap((MARGIN + 110, y), lead, SANS, 12, 430, INK, 16)
        y += 44
    s.card(pymupdf.Rect(W - MARGIN - 268, 150, W - MARGIN, 430), fill=INK, fill_opacity=1, stroke=INK, stroke_opacity=0)
    s.tracked((W - MARGIN - 248, 182), "LEITURA AMOSTRA", SANS_M, 7.5, BRONZE, 1.4)
    s.text((W - MARGIN - 248, 236), "6,89", SERIF, 48, WHITE)
    s.tracked((W - MARGIN - 248, 262), "BOM", SANS_B, 11, BRONZE, 2.0)
    sample = [
        ("Praça", "6,7", "BOM"),
        ("Produto", "9,3", "EXCELENTE"),
        ("Economics", "2,2", "RUIM"),
        ("Player", "9,3", "EXCELENTE"),
    ]
    yy = 292
    for name, score, rating in sample:
        s.text((W - MARGIN - 248, yy), name, SANS, 10, (0.72, 0.70, 0.66))
        s.text((W - MARGIN - 148, yy), score, SANS_B, 10, WHITE)
        s.text((W - MARGIN - 108, yy), rating, SANS, 9, BRONZE)
        yy += 24
    s.footer()


def slide_jornada(doc: pymupdf.Document) -> None:
    s = new(doc, 15, "ink")
    s.brand()
    s.kicker(MARGIN, 78, "05  ·  A prateleira")
    s.text((MARGIN, 118), "Funding para cada momento do empreendimento.", SERIF, 26, WHITE)
    s.wrap(
        (MARGIN, 152),
        "Um mesmo cliente pode percorrer a régua inteira. Qual produto cabe, a mesa define depois da leitura — não na primeira conversa.",
        SANS,
        12,
        820,
        s.muted,
        17,
    )
    products = [
        ("Ponte", "Terreno e lançamento", "Recursos para a exposição de caixa inicial."),
        ("Obra", "Execução", "Financiamento para produzir até a conclusão."),
        ("Estoque", "Habite-se", "Quitação da obra e prazo para vender o remanescente."),
        ("Recebível", "Pós-obra", "Antecipação de direitos creditórios da carteira."),
        ("Corporativo", "Companhia", "Liquidez com lastro em ativos da empresa."),
    ]
    top = 210
    for i, (name, moment, lead) in enumerate(products):
        x = MARGIN + i * 176
        s.card(pymupdf.Rect(x, top, x + 164, top + 236))
        s.text((x + 14, top + 36), f"0{i + 1}", SERIF, 14, BRONZE)
        s.text((x + 14, top + 70), name, SERIF, 18, WHITE)
        s.tracked((x + 14, top + 96), moment.upper(), SANS_M, 7, BRONZE, 1.1)
        s.wrap((x + 14, top + 124), lead, SANS, 11, 136, s.muted, 15.5)
    s.footer()


def slide_ponte_obra(doc: pymupdf.Document) -> None:
    s = new(doc, 16, "paper")
    s.brand()
    s.kicker(MARGIN, 78, "Ponte e obra")
    blocks = [
        (
            "01  Ponte",
            "Recursos para a exposição de caixa inicial — terreno, aprovações, marketing e início de obras.",
            [
                ("Momento", "Aprovações e lançamento"),
                ("A dor", "O caixa do arranque, antes de a operação de obra caber."),
                ("Gatilho", "Validação de vendas, em geral acima de 30%."),
            ],
        ),
        (
            "02  Obra",
            "Financiamento para a execução de incorporações ou loteamentos, do andamento inicial à conclusão.",
            [
                ("Momento", "Execução da obra"),
                ("A dor", "Produzir até o fim sem estrangular o caixa da SPE."),
                ("Gatilho", "Obra em andamento e vendas já performadas."),
            ],
        ),
    ]
    for i, (title, lead, rows) in enumerate(blocks):
        x = MARGIN + i * 440
        s.card(
            pymupdf.Rect(x, 118, x + 420, 470),
            fill=WHITE,
            fill_opacity=1,
            stroke=INK,
            stroke_opacity=0.12,
        )
        s.text((x + 24, 158), title, SERIF, 24, INK)
        s.wrap((x + 24, 190), lead, SANS, 12, 372, s.muted, 17)
        yy = 268
        for label, value in rows:
            s.tracked((x + 24, yy), label.upper(), SANS_M, 8, BRONZE, 1.3)
            s.wrap((x + 24, yy + 18), value, SANS, 12.5, 372, INK, 17)
            yy += 58
    s.footer()


def slide_estoque_trio(doc: pymupdf.Document) -> None:
    s = new(doc, 17, "ink")
    s.brand()
    s.kicker(MARGIN, 78, "Estoque, recebível e corporativo")
    s.text((MARGIN, 118), "Liquidez depois da obra — ou fora dela.", SERIF, 26, WHITE)
    blocks = [
        (
            "03  Estoque",
            "Crédito para quitar o financiamento de obra e vender o remanescente com prazo.",
            "Habite-se em diante. Sai da obra e ganha tempo para vender bem o que restou.",
        ),
        (
            "04  Recebível",
            "Antecipação de direitos creditórios futuros da carteira de vendas.",
            "Pós-obra e carteira. Vira o fluxo longo em caixa agora.",
        ),
        (
            "05  Corporativo",
            "Liquidez discricionária para a companhia, com lastro em ativos próprios.",
            "Independe do estágio dos projetos. Caixa da empresa, não de um canteiro.",
        ),
    ]
    top = 168
    for i, (title, lead, note) in enumerate(blocks):
        x = MARGIN + i * 292
        s.card(pymupdf.Rect(x, top, x + 276, top + 268))
        s.text((x + 20, top + 44), title, SERIF, 18, WHITE)
        s.wrap((x + 20, top + 84), lead, SANS, 12, 236, s.muted, 17)
        s.page.draw_line(
            pymupdf.Point(x + 20, top + 168),
            pymupdf.Point(x + 256, top + 168),
            color=WHITE,
            width=0.35,
            stroke_opacity=0.16,
        )
        s.wrap((x + 20, top + 190), note, SANS, 11.5, 236, (0.78, 0.76, 0.72), 16)
    s.footer()


def slide_veiculos(doc: pymupdf.Document) -> None:
    s = new(doc, 18, "paper")
    s.brand()
    s.kicker(MARGIN, 78, "Veículos e estruturação")
    s.text((MARGIN, 118), "Capacidade própria de execução.", SERIF, 28, INK)
    s.wrap(
        (MARGIN, 152),
        "Além da originação junto a terceiros, a Finamob estrutura veículos — para não depender só do apetite de mercado em cada janela.",
        SANS,
        12.5,
        860,
        s.muted,
        18,
    )
    vehicles = [
        ("FIDC Obra", "Financiamento à produção de incorporações de médio-alto padrão para players de pequeno e médio porte."),
        ("FIDC Crequity", "Crédito-ponte para empreendimentos econômicos com funding associativo."),
        ("FIDC Consórcio", "Capital de giro com garantia em imóveis via consórcio contemplado."),
        ("Tokenização", "Captação via equity lastreada em tokens imobiliários — fracionamento e liquidez."),
    ]
    top = 200
    for i, (name, lead) in enumerate(vehicles):
        x = MARGIN + (i % 4) * 220
        s.card(
            pymupdf.Rect(x, top, x + 204, top + 168),
            fill=INK,
            fill_opacity=1,
            stroke=INK,
            stroke_opacity=0,
        )
        s.text((x + 14, top + 40), name, SERIF, 14, WHITE)
        s.wrap((x + 14, top + 68), lead, SANS, 10.5, 176, (0.72, 0.70, 0.66), 15)
    s.wrap(
        (MARGIN, 392),
        "Sob demanda: FIDCs artesanais, desenhados para a operação; e FINAdvisor, acompanhamento estratégico da tese à execução — funding, estrutura de capital e crescimento.",
        SANS,
        12,
        860,
        INK,
        17,
    )
    s.footer()


def slide_esperar(doc: pymupdf.Document) -> None:
    s = new(doc, 19, "ink")
    s.brand()
    s.kicker(MARGIN, 78, "06  ·  O que esperar")
    s.text((MARGIN, 118), "O caminho do seu projeto.", SERIF, 30, WHITE)
    steps = [
        ("1", "Envio", "Praça, estágio, necessidade de capital e prazo. Quanto mais técnico o recorte, mais rápida a leitura."),
        ("2", "Farejador", "Os quatro pilares viram nota. Você já pode rodar essa leitura no site."),
        ("3", "Mesa", "Diagnóstico, produto indicativo e dossiê no formato que o gestor exige."),
        ("4", "Mercado", "A operação vai aos agentes e veículos aderentes. Taxa e condição se confirmam nas propostas."),
        ("5", "Formalização", "Estrutura, garantias e instrumento — CCB, CRI, FIDC ou debênture, conforme a operação."),
        ("6", "Liquidação", "O recurso entra no projeto. A Finamob Curitiba acompanha até o funding fechar."),
    ]
    top = 168
    for i, (num, title, lead) in enumerate(steps):
        col = i % 3
        row = i // 3
        x = MARGIN + col * 292
        y = top + row * 140
        s.card(pymupdf.Rect(x, y, x + 276, y + 124))
        s.text((x + 18, y + 36), num, SERIF, 20, BRONZE)
        s.text((x + 48, y + 36), title, SANS_B, 13, WHITE)
        s.wrap((x + 18, y + 62), lead, SANS, 11, 240, s.muted, 15.5)
    s.footer()


def slide_fecho(doc: pymupdf.Document) -> None:
    s = new(doc, 20, "paper")
    s.page.draw_rect(pymupdf.Rect(0, 0, 8, H), color=BRONZE, fill=BRONZE, width=0)
    s.brand()
    s.kicker(MARGIN, 100, "Finamob Curitiba")
    s.text((MARGIN, 160), "O elo entre o seu projeto", SERIF, 34, INK)
    s.text((MARGIN, 202), "e o capital que o tira do papel.", SERIF, 34, INK)
    s.wrap(
        (MARGIN, 250),
        "Viabilizamos o financiamento do empreendimento imobiliário com máxima eficiência — leitura técnica, mais de 200 agentes e veículos próprios. Só a operação, em Curitiba.",
        SANS,
        13,
        620,
        s.muted,
        19,
    )
    s.hairline(340)
    s.text((MARGIN, 372), CITY, SANS_B, 13, INK)
    s.tracked((MARGIN, 396), SITE_URL.upper(), SANS_M, 11, BRONZE, 1.8)
    s.wrap(
        (MARGIN, 430),
        "E-mail e WhatsApp institucionais ainda não foram publicados. O canal está no site: área do incorporador, originador parceiro e Farejador.",
        SANS,
        11,
        620,
        s.soft,
        16,
    )


def build() -> Path:
    doc = pymupdf.open()
    slide_cover(doc)
    slide_sumario(doc)
    slide_quem_somos(doc)
    slide_tese(doc)
    slide_trajetoria(doc)
    slide_virada(doc)
    slide_atuacao(doc)
    slide_numeros(doc)
    slide_imprensa(doc)
    slide_operamos(doc)
    slide_linguagem(doc)
    slide_pilares(doc)
    slide_regua(doc)
    slide_farejador(doc)
    slide_jornada(doc)
    slide_ponte_obra(doc)
    slide_estoque_trio(doc)
    slide_veiculos(doc)
    slide_esperar(doc)
    slide_fecho(doc)
    if doc.page_count != TOTAL:
        raise RuntimeError(f"Expected {TOTAL} slides, got {doc.page_count}")
    meta = doc.metadata
    meta["title"] = "Finamob Curitiba — Mostruário"
    meta["author"] = "Finamob Curitiba"
    meta["subject"] = "Quem somos e como operamos. Funding imobiliário em Curitiba, Paraná."
    doc.set_metadata(meta)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT, deflate=True, garbage=4)
    doc.close()
    PUBLIC_OUT.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(OUT, PUBLIC_OUT)
    return OUT


FORBIDDEN = [
    "filial",
    "filiais",
    "filiado",
    "filiados",
    "franquia",
    "franqueado",
    "franqueadora",
    "matriz",
    "murilo",
    "marchesini",
    "luiza krum",
    "joão vitor",
    "joao vitor",
    "daniel bank",
    "colombini",
    "zambon",
    "monteferrario",
    "lentsch",
    "pimentel",
    "martoni",
    "guilherme conto",
    "nicolas prodigio",
    "julia marchesini",
    "distância de sp",
    "distancia de sp",
    "treinamento",
    "você não vai estruturar",
    "voce nao vai estruturar",
    "finamobers",
    "são paulo",
    "sao paulo",
]


def assert_clean(path: Path) -> None:
    doc = pymupdf.open(path)
    blob = "\n".join(page.get_text("text") for page in doc).lower()
    doc.close()
    hits = [word for word in FORBIDDEN if word in blob]
    if hits:
        raise RuntimeError(f"Forbidden language in PDF: {hits}")


if __name__ == "__main__":
    out = build()
    assert_clean(out)
    print(f"Wrote {out} ({out.stat().st_size} bytes)")
    print(f"Copied {PUBLIC_OUT}")
