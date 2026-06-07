import type { HubEntry } from "@/lib/b2b-hub/registry";
import { HubPillarDetailTemplate } from "@/components/b2b-hub/hub-pillar-detail-template";
import { HubCqcReadinessScore } from "@/components/b2b-hub/hub-cqc-readiness-score";
import { HubContentStart } from "@/components/b2b-hub/hub-content-start";

type Props = { entry: HubEntry; related: HubEntry[] };

export function HubCqcDetailTemplate({ entry, related }: Props) {
  return (
    <>
      <HubPillarDetailTemplate entry={entry} related={related} pillar="cqc" />
      <HubContentStart className="pb-16 -mt-8">
        <HubCqcReadinessScore />
      </HubContentStart>
    </>
  );
}
