-- Agent-scoped idempotency (additive; replaces global-only unique index)
DROP INDEX IF EXISTS voice_crm_logs_idempotency_key_uidx;

CREATE UNIQUE INDEX IF NOT EXISTS voice_crm_logs_agent_idempotency_uidx
  ON public.voice_crm_logs (
    (parsed_json_data ->> '__agentId'),
    idempotency_key
  )
  WHERE idempotency_key IS NOT NULL;
