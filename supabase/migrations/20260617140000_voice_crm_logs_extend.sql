-- Sesli CRM: transcript, durum, idempotency ve müşteri bağlantısı (idempotent)
ALTER TABLE public.voice_crm_logs
  ADD COLUMN IF NOT EXISTS transcript TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS client_id TEXT,
  ADD COLUMN IF NOT EXISTS applied_action TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS voice_crm_logs_status_idx
  ON public.voice_crm_logs (status);

CREATE INDEX IF NOT EXISTS voice_crm_logs_agent_status_idx
  ON public.voice_crm_logs ((parsed_json_data ->> '__agentId'), status);

CREATE UNIQUE INDEX IF NOT EXISTS voice_crm_logs_idempotency_key_uidx
  ON public.voice_crm_logs (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN public.voice_crm_logs.status IS 'pending | processed | archived | dismissed';
COMMENT ON COLUMN public.voice_crm_logs.client_id IS 'Onay sonrası bağlanan Prisma Client id';
