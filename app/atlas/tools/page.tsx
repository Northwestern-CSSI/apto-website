import { AtlasSitePage } from "../../apto/atlas/atlas-site";
import { atlasMetadataFor } from "../../apto/atlas/metadata";

export const metadata = atlasMetadataFor("/tools");

export default function AtlasToolsPage() {
  return <AtlasSitePage section="tools" />;
}
