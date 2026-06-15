import { SesliCrmView } from "@/components/features/crm/SesliCrmView";
import { loadVoiceLogsForCurrentAgent } from "@/lib/voice-crm/server-queries";

export const dynamic = "force-dynamic";

export default async function SesliCrmPage() {
  const { logs, error } = await loadVoiceLogsForCurrentAgent();

  return (
    <SesliCrmView
      initialLogs={logs}
      initialError={error}
    />
  );
}
