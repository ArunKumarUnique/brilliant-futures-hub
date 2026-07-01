
-- Academic Years table
CREATE TABLE public.academic_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT academic_years_tenant_name_unique UNIQUE (tenant_id, name)
);

CREATE UNIQUE INDEX academic_years_one_active_per_tenant
  ON public.academic_years (tenant_id)
  WHERE is_active;

CREATE INDEX academic_years_tenant_idx ON public.academic_years(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_years TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_years TO anon;
GRANT ALL ON public.academic_years TO service_role;

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on academic_years"
  ON public.academic_years FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER academic_years_updated_at
  BEFORE UPDATE ON public.academic_years
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Add academic_year_id to students
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS students_academic_year_idx ON public.students(academic_year_id);

-- Seed a default active academic year "2025-2026" for every tenant that already has data / registry entries
DO $$
DECLARE
  t RECORD;
  new_year_id UUID;
BEGIN
  FOR t IN (
    SELECT DISTINCT tenant_id FROM public.students
    UNION
    SELECT DISTINCT tenant_id FROM public.tenants_registry WHERE tenant_id IS NOT NULL
  ) LOOP
    IF NOT EXISTS (SELECT 1 FROM public.academic_years WHERE tenant_id = t.tenant_id) THEN
      INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_active)
      VALUES (t.tenant_id, '2025-2026', DATE '2025-06-01', DATE '2026-05-31', true)
      RETURNING id INTO new_year_id;

      UPDATE public.students
        SET academic_year_id = new_year_id
        WHERE tenant_id = t.tenant_id AND academic_year_id IS NULL;
    END IF;
  END LOOP;
END $$;
