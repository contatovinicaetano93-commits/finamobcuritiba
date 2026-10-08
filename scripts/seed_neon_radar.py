#!/usr/bin/env python3
"""Load Radar Brazil companies + developments into Neon."""

from __future__ import annotations

import csv
import gzip
import json
import os
import re
import sys
from pathlib import Path

import psycopg
from psycopg.rows import dict_row

ROOT = Path(__file__).resolve().parents[1]
UPLOADS = Path("/home/ubuntu/.cursor/projects/workspace/uploads")
DADOS = UPLOADS / "dados.json_5382.gz"
EMPS = UPLOADS / "emps.json_bc0b.gz"
CURITIBA = UPLOADS / "incorporadoras_curitiba_100km_040c.csv"

REGIAO = {
    "AC": "Norte",
    "AP": "Norte",
    "AM": "Norte",
    "PA": "Norte",
    "RO": "Norte",
    "RR": "Norte",
    "TO": "Norte",
    "AL": "Nordeste",
    "BA": "Nordeste",
    "CE": "Nordeste",
    "MA": "Nordeste",
    "PB": "Nordeste",
    "PE": "Nordeste",
    "PI": "Nordeste",
    "RN": "Nordeste",
    "SE": "Nordeste",
    "DF": "Centro-Oeste",
    "GO": "Centro-Oeste",
    "MS": "Centro-Oeste",
    "MT": "Centro-Oeste",
    "ES": "Sudeste",
    "MG": "Sudeste",
    "RJ": "Sudeste",
    "SP": "Sudeste",
    "PR": "Sul",
    "RS": "Sul",
    "SC": "Sul",
}


def load_env() -> str:
    env_path = ROOT / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                key, value = line.split("=", 1)
                os.environ.setdefault(key, value.strip())
    url = (
        os.environ.get("DATABASE_URL_UNPOOLED")
        or os.environ.get("DATABASE_URL")
        or ""
    ).strip()
    if not url:
        raise SystemExit("DATABASE_URL ausente.")
    return url


def parse_json(raw):
    if raw is None or raw == "":
        return None
    if isinstance(raw, (list, dict)):
        return raw
    text = str(raw).strip()
    if not text or text in {"—", "-", "None", "null"}:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def digits(value: str) -> str:
    return re.sub(r"\D", "", value or "")


def parse_city(raw: str) -> tuple[str, str]:
    text = re.sub(r"\s*\+\d+\s*$", "", (raw or "").strip())
    match = re.match(r"^(.*?)\s*-\s*([A-Za-z]{2})$", text)
    if match:
        return match.group(1).strip(), match.group(2).upper()
    return text, ""


def as_text(value) -> str:
    if value is None or value == "":
        return ""
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def first_phone(*blobs) -> str:
    for blob in blobs:
        match = re.search(
            r"(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9?\d{4}[-\s]?\d{4})",
            as_text(blob),
        )
        if match:
            return re.sub(r"\s+", " ", match.group(0)).strip()
    return ""


def first_email(*blobs) -> str:
    for blob in blobs:
        match = re.search(
            r"[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}",
            as_text(blob),
            re.I,
        )
        if match:
            return match.group(0).lower()
    return ""


def as_list(value) -> list:
    if isinstance(value, list):
        return value
    return []


def map_list(name: str) -> str:
    blob = (name or "").lower()
    if "construt" in blob:
        return "construtora"
    return "incorporadora"


def map_status(fase: str) -> str:
    value = (fase or "").strip().lower()
    if value in {"declinado", "perdido"}:
        return "sem_fit"
    if value in {"originação", "originacao", "qualificação", "qualificacao"}:
        return "em_conversa"
    if value in {"distribuição", "distribuicao", "prospecção", "prospeccao"}:
        return "abordar"
    if value in {"monitoramento", "follow", "follow-up"}:
        return "follow_up"
    return "novo"


def contacts(row: dict) -> tuple[str, str, str]:
    people = [p for p in as_list(parse_json(row.get("decisores") or "")) if isinstance(p, dict)]
    rfb = parse_json(row.get("contato_rfb") or "") or {}
    canais = parse_json(row.get("canais_site") or "") or {}
    empresa = parse_json(row.get("contato_empresa") or "") or {}
    mailing = as_list(parse_json(row.get("mailing") or ""))
    mail0 = mailing[0] if mailing and isinstance(mailing[0], dict) else {}
    raw = [
        json.dumps(canais, ensure_ascii=False) if isinstance(canais, dict) else "",
        json.dumps(rfb, ensure_ascii=False) if isinstance(rfb, dict) else "",
        json.dumps(people, ensure_ascii=False),
        row.get("canais_site") or "",
        row.get("contato_rfb") or "",
        row.get("decisores") or "",
        row.get("mailing") or "",
        row.get("contato_empresa") or "",
    ]
    phone = first_phone(
        str(canais.get("telefone") or "") if isinstance(canais, dict) else "",
        str(canais.get("whatsapp") or "") if isinstance(canais, dict) else "",
        str(empresa.get("tel") or "") if isinstance(empresa, dict) else "",
        str(rfb.get("telefone") or "") if isinstance(rfb, dict) else "",
        str(mail0.get("tel") or ""),
        *raw,
    )
    email = first_email(
        str(canais.get("email") or "") if isinstance(canais, dict) else "",
        str(empresa.get("email") or "") if isinstance(empresa, dict) else "",
        str(rfb.get("email") or "") if isinstance(rfb, dict) else "",
        str(mail0.get("email") or ""),
        *raw,
    )
    contact = (
        (people[0].get("nome") if people else "")
        or mail0.get("nome")
        or (empresa.get("nome") if isinstance(empresa, dict) else "")
        or ""
    )
    return str(contact).strip(), phone, email


