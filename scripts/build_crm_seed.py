#!/usr/bin/env python3
"""Turn the Radar Curitiba sheet into the mesa CRM seed."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

ROOT = Path(__file__).resolve().parents[1]
UPLOADS = [
    Path("/home/ubuntu/.cursor/projects/workspace/uploads/Radar_Finamob_Backup_06eb.xlsx"),
    Path("/opt/cursor/artifacts/Radar_Finamob_Backup.xlsx"),
    ROOT / "source" / "Radar_Finamob_Backup.xlsx",
]
OUT = ROOT / "public" / "crm" / "base-curitiba.json"


def col_index(ref: str) -> int:
    letters = "".join(c for c in ref if c.isalpha())
    n = 0
    for char in letters:
        n = n * 26 + (ord(char.upper()) - 64)
    return max(0, n - 1)


def cell_value(cell: ET.Element) -> str:
    kind = cell.attrib.get("t")
    value = cell.find("m:v", NS)
    inline = cell.find("m:is", NS)
    if kind == "inlineStr" and inline is not None:
        return "".join((node.text or "") for node in inline.findall(".//m:t", NS))
    if value is not None and value.text is not None:
        return value.text
    return ""


def read_sheet(zip_file: ZipFile, number: int) -> list[dict[str, str]]:
    root = ET.fromstring(zip_file.read(f"xl/worksheets/sheet{number}.xml"))
    rows: list[list[str]] = []
    for row in root.findall("m:sheetData/m:row", NS):
        line: list[str] = []
        for cell in row.findall("m:c", NS):
            pos = col_index(cell.attrib.get("r", "A1"))
            while len(line) <= pos:
                line.append("")
            line[pos] = cell_value(cell)
        rows.append(line)
    if not rows:
        return []
    headers = rows[0]
    records = []
    for line in rows[1:]:
        records.append(
            {headers[i]: (line[i] if i < len(line) else "") for i in range(len(headers))}
        )
    return records


def parse_json(raw: str):
    text = (raw or "").strip()
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
    if text:
        return text, "PR"
    return "Curitiba", "PR"


def first_phone(*blobs: str) -> str:
    for blob in blobs:
        match = re.search(
            r"(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9?\d{4}[-\s]?\d{4})",
            blob or "",
        )
        if match:
            return re.sub(r"\s+", " ", match.group(0)).strip()
    return ""


def first_email(*blobs: str) -> str:
    for blob in blobs:
        match = re.search(r"[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}", blob or "", re.I)
        if match:
            return match.group(0).lower()
    return ""


def as_list(value) -> list:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return []


def map_list(name: str) -> str:
    blob = name.lower()
    if "construt" in blob and "incorpor" not in blob:
        return "construtora"
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


def briefing(row: dict, people: list[dict], rfb: dict, canais: dict) -> str:
    city, uf = parse_city(row.get("cidade_uf") or "")
    lines = [
        f"Radar · raio Curitiba 100 km · {city}/{uf}",
    ]
    bits = [
        row.get("porte") and f"Porte {row['porte']}",
        row.get("atuacao") not in {"", "—"} and row.get("atuacao"),
        row.get("_n_emp") and f"{row['_n_emp']} empreendimentos",
        row.get("dist_km_curitiba") and f"{float(row['dist_km_curitiba']):.0f} km do centro",
        row.get("padroes") and row.get("padroes"),
    ]
    lines.append(" · ".join(bit for bit in bits if bit))
    if row.get("site"):
        lines.append(f"Site: {row['site']}")
    if row.get("linkedin"):
        lines.append(f"LinkedIn: {row['linkedin']}")
    insta = row.get("instagram") or (canais or {}).get("instagram")
    if insta:
        lines.append(f"Instagram: {insta}")
    if row.get("origem"):
        lines.append(f"Origem Radar: {row['origem']}")
    if row.get("gatilhos") and row["gatilhos"] not in {"0", "—"}:
        lines.append(f"Gatilhos: {row['gatilhos']}")
    if row.get("finamob_fase"):
        lines.append(f"Fase na matriz: {row['finamob_fase']} (não copia dono da matriz)")
    if people:
        lines.append("Decisores:")
        for person in people[:6]:
            if not isinstance(person, dict):
                continue
            chunk = ", ".join(
                part
                for part in [
                    person.get("nome"),
                    person.get("cargo"),
                    person.get("email"),
                    person.get("celular") or person.get("tel"),
                ]
                if part
            )
            if chunk:
                lines.append(f"· {chunk}")
    if rfb:
        tel = rfb.get("telefone") or rfb.get("tel")
        mail = rfb.get("email")
        if tel or mail:
            lines.append(f"RFB: {tel or '—'} · {mail or '—'}")
    return "\n".join(line for line in lines if line)[:1800]


def next_step(status: str, phone: str, email: str) -> str:
    if status == "sem_fit":
        return "Não reabrir sem gatilho novo"
    if not phone and not email:
        return "Completar telefone ou e-mail"
    if status in {"em_conversa", "follow_up"}:
        return "Retomar o que já andou na praça"
    return "Primeira abordagem"


def build_account(row: dict, now: str) -> dict | None:
    name = (row.get("nome_exibicao") or row.get("nome") or "").strip()
    if len(name) < 2:
        return None
    people = [p for p in as_list(parse_json(row.get("decisores") or "")) if isinstance(p, dict)]
    rfb = parse_json(row.get("contato_rfb") or "") or {}
    canais = parse_json(row.get("canais_site") or "") or {}
    empresa = parse_json(row.get("contato_empresa") or "") or {}
    mailing = as_list(parse_json(row.get("mailing") or ""))
    mail0 = mailing[0] if mailing and isinstance(mailing[0], dict) else {}

    phone = first_phone(
        str(canais.get("telefone") or ""),
        str(canais.get("whatsapp") or ""),
        str(empresa.get("tel") or ""),
        str(rfb.get("telefone") or ""),
        str(mail0.get("tel") or ""),
        " ".join(str(p.get("celular") or p.get("tel") or "") for p in people),
        row.get("canais_site") or "",
        row.get("contato_rfb") or "",
        row.get("decisores") or "",
        row.get("mailing") or "",
        row.get("contato_empresa") or "",
    )
    email = first_email(
        str(canais.get("email") or ""),
        str(empresa.get("email") or ""),
        str(rfb.get("email") or ""),
        str(mail0.get("email") or ""),
        " ".join(str(p.get("email") or "") for p in people),
        row.get("canais_site") or "",
        row.get("contato_rfb") or "",
        row.get("decisores") or "",
        row.get("mailing") or "",
        row.get("contato_empresa") or "",
    )
    contact = (
        (people[0].get("nome") if people else "")
        or mail0.get("nome")
        or empresa.get("nome")
        or ""
    )
    city, uf = parse_city(row.get("cidade_uf") or "")
    status = map_status(row.get("finamob_fase") or "")
    radar_id = str(row.get("id") or "").strip()
    cnpj = digits(row.get("cnpj_completo") or "") or digits(row.get("cnpj") or "")
    external = radar_id or cnpj or name.lower()
    return {
        "id": f"radar-cwb-{external}",
        "list": map_list(name),
        "name": name,
        "city": city,
        "uf": uf,
        "contactName": str(contact).strip(),
        "phone": phone,
        "email": email,
        "document": cnpj,
        "source": "radar-curitiba",
        "externalId": external,
        "owner": None,
        "status": status,
        "nextAction": next_step(status, phone, email),
        "nextActionAt": "",
        "lastContactAt": "",
        "notes": briefing(row, people, rfb if isinstance(rfb, dict) else {}, canais if isinstance(canais, dict) else {}),
        "createdAt": now,
        "updatedAt": now,
        "updatedBy": "vini",
    }


def main() -> None:
    source = next((path for path in UPLOADS if path.exists()), None)
    if source is None:
        raise SystemExit("Radar_Finamob_Backup.xlsx não encontrado.")
    with ZipFile(source) as zip_file:
        curitiba = read_sheet(zip_file, 3)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    accounts = []
    seen = set()
    for row in curitiba:
        account = build_account(row, now)
        if not account:
            continue
        key = account["externalId"]
        if key in seen:
            continue
        seen.add(key)
        accounts.append(account)
    payload = {
        "version": 1,
        "seed": "radar-curitiba-100km",
        "generatedAt": now,
        "source": source.name,
        "accounts": accounts,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    phones = sum(1 for item in accounts if item["phone"])
    emails = sum(1 for item in accounts if item["email"])
    lists = {}
    for item in accounts:
        lists[item["list"]] = lists.get(item["list"], 0) + 1
    print(
        f"Wrote {OUT} ({OUT.stat().st_size} bytes) · {len(accounts)} contas · "
        f"{lists} · tel {phones} · email {emails}"
    )


if __name__ == "__main__":
    main()
