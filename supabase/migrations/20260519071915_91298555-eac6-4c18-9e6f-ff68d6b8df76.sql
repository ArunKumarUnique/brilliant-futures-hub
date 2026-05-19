ALTER TABLE public.tenants_registry
ADD COLUMN IF NOT EXISTS summer_camp_enabled boolean NOT NULL DEFAULT true;