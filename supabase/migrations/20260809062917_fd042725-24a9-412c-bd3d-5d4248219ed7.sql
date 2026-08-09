ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS application_body_kn TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS complaint_language TEXT;
ALTER TABLE public.appeals ADD COLUMN IF NOT EXISTS body_kn TEXT;