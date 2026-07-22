import { AtlasSitePage } from "../../apto/atlas/atlas-site";
import { atlasMetadataFor } from "../../apto/atlas/metadata";

export const metadata = atlasMetadataFor("/cohort");

export default function AtlasCohortPage() {
  return <AtlasSitePage section="cohort" />;
}
