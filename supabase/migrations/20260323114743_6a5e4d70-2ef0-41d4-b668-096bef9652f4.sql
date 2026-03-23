
CREATE TABLE public.attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  tenant_id text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'absent',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on attendance" ON public.attendance
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.validate_attendance_status()
  RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.status NOT IN ('present', 'absent') THEN
    RAISE EXCEPTION 'Invalid attendance status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_attendance_status_trigger
  BEFORE INSERT OR UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.validate_attendance_status();
