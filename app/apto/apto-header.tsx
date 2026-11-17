import Moon from "lucide-react/dist/esm/icons/moon.mjs";
import Sun from "lucide-react/dist/esm/icons/sun.mjs";

import { aptoInterface, aptoProgram } from "./content";
import type { AptoTheme } from "./theme";

type ViewActionsProps = {
  alternateView: { href: string; label: string };
  theme: AptoTheme;
  onToggle: () => void;
};

export function AptoViewActions({ alternateView, theme, onToggle, className, testIdPrefix }: ViewActionsProps & {
  className: string;
  testIdPrefix: string;
}) {
  const lightLabel = aptoInterface.directions.find((direction) => direction.id === "nsfhome")?.label ?? "Light";
  const darkLabel = aptoInterface.directions.find((direction) => direction.id === "nsfnetwork")?.label ?? "Dark";
  const nextLabel = theme === "dark" ? lightLabel : darkLabel;
  return <div className={className}>
    <a className="story-directory-link" href={alternateView.href}>{alternateView.label}</a>
    <button
      className="story-theme-toggle"
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={`${aptoInterface.study.themeChooserLabel}: ${darkLabel}`}
      title={`${aptoInterface.study.themeSwitchActionPrefix} ${nextLabel}`}
      onClick={onToggle}
      data-testid={`${testIdPrefix}-theme-toggle`}
    >
      <Sun aria-hidden="true" focusable="false" />
      <span aria-hidden="true" />
      <Moon aria-hidden="true" focusable="false" />
    </button>
  </div>;
}

type NavigationItem = { section: string; label: string; href: string };

export function AptoHeader({ view, brandHref, navigationLabel, items, activeSection, alternateView, theme, onToggle }: ViewActionsProps & {
  view: "atlas" | "story";
  brandHref: string;
  navigationLabel: string;
  items: readonly NavigationItem[];
  activeSection: string;
}) {
  return <header className="story-header" data-testid={`${view}-header`}>
    <a className="story-brand" href={brandHref} aria-label={view === "atlas" ? "APTO Atlas home" : "APTO story home"}>
      <strong>{aptoProgram.acronym}</strong>
      <span>{aptoProgram.name}</span>
    </a>
    <nav aria-label={navigationLabel}>
      {items.map(({ section, label, href }) => <a
        key={section}
        href={href}
        aria-current={activeSection === section ? (view === "atlas" ? "page" : "location") : undefined}
        data-testid={`${view}-nav-${section}`}
      ><span>{label}</span></a>)}
    </nav>
    <AptoViewActions
      alternateView={alternateView}
      theme={theme}
      onToggle={onToggle}
      className="story-header-actions"
      testIdPrefix={view}
    />
  </header>;
}
