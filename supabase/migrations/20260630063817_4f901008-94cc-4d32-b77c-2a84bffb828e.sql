
CREATE TABLE IF NOT EXISTS public.notification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  batch_id UUID,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  gender TEXT,
  parent_name TEXT,
  parent_relation TEXT,
  parent_mobile TEXT,
  class TEXT,
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'sms',
  provider TEXT NOT NULL DEFAULT 'development',
  status TEXT NOT NULL DEFAULT 'sent',
  failure_reason TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_history_tenant ON public.notification_history(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_history_status ON public.notification_history(tenant_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_history TO anon, authenticated;
GRANT ALL ON public.notification_history TO service_role;

ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on notification_history" ON public.notification_history;
CREATE POLICY "Allow all operations on notification_history"
  ON public.notification_history FOR ALL USING (true) WITH CHECK (true);
