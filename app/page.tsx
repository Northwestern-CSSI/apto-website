import { aptoStoryMetadata } from "./apto/story/metadata";
import { AptoStoryPage } from "./apto/story/story-site";

export const metadata = aptoStoryMetadata;

export default function Home() {
  return <AptoStoryPage />;
}
