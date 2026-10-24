import type { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, simplifySlug } from "../util/path"
import { getJourneyDays } from "./campaignJourneyModel"
import { getEntityAppearances, isEntityPage } from "./entityAppearancesModel"

export const questStates = [
  "aktivní",
  "pozastavený",
  "splněný",
  "neúspěšný",
  "slepá stopa",
] as const

export function getQuestTimeline(files: QuartzPluginData[], slug: FullSlug) {
  const days = getJourneyDays(files, slug)
  const quests = files
    .filter(
      (file) =>
        file.frontmatter?.typ === "úkol" && file.slug?.startsWith("ukoly/") && isEntityPage(file),
    )
    .map((file) => {
      const mentions = new Set(getEntityAppearances(files, file, slug).map((day) => day.day))
      for (const day of days) {
        if (file.links?.includes(simplifySlug(day.slug))) mentions.add(day.day)
      }
      const knownDays = [...mentions].sort((a, b) => a - b)
      return {
        file,
        state: String(file.frontmatter?.stav ?? "neznámý"),
        mentions: knownDays,
        first: knownDays.at(0),
        last: knownDays.at(-1),
      }
    })
    .sort(
      (a, b) =>
        Number(b.state === "aktivní") - Number(a.state === "aktivní") ||
        (a.first ?? Infinity) - (b.first ?? Infinity) ||
        (a.file.frontmatter?.title ?? "").localeCompare(b.file.frontmatter?.title ?? "", "cs"),
    )
  return { days, quests }
}
