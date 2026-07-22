import {
  AptoSitePage,
  type AptoSection,
} from "./site";

export function AptoRoutePage({
  section,
}: {
  section: AptoSection;
}) {
  return <AptoSitePage section={section} />;
}
