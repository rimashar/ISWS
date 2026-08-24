/*
# Legal records for summons and warrants

1. New Tables
- `legal_records` stores summons and warrants created by court officers,
  with assignment to police officers and embedded stage timeline (JSONB).

2. Security
- RLS enabled with open read/write for anon (prototype — tighten for production).
*/

CREATE TABLE IF NOT EXISTS public.legal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_type text NOT NULL CHECK (record_type IN ('summons', 'warrant')),
  category text NOT NULL CHECK (
    category IN ('same_jurisdiction', 'cross_jurisdiction', 'bailable', 'non_bailable')
  ),
  reference_number text NOT NULL UNIQUE,
  person_name text NOT NULL,
  case_number text NOT NULL,
  status text NOT NULL DEFAULT 'issued',
  from_court text NOT NULL,
  from_city text NOT NULL,
  to_court text,
  to_city text,
  assigned_police_id text,
  assigned_police_name text,
  assigned_police_badge text,
  created_by_id text NOT NULL,
  created_by_name text NOT NULL,
  stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read legal records" ON public.legal_records;
CREATE POLICY "Public can read legal records"
  ON public.legal_records FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can insert legal records" ON public.legal_records;
CREATE POLICY "Public can insert legal records"
  ON public.legal_records FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update legal records" ON public.legal_records;
CREATE POLICY "Public can update legal records"
  ON public.legal_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS legal_records_type_category_idx
  ON public.legal_records (record_type, category);

CREATE INDEX IF NOT EXISTS legal_records_assigned_police_idx
  ON public.legal_records (assigned_police_id);
