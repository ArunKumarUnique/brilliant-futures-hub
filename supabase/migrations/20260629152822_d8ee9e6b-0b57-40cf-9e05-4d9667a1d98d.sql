
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS parent_relation text;

-- Dedupe homework: keep latest created_at per (tenant_id, student_id, assigned_date)
DELETE FROM public.homework h
USING public.homework h2
WHERE h.student_id IS NOT NULL
  AND h.tenant_id = h2.tenant_id
  AND h.student_id = h2.student_id
  AND h.assigned_date = h2.assigned_date
  AND h.created_at < h2.created_at;

-- Dedupe daily_learnings similarly
DELETE FROM public.daily_learnings d
USING public.daily_learnings d2
WHERE d.student_id IS NOT NULL
  AND d.tenant_id = d2.tenant_id
  AND d.student_id = d2.student_id
  AND d.date = d2.date
  AND d.created_at < d2.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS homework_unique_student_date
  ON public.homework (tenant_id, student_id, assigned_date)
  WHERE student_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS daily_learnings_unique_student_date
  ON public.daily_learnings (tenant_id, student_id, date)
  WHERE student_id IS NOT NULL;
