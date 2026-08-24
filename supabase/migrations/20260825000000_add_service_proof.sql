/*
  Add served method and geo-tagged proof of service onto legal records.
*/

ALTER TABLE public.legal_records
  ADD COLUMN IF NOT EXISTS served_details jsonb,
  ADD COLUMN IF NOT EXISTS service_proof jsonb;
