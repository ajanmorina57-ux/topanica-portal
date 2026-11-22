export const CATEGORIES = ["topanice", "komuna", "zhvillim", "mergata"] as const;
export const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  topanice: "Topanicë", zhvillim: "Zhvillim", komuna: "Komuna", mergata: "Mërgata",
};
export const GALLERY_CATEGORIES = ["arkiv", "natyre", "fshati"] as const;
export const GALLERY_LABELS: Record<(typeof GALLERY_CATEGORIES)[number], string> = {
  arkiv: "Arkiv", natyre: "Natyrë", fshati: "Fshati",
};
export function formatDate(value: string | Date | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("sq-XK", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}
export function slugify(value: string) {
  return value.toLocaleLowerCase("sq-XK").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ë/g, "e").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}
