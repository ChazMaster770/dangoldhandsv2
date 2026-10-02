export const PRODUCT_KINDS = [
  { value: "case", label: "מארז" },
  { value: "booster-box", label: "בוסטר בוקס" },
  { value: "etb", label: "איטיבי" },
  { value: "booster-bundle", label: "בוסטר באנדל" },
  { value: "blister", label: "בליסטר" },
  { value: "pack", label: "חפיסה" },
] as const;

export type ProductKind = (typeof PRODUCT_KINDS)[number]["value"];

export const KIND_VALUES: string[] = PRODUCT_KINDS.map((k) => k.value);

export const KIND_LABELS: Record<string, string> = Object.fromEntries(
  PRODUCT_KINDS.map((k) => [k.value, k.label]),
);
