/* Content-managed images use intrinsic dimensions and deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import type { aptoParticipants } from "./content";
import { withDeploymentBase } from "./paths";

type AptoParticipant = (typeof aptoParticipants)[number];

export function ParticipantLogo({ participant }: { participant: AptoParticipant }) {
  return <span
    className={`story-participant-logo logo-${participant.id} logo-kind-${participant.logo.kind}`}
    aria-hidden="true"
  >
    <span className="story-logo-canvas">
      <img
        className="story-logo-asset is-light"
        src={withDeploymentBase(participant.logo.variants.light.src)}
        width={participant.logo.variants.light.width}
        height={participant.logo.variants.light.height}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <img
        className="story-logo-asset is-dark"
        src={withDeploymentBase(participant.logo.variants.dark.src)}
        width={participant.logo.variants.dark.width}
        height={participant.logo.variants.dark.height}
        alt=""
        loading="lazy"
        decoding="async"
      />
    </span>
  </span>;
}
