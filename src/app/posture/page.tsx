import { PageHeader } from "@/components/ares/page-header";
import { PostureBoard } from "@/components/ares/posture-board";

export default function PosturePage() {
  return (
    <>
      <PageHeader title="Own-network posture">
        Your APs&apos; encryption grade, passphrase-audit status, and rogue-spoof alerts — the honest
        self-assessment of your own network, worst posture first.
      </PageHeader>
      <PostureBoard />
    </>
  );
}
