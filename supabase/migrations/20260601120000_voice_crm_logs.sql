-- Sesli CRM kayıtları (Supabase — Prisma şemasından bağımsız)
CREATE TABLE IF NOT EXISTS public.voice_crm_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parsed_json_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS voice_crm_logs_created_at_idx
  ON public.voice_crm_logs (created_at DESC);

COMMENT ON TABLE public.voice_crm_logs IS 'Sesli CRM: Groq ile ayrıştırılmış müşteri notları';

ALTER TABLE public.voice_crm_logs ENABLE ROW LEVEL SECURITY;
