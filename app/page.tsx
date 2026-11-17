import { AtlasSitePage } from "./apto/atlas/atlas-site";
import { atlasMetadataFor } from "./apto/atlas/metadata";

export const metadata = atlasMetadataFor("/");

export default function Home() {
  return <AtlasSitePage section="home" />;
}
