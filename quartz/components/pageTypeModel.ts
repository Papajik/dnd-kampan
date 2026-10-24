export const pageTypes = {
  denik: "Deník",
  postavy: "Družina",
  npc: "NPC",
  bestiar: "Bestiář",
  lokace: "Lokace",
  predmety: "Předměty",
  ukoly: "Úkoly",
  svet: "Svět",
  other: "Ostatní",
} as const
export type PageType = keyof typeof pageTypes
export function getPageType(slug: string): PageType {
  const prefix = slug.split("/")[0]
  return slug.includes("/") && prefix !== "other" && Object.hasOwn(pageTypes, prefix)
    ? (prefix as PageType)
    : "other"
}
