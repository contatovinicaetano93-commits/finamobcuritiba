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
