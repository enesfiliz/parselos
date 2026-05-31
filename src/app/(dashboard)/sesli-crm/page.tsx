import { SesliCrmView } from "@/components/features/crm/SesliCrmView";
import { normalizeVoiceCrmLogs } from "@/lib/crm-logs";
import { createSupabaseAdmin } from "@/lib/supabase";

export default async function SesliCrmPage() {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("voice_crm_logs")
    .select("*")
    .order("created_at", { ascending: false });

  const initialLogs = normalizeVoiceCrmLogs(
    (data ?? []) as Record<string, unknown>[],
  );

  return (
    <SesliCrmView
      initialLogs={initialLogs}
      initialError={error?.message ?? null}
    />
  );
}
