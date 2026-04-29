export type FlavorId = "terminal" | "swiss" | "edtech";

export type Flavor = {
  id: FlavorId;
  label: string;
  blurb: string;
  swatches: [string, string, string];
  features: {
    showHero: boolean;
    showFooter: boolean;
    emojiTabs: boolean;
    numberedTabs: boolean;
    brandMark: "glyph" | "swiss" | "gradient";
    heroStyle: "display" | "friendly";
  };
};

export const FLAVORS: Record<FlavorId, Flavor> = {
  terminal: {
    id: "terminal",
    label: "Terminal",
    blurb: "Dense IDE feel · monospace · lime accent",
    swatches: ["#0f1115", "#bef264", "#27272a"],
    features: {
      showHero: false,
      showFooter: false,
      emojiTabs: false,
      numberedTabs: false,
      brandMark: "glyph",
      heroStyle: "display",
    },
  },
  swiss: {
    id: "swiss",
    label: "Swiss",
    blurb: "European corporate · Helvetica · hairlines · red rule",
    swatches: ["#fbfaf6", "#cb1f1f", "#0e0e0e"],
    features: {
      showHero: true,
      showFooter: true,
      emojiTabs: false,
      numberedTabs: true,
      brandMark: "swiss",
      heroStyle: "display",
    },
  },
  edtech: {
    id: "edtech",
    label: "Edtech",
    blurb: "Warm classroom · DM Sans · cream + coral + mint · rounded",
    swatches: ["#fbf2e6", "#e08660", "#7cc7a8"],
    features: {
      showHero: true,
      showFooter: false,
      emojiTabs: true,
      numberedTabs: false,
      brandMark: "gradient",
      heroStyle: "friendly",
    },
  },
};

export const FLAVOR_LIST = Object.values(FLAVORS);
export const DEFAULT_FLAVOR: FlavorId = "terminal";
export const FLAVOR_STORAGE_KEY = "formulahelper:flavor:v1";

export function isFlavor(v: unknown): v is FlavorId {
  return v === "terminal" || v === "swiss" || v === "edtech";
}
