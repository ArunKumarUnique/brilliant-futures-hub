
CREATE TABLE public.homework (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  subject text,
  class text NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  assigned_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on homework" ON public.homework FOR ALL TO public USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.validate_homework_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'completed') THEN
    RAISE EXCEPTION 'Invalid homework status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_homework_status_trigger
BEFORE INSERT OR UPDATE ON public.homework
FOR EACH ROW EXECUTE FUNCTION public.validate_homework_status();
