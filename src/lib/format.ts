export function ils(n: number) {
  return `₪${n.toLocaleString("he-IL")}`;
}

export function formatDate(d: string | Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

import { KIND_LABELS } from "./kinds";

export function kindLabel(kind: string) {
  return KIND_LABELS[kind] ?? "חפיסה";
}

export function orderStatusLabel(s: string) {
  switch (s) {
    case "confirmed":
      return "אושרה";
    case "shipped":
      return "נשלחה";
    case "done":
      return "הושלמה";
    default:
      return "חדשה";
  }
}
