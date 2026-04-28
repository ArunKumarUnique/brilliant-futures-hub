ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS student_type text NOT NULL DEFAULT 'regular';

UPDATE public.students SET student_type = 'regular' WHERE student_type IS NULL OR student_type = '';

CREATE OR REPLACE FUNCTION public.validate_student_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.student_type NOT IN ('regular', 'summer_camp') THEN
    RAISE EXCEPTION 'Invalid student_type: %', NEW.student_type;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_student_type_trigger ON public.students;
CREATE TRIGGER validate_student_type_trigger
  BEFORE INSERT OR UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.validate_student_type();

CREATE INDEX IF NOT EXISTS idx_students_tenant_type ON public.students(tenant_id, student_type);