import { PageHeader } from "@/components/ares/page-header";
import { SurveyConsole } from "@/components/ares/survey-console";

export default function SurveyPage() {
  return (
    <>
      <PageHeader title="Survey">
        The live monitor-mode sweep. Own-network APs and clients in detail; foreign RF as aggregate
        counts only, with a rogue alert if a foreign radio broadcasts one of your SSIDs.
      </PageHeader>
      <SurveyConsole />
    </>
  );
}