def load_curitiba() -> dict[str, dict]:
    if not CURITIBA.exists():
        return {}
    with CURITIBA.open(encoding="utf-8-sig", newline="") as handle:
        return {str(row.get("id") or "").strip(): row for row in csv.DictReader(handle)}


def company_row(row: dict, curitiba: dict[str, dict]) -> tuple:
    radar_id = str(row.get("id") if row.get("id") is not None else "")
    extra = curitiba.get(radar_id, {})
    merged = {**row, **{k: v for k, v in extra.items() if v}}
    name = (merged.get("nome_exibicao") or merged.get("nome") or "").strip()
    city, uf = parse_city(merged.get("cidade_uf") or "")
    if not uf:
        uf = (merged.get("uf") or "").upper()[:2]
    contact, phone, email = contacts(merged)
    cnpj = digits(merged.get("cnpj_completo") or "") or digits(str(merged.get("cnpj") or ""))
    dist = extra.get("dist_km_curitiba") or merged.get("dist_km_curitiba")
    try:
        dist_n = float(dist) if dist not in (None, "") else None
    except ValueError:
        dist_n = None
    emp_n = merged.get("_n_emp") or 0
    try:
        emp_count = int(float(emp_n))
    except (TypeError, ValueError):
        emp_count = 0
    in_radius = radar_id in curitiba
    status = map_status(str(merged.get("finamob_fase") or ""))
    notes = ""
    if in_radius:
        notes = f"Praça Curitiba 100 km · {city}/{uf}"
        if merged.get("porte"):
            notes += f" · porte {merged['porte']}"
    return (
        radar_id,
        name or f"Empresa {radar_id}",
        map_list(name),
        city,
        uf,
        REGIAO.get(uf, ""),
        in_radius,
        dist_n,
        contact,
        phone,
        email,
        cnpj,
        (merged.get("site") or "")[:300],
        merged.get("porte") or "",
        merged.get("atuacao") or "",
        "radar-br" if not in_radius else "radar-curitiba",
        None,
        status,
        "Primeira abordagem" if in_radius else "",
        emp_count,
        notes,
    )


def development_rows(emps: dict) -> list[tuple]:
    out = []
    for company_id, items in emps.items():
        if not isinstance(items, list):
            continue
        for index, item in enumerate(items):
            if not isinstance(item, dict):
                continue
            name = (item.get("nome") or "").strip()
            if not name:
                continue
            units = item.get("unidades")
            try:
                units_n = int(float(units)) if units not in (None, "") else None
            except (TypeError, ValueError):
                units_n = None
            mcmv = item.get("mcmv")
            if isinstance(mcmv, str):
                mcmv_b = mcmv.lower() in {"true", "1", "sim"}
            else:
                mcmv_b = bool(mcmv) if mcmv is not None else None
            out.append(
                (
                    f"{company_id}-{index}",
                    str(company_id),
                    name[:200],
                    str(item.get("estagio") or ""),
                    str(item.get("tipo") or ""),
                    str(item.get("finalidade") or ""),
                    str(item.get("cidade") or ""),
                    str(item.get("uf") or "").upper()[:2],
                    str(item.get("bairro") or ""),
                    units_n,
                    str(item.get("lancamento") or ""),
                    str(item.get("entrega") or ""),
                    mcmv_b,
                    str(item.get("link") or "")[:400],
                )
            )
    return out


def main() -> None:
    url = load_env()
    print("Lendo dados.json.gz…", file=sys.stderr)
    with gzip.open(DADOS, "rt", encoding="utf-8") as handle:
        dados = json.load(handle)
    print("Lendo emps.json.gz…", file=sys.stderr)
    with gzip.open(EMPS, "rt", encoding="utf-8") as handle:
        emps = json.load(handle)
    curitiba = load_curitiba()
    companies = [company_row(row, curitiba) for row in dados["DATA"] if row]
    companies = [row for row in companies if row[0] != ""]
    developments = development_rows(emps)
    # drop developments whose company is missing
    ids = {row[0] for row in companies}
    developments = [row for row in developments if row[1] in ids]
    print(
        f"Inserindo {len(companies)} empresas e {len(developments)} empreendimentos…",
        file=sys.stderr,
    )
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute("TRUNCATE developments, companies CASCADE")
            with cur.copy(
                """COPY companies (
                    id, name, list, city, uf, region, in_curitiba_radius, dist_km,
                    contact_name, phone, email, document, site, porte, atuacao,
                    source, owner, status, next_action, emp_count, notes
                ) FROM STDIN"""
            ) as copy:
                for row in companies:
                    copy.write_row(row)
            with cur.copy(
                """COPY developments (
                    id, company_id, name, stage, kind, purpose, city, uf,
                    neighborhood, units, launch, delivery, mcmv, link
                ) FROM STDIN"""
            ) as copy:
                for row in developments:
                    copy.write_row(row)
            cur.execute(
                """SELECT
                    count(*) AS empresas,
                    count(*) FILTER (WHERE in_curitiba_radius) AS praca,
                    count(DISTINCT uf) AS ufs
                   FROM companies"""
            )
            print(dict(cur.fetchone()) if False else cur.fetchone(), file=sys.stderr)
            cur.execute("SELECT count(*) FROM developments")
            print("developments", cur.fetchone()[0], file=sys.stderr)
        conn.commit()
    print("ok")


if __name__ == "__main__":
    main()
