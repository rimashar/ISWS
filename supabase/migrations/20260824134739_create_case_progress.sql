/*
# Create shared case progress state

1. New Tables
- `case_progress` stores the single active demo case's current tracker stage.
- `id` is a stable row identifier.
- `current_stage` stores the active stage number.
- `updated_at` stores the latest update time.

2. Security
- Row level security is enabled.
- This no-sign-in prototype intentionally allows the public app to read and update its shared case progress.
- Separate policies are created for SELECT, INSERT, UPDATE, and DELETE.

3. Important Notes
- The seeded row keeps the dashboard usable on first load.
- The table is single-tenant because this experience does not include sign-in.
*/

CREATE TABLE IF NOT EXISTS public.case_progress (
  id integer PRIMARY KEY,
  current_stage integer NOT NULL DEFAULT 2 CHECK (current_stage BETWEEN 1 AND 3),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.case_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read case progress" ON public.case_progress;
CREATE POLICY "Public can read case progress"
  ON public.case_progress FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can create case progress" ON public.case_progress;
CREATE POLICY "Public can create case progress"
  ON public.case_progress FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update case progress" ON public.case_progress;
CREATE POLICY "Public can update case progress"
  ON public.case_progress FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete case progress" ON public.case_progress;
CREATE POLICY "Public can delete case progress"
  ON public.case_progress FOR DELETE
  TO anon, authenticated
  USING (true);

INSERT INTO public.case_progress (id, current_stage)
VALUES (1, 2)
ON CONFLICT (id) DO NOTHING;
