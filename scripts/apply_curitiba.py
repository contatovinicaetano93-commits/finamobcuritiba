#!/usr/bin/env python3
"""Apply Finamob Curitiba branding to the institutional folder PDF."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pymupdf
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "source" / "Folder-Institucional-Finamob-V7-original.pdf"
OUT = ROOT / "Folder-Institucional-Finamob-Curitiba.pdf"
PUBLIC_OUT = ROOT / "public" / "Folder-Institucional-Finamob-Curitiba.pdf"
FONT_AUDIO = ROOT / "fonts" / "Audiowide-Regular.ttf"
FONT_CAIRO = ROOT / "fonts" / "Cairo-Regular-static.ttf"
ASSETS = ROOT / ".tmp-assets"


def crop_logo(page: pymupdf.Page) -> tuple[Image.Image, Image.Image]:
    images = page.get_images(full=True)
    if not images:
        raise RuntimeError("Capa sem logo")
    xref = images[0][0]
    pix = pymupdf.Pixmap(page.parent, xref)
    if pix.n - pix.alpha > 3:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    raw = Image.frombytes("RGB", (pix.width, pix.height), pix.samples).convert("RGBA")
    arr = np.array(raw)
    mask = (arr[:, :, 0] + arr[:, :, 1] + arr[:, :, 2]) > 30
    ys, xs = np.where(mask)
    pad = 6
    crop = raw.crop(
        (
            max(0, int(xs.min()) - pad),
            max(0, int(ys.min()) - pad),
            int(xs.max()) + pad + 1,
            int(ys.max()) + pad + 1,
        )
    )
    cropped = np.array(crop)
    cropped[:, :, 3] = np.where(
        cropped[:, :, 0] + cropped[:, :, 1] + cropped[:, :, 2] > 30, 255, 0
    ).astype(np.uint8)
    white = Image.fromarray(cropped)
    black_arr = cropped.copy()
    black_arr[:, :, 0:3] = np.where(black_arr[:, :, 3:4] > 0, 0, black_arr[:, :, 0:3])
    return white, Image.fromarray(black_arr)


def make_lockup(logo: Image.Image, color: tuple[int, int, int, int], dest: Path) -> Image.Image:
    font = ImageFont.truetype(str(FONT_AUDIO), 52)
    text = "CURITIBA"
    tracking = 10
    dummy = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    widths = []
    for ch in text:
        box = dummy.textbbox((0, 0), ch, font=font)
        widths.append(box[2] - box[0])
    tb = dummy.textbbox((0, 0), text, font=font)
    text_w = sum(widths) + tracking * (len(text) - 1)
    gap = 20
    canvas = Image.new(
        "RGBA",
        (logo.width, logo.height + gap + (tb[3] - tb[1]) + 10),
        (0, 0, 0, 0),
    )
    canvas.paste(logo, (0, 0), logo)
    word_left = int(logo.width * 0.27)
    x = (word_left + logo.width) // 2 - text_w // 2
    y = logo.height + gap - tb[1] - 6
    draw = ImageDraw.Draw(canvas)
    for ch, width in zip(text, widths, strict=True):
        draw.text((x, y), ch, font=font, fill=color)
        x += width + tracking
    canvas.save(dest)
    return canvas


def write_line(
    page: pymupdf.Page,
    font: pymupdf.Font,
    origin: tuple[float, float],
    text: str,
    fontsize: float,
    color: tuple[float, float, float],
) -> None:
    writer = pymupdf.TextWriter(page.rect)
    writer.append(origin, text, font=font, fontsize=fontsize)
    writer.write_text(page, color=color)


def place_lockup(
    page: pymupdf.Page,
    rect: pymupdf.Rect,
    path: Path,
    extend_down: float,
) -> None:
    target = pymupdf.Rect(rect.x0, rect.y0, rect.x1, rect.y1 + extend_down)
    page.insert_image(target, filename=str(path), overlay=True, keep_proportion=True)


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"PDF original não encontrado: {SRC}")
    ASSETS.mkdir(exist_ok=True)
    doc = pymupdf.open(SRC)
    white_logo, black_logo = crop_logo(doc[0])
    lock_white = make_lockup(white_logo, (255, 255, 255, 255), ASSETS / "lockup-white.png")
    make_lockup(black_logo, (12, 12, 12, 255), ASSETS / "lockup-black.png")
    cairo = pymupdf.Font(fontfile=str(FONT_CAIRO))

    cover = doc[0]
    old = pymupdf.Rect(519.3, 341.3, 920.5, 468.8)
    center_x = (old.x0 + old.x1) / 2
    width = old.width * 1.02
    height = width * (lock_white.height / lock_white.width)
    lock_rect = pymupdf.Rect(
        center_x - width / 2,
        old.y0 - 8,
        center_x + width / 2,
        old.y0 - 8 + height,
    )
    cover.draw_rect(
        pymupdf.Rect(old.x0 - 20, old.y0 - 10, old.x1 + 20, lock_rect.y1 + 8),
        color=(0, 0, 0),
        fill=(0, 0, 0),
        width=0,
    )
    cover.insert_image(
        lock_rect,
        filename=str(ASSETS / "lockup-white.png"),
        overlay=True,
        keep_proportion=True,
    )

    header = pymupdf.Rect(81.0, 81.0, 360.0, 169.5)
    for index in (1, 2, 3):
        place_lockup(doc[index], header, ASSETS / "lockup-white.png", 22)

    page2 = doc[1]
    page2.add_redact_annot(pymupdf.Rect(168, 605, 1365, 752), fill=False, cross_out=False)
    page2.apply_redactions(images=0, graphics=0)
    write_line(
        page2,
        cairo,
        (180.714, 663.25),
        "O mercado de funding imobiliário está no ápice da transformação,",
        40,
        (1, 1, 1),
    )
    write_line(
        page2,
        cairo,
        (180.714, 718.75),
        "e a Finamob Curitiba será o agente dessa mudança.",
        40,
        (1, 1, 1),
    )

    footer = pymupdf.Rect(1222.4, 686.0, 1358.9, 728.7)
    for index in (6, 7):
        place_lockup(doc[index], footer, ASSETS / "lockup-black.png", 18)

    page8 = doc[7]
    page8.add_redact_annot(pymupdf.Rect(115.3, 67.8, 560, 135.5), fill=(1, 1, 1), cross_out=False)
    page8.apply_redactions(images=0, graphics=0)
    write_line(page8, cairo, (115.277, 114.889), "Finamob Curitiba na mídia", 36.105, (0, 0, 0))

    last = doc[8]
    site = pymupdf.Rect(80, 680, 310, 750)
    last.add_redact_annot(site, fill=(0, 0, 0), cross_out=False)
    last.apply_redactions(images=0, graphics=0)
    last.draw_rect(site, color=(0, 0, 0), fill=(0, 0, 0), width=0)

    meta = doc.metadata
    meta["title"] = "Folder Institucional - Finamob Curitiba"
    meta["subject"] = "Finamob Curitiba"
    doc.set_metadata(meta)
    doc.save(OUT, garbage=4, deflate=True)
    doc.close()
    if PUBLIC_OUT.resolve() != OUT.resolve():
        PUBLIC_OUT.write_bytes(OUT.read_bytes())
    print(f"PDF gerado: {OUT}")


if __name__ == "__main__":
    main()
