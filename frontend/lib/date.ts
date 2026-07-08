export function fmtDate(iso: string | null, lang: "tr" | "en"): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
