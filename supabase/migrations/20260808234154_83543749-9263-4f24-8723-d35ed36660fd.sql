ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'rti',
  ADD COLUMN IF NOT EXISTS complaint_text text,
  ADD COLUMN IF NOT EXISTS complaint_channel text,
  ADD COLUMN IF NOT EXISTS complaint_ref text,
  ADD COLUMN IF NOT EXISTS complaint_filed_date date,
  ADD COLUMN IF NOT EXISTS closure_claimed_date date,
  ADD COLUMN IF NOT EXISTS escalation_count integer NOT NULL DEFAULT 0;