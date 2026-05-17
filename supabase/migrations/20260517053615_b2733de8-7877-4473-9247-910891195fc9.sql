ALTER TABLE public.fee_records
ADD COLUMN IF NOT EXISTS tenant_id text;

CREATE INDEX IF NOT EXISTS idx_fee_records_tenant_student_year_month
ON public.fee_records (tenant_id, student_id, year, month);

CREATE INDEX IF NOT EXISTS idx_fee_records_student_year_month
ON public.fee_records (student_id, year, month);