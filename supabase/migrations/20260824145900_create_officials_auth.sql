/*
# Create officials table and secure login verification

1. New Tables
- `officials` stores the credentials for Police and Court users.
  - `id` unique identifier for the official.
  - `role` is either 'police' or 'court'.
  - `identifier` is the Badge ID (police) or Court ID (court) used to sign in.
  - `password` is the login password (plain text — acceptable for this
    prototype's demo credentials, never exposed directly to clients).
  - `full_name` is a display name shown once signed in.
  - `created_at` records when the credential was added.
  - A role + identifier pair is unique so IDs don't collide across roles.

2. Security
- Row level security is enabled on `officials`.
- No SELECT/INSERT/UPDATE/DELETE policies are granted to `anon` or
  `authenticated`, so the table (and its passwords) can never be read or
  written directly from the browser.
- A `SECURITY DEFINER` function `verify_official_login` is the only way to
  check credentials. It runs with elevated privileges, compares the role,
  identifier and password server-side, and returns just the safe fields
  (id, role, identifier, full_name) — never the password itself.
- `EXECUTE` on that function is granted to `anon` and `authenticated` so the
  sign-in form can call it before a session exists.

3. Important Notes
- Demo credentials are seeded to match the ones shown on the sign-in screen:
  Police Badge ID `PD-1042` / password `police123`, Court ID `CRT-5001` /
  password `court123`.
- Passwords are stored in plain text here for prototype simplicity. Before
  using this in production, hash passwords (e.g. with pgcrypto's
  `crypt()`/`gen_salt()`) and compare hashes inside the function instead.
*/

CREATE TABLE IF NOT EXISTS public.officials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('police', 'court')),
  identifier text NOT NULL,
  password text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, identifier)
);

ALTER TABLE public.officials ENABLE ROW LEVEL SECURITY;

-- Intentionally no policies: the officials table is never read or written
-- directly by anon/authenticated clients. All access goes through the
-- verify_official_login() function below.

INSERT INTO public.officials (role, identifier, password, full_name)
VALUES
  ('police', 'PD-1042', 'police123', 'Officer Rajesh Kumar'),
  ('court', 'CRT-5001', 'court123', 'Registrar, District Court Delhi')
ON CONFLICT (role, identifier) DO NOTHING;

CREATE OR REPLACE FUNCTION public.verify_official_login(
  p_role text,
  p_identifier text,
  p_password text
)
RETURNS TABLE (
  id uuid,
  role text,
  identifier text,
  full_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.role, o.identifier, o.full_name
  FROM public.officials o
  WHERE o.role = p_role
    AND o.identifier = p_identifier
    AND o.password = p_password;
$$;

GRANT EXECUTE ON FUNCTION public.verify_official_login(text, text, text) TO anon, authenticated;
