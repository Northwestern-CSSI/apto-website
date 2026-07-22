import { AtlasSitePage } from "../atlas-site";
import { atlasMetadataFor } from "../metadata";

export const metadata = atlasMetadataFor("/tools");

export default function AtlasToolsPage() {
  return <AtlasSitePage section="tools" />;
}
