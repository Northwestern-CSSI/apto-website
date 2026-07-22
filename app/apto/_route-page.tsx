import {
  NsfAptoPage,
  type NsfAptoSection,
} from "../nsf-apto-mockups";

export function AptoRoutePage({
  section,
}: {
  section: NsfAptoSection;
}) {
  return <NsfAptoPage section={section} />;
}
