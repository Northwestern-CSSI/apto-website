import { AtlasSitePage } from "../atlas-site";
import { atlasMetadataFor } from "../metadata";

export const metadata = atlasMetadataFor("/cohort");

export default function AtlasCohortPage() {
  return <AtlasSitePage section="cohort" />;
}
