export type PlanCategory = "sme" | "gifting" | "cooperate_gifting";

export type DataPlan = {
  _id: string;
  name: string;
  amount: number;
  provider: string;
  category: string;
  validity: string;
  externalId: number;
};

export type Validity = {
  days: number | null;
  label: string;
  note: string | null;
};

export const PROVIDER_META: Record<
  string,
  { label: string; badgeBg: string; badgeText: string; dot: string }
> = {
  mtn: {
    label: "MTN",
    badgeBg: "bg-[#FFCC00]",
    badgeText: "text-black",
    dot: "bg-[#FFCC00]",
  },
  airtel: {
    label: "Airtel",
    badgeBg: "bg-[#E50914]",
    badgeText: "text-white",
    dot: "bg-[#E50914]",
  },
  glo: {
    label: "Glo",
    badgeBg: "bg-[#7CBB15]",
    badgeText: "text-white",
    dot: "bg-[#7CBB15]",
  },
  "9mobile": {
    label: "9mobile",
    badgeBg: "bg-[#23342B]",
    badgeText: "text-[#9EBA28]",
    dot: "bg-[#23342B]",
  },
};

export const CATEGORY_META: Record<
  string,
  { label: string; blurb: string }
> = {
  sme: {
    label: "SME",
    blurb: "Everyday data bundles for staff and small teams.",
  },
  gifting: {
    label: "Gifting",
    blurb: "Send data straight to a phone number as a gift.",
  },
  cooperate_gifting: {
    label: "Cooperate Gifting",
    blurb: "Branded bulk gifting for partners and campaign runs.",
  },
};

const NOTE_PATTERN = /social bundle/i;

/**
 * Normalizes the messy validity strings coming from the database
 * ("30DAYS", "7 DAYS ", "30.DAYS", "3DAYS Social bundle ") into a usable shape.
 */
export function parseValidity(raw: string): Validity {
  const trimmed = (raw ?? "").trim();
  const note = NOTE_PATTERN.test(trimmed) ? "Social bundle" : null;

  const match = trimmed.match(/(\d+)\s*\.?\s*days?/i);
  if (!match) {
    return { days: null, label: trimmed || "Flexible", note };
  }

  const days = Number(match[1]);
  return {
    days,
    label: `${days} ${days === 1 ? "day" : "days"}`,
    note,
  };
}

export function formatNaira(amount: number): string {
  return `₦${new Intl.NumberFormat("en-NG").format(amount)}`;
}

export function getProviderMeta(provider: string) {
  const key = provider.toLowerCase();
  return (
    PROVIDER_META[key] ?? {
      label: provider,
      badgeBg: "bg-primary-700",
      badgeText: "text-white",
      dot: "bg-primary-700",
    }
  );
}

export function getCategoryMeta(category: string) {
  return (
    CATEGORY_META[category] ?? { label: category, blurb: "Data plans for everyone." }
  );
}

export function sortPlans(plans: DataPlan[]): DataPlan[] {
  return [...plans].sort((a, b) => {
    if (a.provider !== b.provider) {
      return a.provider.localeCompare(b.provider);
    }
    return parseValidity(a.validity).label.localeCompare(
      parseValidity(b.validity).label
    );
  });
}

export function getProviders(plans: DataPlan[]): string[] {
  return Array.from(new Set(plans.map((p) => p.provider.toLowerCase()))).sort();
}
