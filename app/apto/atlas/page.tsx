import { AtlasSitePage } from "./atlas-site";
import { atlasMetadataFor } from "./metadata";

export const metadata = atlasMetadataFor("/");

export default function AtlasPage() {
  return <AtlasSitePage section="home" />;
}
