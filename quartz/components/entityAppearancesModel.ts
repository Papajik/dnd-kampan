import { QuartzPluginData } from "../plugins/vfile"
import { FilePath, FullSlug, simplifySlug, slugifyFilePath } from "../util/path"
import { getJourneyDays } from "./campaignJourneyModel"

export function isEntityPage(file: QuartzPluginData): boolean {
  return (
    /^(npc|bestiar|lokace|predmety|postavy|ukoly|svet)\//.test(file.slug ?? "") &&
    !/(^|\/)index$/.test(file.slug ?? "") &&
    !(file.slug ?? "").endsWith("/")
  )
}

export function getEntityAppearances(
  allFiles: QuartzPluginData[],
  target: QuartzPluginData,
  currentSlug: FullSlug,
) {
  if (!target.slug) return []
  const targets = new Set([simplifySlug(target.slug)])
  for (const alias of target.aliases ?? []) targets.add(simplifySlug(alias))
  for (const alias of target.frontmatter?.aliases ?? []) {
    targets.add(simplifySlug(slugifyFilePath(`${alias}.md` as FilePath)))
  }
  const linked = new Set(
    allFiles
      .filter((file) => file.links?.some((link) => targets.has(link)))
      .map((file) => file.slug),
  )
  return getJourneyDays(allFiles, currentSlug).filter((day) => linked.has(day.slug))
}
