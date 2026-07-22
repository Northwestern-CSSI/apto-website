import { AtlasSitePage } from "../apto/atlas/atlas-site";
import { atlasMetadataFor } from "../apto/atlas/metadata";

export const metadata = atlasMetadataFor("/");

export default function AtlasPage() {
  return <AtlasSitePage section="home" />;
}
