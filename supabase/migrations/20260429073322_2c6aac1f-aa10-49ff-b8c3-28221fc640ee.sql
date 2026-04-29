-- Backfill: any student on the summer-camp package becomes a summer_camp student
UPDATE public.students
SET student_type = 'summer_camp'
WHERE package_id = 'summer-camp'
  AND student_type IS DISTINCT FROM 'summer_camp';

-- Auto-sync trigger: whenever a student is inserted/updated with summer-camp package,
-- force student_type to 'summer_camp'. Conversely, if package changes away, switch to 'regular'.
CREATE OR REPLACE FUNCTION public.sync_student_type_with_package()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.package_id = 'summer-camp' THEN
    NEW.student_type := 'summer_camp';
  ELSIF TG_OP = 'UPDATE' AND OLD.package_id = 'summer-camp' AND NEW.package_id <> 'summer-camp' THEN
    -- Package moved away from summer camp → reclassify to regular
    NEW.student_type := 'regular';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_student_type_with_package ON public.students;
CREATE TRIGGER trg_sync_student_type_with_package
BEFORE INSERT OR UPDATE OF package_id, student_type
ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.sync_student_type_with_package();