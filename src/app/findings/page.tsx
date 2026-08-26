import { PageHeader } from "@/components/ares/page-header";
import { FindingsBoard } from "@/components/ares/findings-board";

export default function FindingsPage() {
  return (
    <>
      <PageHeader title="Findings">
        Severity-ranked <code className="font-mono text-xs">security.wifi.finding</code> events —
        rogue APs, weak own passphrases, completed active tests — each linking to its Apollo capture
        reference.
      </PageHeader>
      <FindingsBoard />
    </>
  );
}
