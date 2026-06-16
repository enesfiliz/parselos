import { SesliCrmView } from "@/components/features/crm/SesliCrmView";
import { getVoiceCrmConfigStatus } from "@/lib/voice-crm/config";
import { loadVoiceLogsForCurrentAgent } from "@/lib/voice-crm/server-queries";

export const dynamic = "force-dynamic";

export default async function SesliCrmPage() {
  const configStatus = getVoiceCrmConfigStatus();
  const { logs, error } = await loadVoiceLogsForCurrentAgent();

  return (
    <SesliCrmView
      initialLogs={logs}
      initialError={error}
      configStatus={configStatus}
    />
  );
}
