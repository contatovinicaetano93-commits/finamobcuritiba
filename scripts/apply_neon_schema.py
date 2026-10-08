#!/usr/bin/env python3
"""Apply the Mesa schema to the linked Neon database."""

from __future__ import annotations

import os
from pathlib import Path

import psycopg

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "scripts" / "schema_neon.sql"


def load_url() -> str:
    env_path = ROOT / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                key, value = line.split("=", 1)
                os.environ.setdefault(key, value)
    url = (
        os.environ.get("DATABASE_URL_UNPOOLED")
        or os.environ.get("DATABASE_URL")
        or ""
    ).strip()
    if not url:
        raise SystemExit("DATABASE_URL ausente.")
    return url


def main() -> None:
    url = load_url()
    sql = SCHEMA.read_text()
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            cur.execute(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name IN (
                    'companies',
                    'developments',
                    'partners',
                    'activity_log',
                    'month_goals'
                  )
                ORDER BY table_name
                """
            )
            tables = [row[0] for row in cur.fetchall()]
            cur.execute("SELECT id, name FROM partners ORDER BY id")
            partners = [f"{row[0]}={row[1]}" for row in cur.fetchall()]
        conn.commit()
    print("schema ok", ",".join(tables))
    print("partners", ",".join(partners))


if __name__ == "__main__":
    main()
