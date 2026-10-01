// Store-wide contact configuration.
// Set NEXT_PUBLIC_WHATSAPP_NUMBER / NEXT_PUBLIC_SMS_NUMBER in .env to your real numbers.
// Fallbacks keep working even if .env is reset by the platform.
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "972523196162";
export const SMS_NUMBER =
  process.env.NEXT_PUBLIC_SMS_NUMBER || "+972523196162";

export const STORE_NAME_HE = "דן ידי זהב";
export const STORE_NAME_EN = "DAN GOLD HANDS";

export function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function smsLink(text: string) {
  // `?&body=` works across iOS and Android
  return `sms:${SMS_NUMBER}?&body=${encodeURIComponent(text)}`;
}

export function prettyWhatsApp() {
  // 9725XXXXXXXX -> 05X-XXX-XXXX (best-effort for Israeli numbers)
  const n = WHATSAPP_NUMBER.replace(/\D/g, "");
  if (n.startsWith("972") && n.length >= 11) {
    const local = "0" + n.slice(3);
    return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return "+" + n;
}

export type CartShape = {
  id: number;
  name: string;
  kind: string;
  price: number;
  image: string;
  qty: number;
};

export function buildOrderMessage(opts: {
  name: string;
  phone?: string;
  note?: string;
  items: CartShape[];
  total: number;
  orderId?: number;
}) {
  const lines = [
    `הזמנה חדשה מאתר ${STORE_NAME_HE}${opts.orderId ? ` (#${opts.orderId})` : ""}`,
    "שלום דן, אשמח להזמין:",
    ...opts.items.map(
      (i) =>
        `- ${i.name}${i.kind === "box" ? " (בוקס אטום)" : " (חבילה)"} x${i.qty} — ₪${(
          i.price * i.qty
        ).toLocaleString("he-IL")}`,
    ),
    `סה״כ לתשלום: ₪${opts.total.toLocaleString("he-IL")}`,
    `שם: ${opts.name}`,
  ];
  if (opts.phone) lines.push(`טלפון לחזרה: ${opts.phone}`);
  if (opts.note) lines.push(`הערות: ${opts.note}`);
  return lines.join("\n");
}

export function buildBidMessage(opts: { title: string; amount: number; name: string }) {
  return [
    `הצעה להערצה באתר ${STORE_NAME_HE}`,
    `פריט: ${opts.title}`,
    `ההצעה שלי: ₪${opts.amount.toLocaleString("he-IL")}`,
    `שם: ${opts.name}`,
  ].join("\n");
}
