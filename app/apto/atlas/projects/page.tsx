import { AtlasSitePage } from "../atlas-site";
import { atlasMetadataFor } from "../metadata";

export const metadata = atlasMetadataFor("/projects");

export default function AtlasProjectsPage() {
  return <AtlasSitePage section="projects" />;
}
