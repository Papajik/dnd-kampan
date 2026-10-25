import type { QuartzPluginData } from "../plugins/vfile"
import { getPageType, pageTypes } from "./pageTypeModel"

export function getRecentChanges(files: QuartzPluginData[], limit = 8) {
  return files
    .flatMap((file) => {
      const slug = file.slug ?? ""
      const modified = file.dates?.modified
      if (
        !slug ||
        slug === "index" ||
        slug === "statistiky" ||
        /(^|\/)index$/.test(slug) ||
        /^(map|tags)\//.test(slug) ||
        slug.endsWith("/") ||
        !modified ||
        !Number.isFinite(modified.getTime())
      )
        return []
      return [
        {
          file,
          date: modified,
          label: pageTypes[getPageType(slug)],
        },
      ]
    })
    .sort(
      (a, b) =>
        b.date.getTime() - a.date.getTime() ||
        (a.file.slug ?? "").localeCompare(b.file.slug ?? "", "cs"),
    )
    .slice(0, limit)
}

export function formatChangeDate(date: Date): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: "Europe/Prague",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date)
}
