import { AtlasSitePage } from "../../apto/atlas/atlas-site";
import { atlasMetadataFor } from "../../apto/atlas/metadata";

export const metadata = atlasMetadataFor("/convening");

export default function AtlasConveningPage() {
  return <AtlasSitePage section="convening" />;
}
