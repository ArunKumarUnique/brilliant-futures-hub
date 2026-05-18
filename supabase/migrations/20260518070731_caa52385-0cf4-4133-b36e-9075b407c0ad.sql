
CREATE TABLE public.tenant_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  type TEXT NOT NULL DEFAULT 'regular',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX tenant_packages_unique_name
  ON public.tenant_packages (tenant_id, type, lower(name));

CREATE INDEX tenant_packages_tenant_idx
  ON public.tenant_packages (tenant_id);

ALTER TABLE public.tenant_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on tenant_packages"
  ON public.tenant_packages
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.validate_tenant_package()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'inactive') THEN
    RAISE EXCEPTION 'Invalid package status: %', NEW.status;
  END IF;
  IF NEW.type NOT IN ('regular', 'summer_camp') THEN
    RAISE EXCEPTION 'Invalid package type: %', NEW.type;
  END IF;
  IF NEW.fee IS NULL OR NEW.fee <= 0 THEN
    RAISE EXCEPTION 'Package fee must be greater than 0';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tenant_packages_validate
  BEFORE INSERT OR UPDATE ON public.tenant_packages
  FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_package();

CREATE TRIGGER tenant_packages_set_updated_at
  BEFORE UPDATE ON public.tenant_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
