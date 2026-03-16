
-- Students table
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  student_name text NOT NULL,
  parent_name text,
  student_mobile text,
  parent_mobile text NOT NULL,
  student_email text,
  parent_email text,
  class text NOT NULL,
  package_id text NOT NULL,
  monthly_fee numeric NOT NULL DEFAULT 0,
  admission_date date DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fee records table
CREATE TABLE public.fee_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_date date,
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (student_id, month, year)
);

-- Validation triggers instead of CHECK constraints
CREATE OR REPLACE FUNCTION validate_student_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'inactive') THEN
    RAISE EXCEPTION 'Invalid student status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_student_status
  BEFORE INSERT OR UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION validate_student_status();

CREATE OR REPLACE FUNCTION validate_fee_record()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.month < 1 OR NEW.month > 12 THEN
    RAISE EXCEPTION 'Month must be between 1 and 12';
  END IF;
  IF NEW.status NOT IN ('paid', 'pending') THEN
    RAISE EXCEPTION 'Invalid fee status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_fee_record
  BEFORE INSERT OR UPDATE ON public.fee_records
  FOR EACH ROW EXECUTE FUNCTION validate_fee_record();

-- Auto-update updated_at on students
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;

-- Permissive policies (admin is app-level gated via password)
CREATE POLICY "Allow all operations on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on fee_records" ON public.fee_records FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_students_tenant_id ON public.students(tenant_id);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_fee_records_student_id ON public.fee_records(student_id);
CREATE INDEX idx_fee_records_month_year ON public.fee_records(month, year);
CREATE INDEX idx_fee_records_status ON public.fee_records(status);
