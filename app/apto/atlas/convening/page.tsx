import { AtlasSitePage } from "../atlas-site";
import { atlasMetadataFor } from "../metadata";

export const metadata = atlasMetadataFor("/convening");

export default function AtlasConveningPage() {
  return <AtlasSitePage section="convening" />;
}
