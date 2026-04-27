
-- Summer camp payments (independent from monthly fees)
CREATE TABLE public.summer_camp_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  student_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 1500,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_date DATE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, student_id)
);

ALTER TABLE public.summer_camp_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on summer_camp_payments"
ON public.summer_camp_payments FOR ALL
USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.validate_summer_camp_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('paid', 'pending') THEN
    RAISE EXCEPTION 'Invalid summer camp payment status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_summer_camp_status_trigger
BEFORE INSERT OR UPDATE ON public.summer_camp_payments
FOR EACH ROW EXECUTE FUNCTION public.validate_summer_camp_status();

CREATE TRIGGER update_summer_camp_payments_updated_at
BEFORE UPDATE ON public.summer_camp_payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Receipts log for unique receipt IDs and audit
CREATE TABLE public.fee_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  student_id UUID NOT NULL,
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  month INTEGER,
  year INTEGER,
  paid_date DATE NOT NULL,
  payment_method TEXT,
  is_summer_camp BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fee_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on fee_receipts"
ON public.fee_receipts FOR ALL
USING (true) WITH CHECK (true);

CREATE INDEX idx_fee_receipts_tenant_student ON public.fee_receipts(tenant_id, student_id);
CREATE INDEX idx_summer_camp_payments_tenant ON public.summer_camp_payments(tenant_id);
