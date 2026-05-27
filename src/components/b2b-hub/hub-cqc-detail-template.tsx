import type { HubEntry } from "@/lib/b2b-hub/registry";
import { HubPillarDetailTemplate } from "@/components/b2b-hub/hub-pillar-detail-template";

type Props = { entry: HubEntry; related: HubEntry[] };

export function HubCqcDetailTemplate({ entry, related }: Props) {
  return <HubPillarDetailTemplate entry={entry} related={related} pillar="cqc" />;
}
