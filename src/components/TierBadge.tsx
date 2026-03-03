import type { Tier } from "@/types";

const tierStyles: Record<Tier, string> = {
  PLATINUM: "tier-platinum",
  GOLD: "tier-gold",
  SILVER: "tier-silver",
  BRONZE: "tier-bronze",
};

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tierStyles[tier]}`}>
      {tier.charAt(0) + tier.slice(1).toLowerCase()}
    </span>
  );
}
