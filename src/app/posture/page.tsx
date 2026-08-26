import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/ares/page-header";
import { EmptyState } from "@/components/ares/states";

export default function PosturePage() {
  return (
    <>
      <PageHeader title="Own-network posture">
        Your APs&apos; channel, security, and passphrase-audit status — the honest self-assessment
        of your own network.
      </PageHeader>
      <EmptyState title="Posture view is a later slice" icon={<ShieldCheck className="size-5" />}>
        This reads from the survey&apos;s own-AP data plus the audit tier (WPA handshake / PMKID
        against your own APs), which ares-service builds after passive survey is proven. Nothing is
        shown until that data exists — no invented posture.
      </EmptyState>
    </>
  );
}
