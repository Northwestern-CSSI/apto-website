import { AtlasSitePage } from "../../apto/atlas/atlas-site";
import { atlasMetadataFor } from "../../apto/atlas/metadata";

export const metadata = atlasMetadataFor("/projects");

export default function AtlasProjectsPage() {
  return <AtlasSitePage section="projects" />;
}
