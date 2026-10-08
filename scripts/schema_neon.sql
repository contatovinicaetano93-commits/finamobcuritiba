CREATE TABLE IF NOT EXISTS companies (
  id text PRIMARY KEY,
  name text NOT NULL,
  list text NOT NULL,
  city text NOT NULL DEFAULT '',
  uf text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  in_curitiba_radius boolean NOT NULL DEFAULT false,
  dist_km double precision,
  contact_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  document text NOT NULL DEFAULT '',
  site text NOT NULL DEFAULT '',
  porte text NOT NULL DEFAULT '',
  atuacao text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  owner text,
  status text NOT NULL DEFAULT 'novo',
  next_action text NOT NULL DEFAULT '',
  next_action_at date,
  last_contact_at date,
  notes text NOT NULL DEFAULT '',
  emp_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text NOT NULL DEFAULT 'vini'
);

CREATE INDEX IF NOT EXISTS companies_uf_idx ON companies (uf);
CREATE INDEX IF NOT EXISTS companies_city_idx ON companies (city);
CREATE INDEX IF NOT EXISTS companies_region_idx ON companies (region);
CREATE INDEX IF NOT EXISTS companies_praca_idx ON companies (in_curitiba_radius);
CREATE INDEX IF NOT EXISTS companies_status_idx ON companies (status);
CREATE INDEX IF NOT EXISTS companies_name_idx ON companies (lower(name));
CREATE INDEX IF NOT EXISTS companies_owner_idx ON companies (owner);
CREATE INDEX IF NOT EXISTS companies_list_idx ON companies (list);

CREATE TABLE IF NOT EXISTS developments (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  name text NOT NULL,
  stage text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT '',
  purpose text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  uf text NOT NULL DEFAULT '',
  neighborhood text NOT NULL DEFAULT '',
  units integer,
  launch text NOT NULL DEFAULT '',
  delivery text NOT NULL DEFAULT '',
  mcmv boolean,
  link text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS developments_company_idx ON developments (company_id);
CREATE INDEX IF NOT EXISTS developments_uf_idx ON developments (uf);
CREATE INDEX IF NOT EXISTS developments_city_idx ON developments (city);

CREATE TABLE IF NOT EXISTS partners (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO partners (id, name) VALUES
  ('vini', 'Vini'),
  ('rafa', 'Rafa'),
  ('tadeu', 'Tadeu')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

CREATE TABLE IF NOT EXISTS activity_log (
  id text PRIMARY KEY,
  partner_id text NOT NULL REFERENCES partners (id),
  company_id text REFERENCES companies (id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'abordagem',
  note text NOT NULL DEFAULT '',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_log_partner_idx ON activity_log (partner_id);
CREATE INDEX IF NOT EXISTS activity_log_company_idx ON activity_log (company_id);
CREATE INDEX IF NOT EXISTS activity_log_created_idx ON activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_kind_idx ON activity_log (kind);

-- partner_id may be a partner id or the synthetic "casa" bucket for house goals
CREATE TABLE IF NOT EXISTS month_goals (
  id text PRIMARY KEY,
  partner_id text NOT NULL,
  year_month text NOT NULL,
  metric text NOT NULL,
  target numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, year_month, metric)
);

CREATE INDEX IF NOT EXISTS month_goals_year_month_idx ON month_goals (year_month);
CREATE INDEX IF NOT EXISTS month_goals_partner_idx ON month_goals (partner_id);
