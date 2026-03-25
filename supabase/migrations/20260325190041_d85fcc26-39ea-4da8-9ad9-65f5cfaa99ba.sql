
-- Part 2: Add arrival_time and marked_at to attendance
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS arrival_time time without time zone;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS marked_at timestamp with time zone DEFAULT now();

-- Part 3: Timetables table
CREATE TABLE public.timetables (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id text NOT NULL,
  title text NOT NULL,
  image_url text,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on timetables"
  ON public.timetables FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Part 3: Storage bucket for timetable uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('timetables', 'timetables', true);

CREATE POLICY "Allow public read on timetables bucket"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'timetables');

CREATE POLICY "Allow upload to timetables bucket"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'timetables');

CREATE POLICY "Allow delete from timetables bucket"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'timetables');

-- Part 4: Daily learnings table
CREATE TABLE public.daily_learnings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  class text NOT NULL,
  topic text NOT NULL,
  notes text,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.daily_learnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on daily_learnings"
  ON public.daily_learnings FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
