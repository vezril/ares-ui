import { TriangleAlert } from "lucide-react";

import { PageHeader } from "@/components/ares/page-header";
import { EmptyState } from "@/components/ares/states";

export default function FindingsPage() {
  return (
    <>
      <PageHeader title="Findings">
        Severity-ranked <code className="font-mono text-xs">security.wifi.finding</code> events —
        rogue APs, captured handshakes, new own devices — each linking to its Apollo capture blob.
      </PageHeader>
      <EmptyState title="Findings board is a later slice" icon={<TriangleAlert className="size-5" />}>
        This reads the findings ares-service emits to Hermes (JSON events + Apollo capture
        references). It lights up once the service is emitting against a live network; until then
        there is nothing to rank — no placeholder findings.
      </EmptyState>
    </>
  );
}
