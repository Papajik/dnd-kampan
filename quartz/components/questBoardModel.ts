import type { Element, Root } from "hast"
import { toString } from "hast-util-to-string"
import type { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, resolveRelative } from "../util/path"
import { known, pageIntro, shorten, statusText } from "../util/campaignDescription"
import { firstImage } from "./dayCastModel"
import { isEntityPage } from "./entityAppearancesModel"
import { getQuestTimeline } from "./questTimelineModel"

function elements(node: Root | Element): Element[] {
  return node.children.flatMap((child) =>
    child.type === "element" ? [child, ...elements(child)] : [],
  )
}

function linkedSlug(source: FullSlug, href: string): string | undefined {
  const url = new URL(href, `https://quartz.invalid/${source}`)
  return url.origin === "https://quartz.invalid"
    ? decodeURI(url.pathname.slice(1)).replace(/\.html$/, "")
    : undefined
}

export const questLabels: Record<string, string> = {
  aktivní: "Aktivní",
  pozastavený: "Pozastaveno",
  splněný: "Splněno",
  neúspěšný: "Neúspěch",
  "slepá stopa": "Slepá stopa",
}

export function getQuestBoard(allFiles: QuartzPluginData[]) {
  const current = "ukoly/index" as FullSlug
  const mentions = new Map(
    getQuestTimeline(allFiles, current).quests.map((quest) => [quest.file.slug, quest.mentions]),
  )
  const cards = allFiles
    .filter(
      (file) =>
        file.frontmatter?.typ === "úkol" && file.slug?.startsWith("ukoly/") && isEntityPage(file),
    )
    .map((file) => {
      const tree = file.htmlAst ?? ({ type: "root", children: [] } as Root)
      const nodes = elements(tree)
      const calloutType = (node: Element) =>
        String(node.properties.dataCallout ?? node.properties["data-callout"] ?? "")
      const callout = nodes.find((node) =>
        ["todo", "success", "warning", "failure"].includes(calloutType(node)),
      )
      const summary = shorten((callout && statusText(callout)) || pageIntro(tree) || "", 160)
      const overview = new Map<string, Element>()
      let inOverview = false
      for (const node of tree.children) {
        if (node.type !== "element") continue
        if (/^h[12]$/.test(node.tagName)) inOverview = toString(node).trim() === "Přehled"
        if (!inOverview) continue
        for (const row of [node, ...elements(node)].filter((item) => item.tagName === "tr")) {
          const cells = row.children.filter(
            (child): child is Element => child.type === "element" && child.tagName === "td",
          )
          if (cells.length >= 2) overview.set(toString(cells[0]).trim(), cells[1])
        }
      }
      const fields = ["Zadavatel", "Odměna", "Priorita", "Cíl výpravy"].flatMap((label) => {
        const cell = overview.get(label)
        const value = cell && toString(cell).replace(/\s+/g, " ").trim()
        if (!known(value)) return []
        const npc =
          label === "Zadavatel" && cell
            ? elements(cell)
                .filter((node) => node.tagName === "a")
                .map((link) =>
                  allFiles.find(
                    (candidate) =>
                      candidate.frontmatter?.typ === "npc" &&
                      candidate.slug === linkedSlug(file.slug!, String(link.properties.href)),
                  ),
                )
                .find((candidate) => candidate && firstImage(candidate.htmlAst))
            : undefined
        const src = npc ? firstImage(npc.htmlAst) : undefined
        const image =
          src && npc?.slug ? new URL(src, `https://quartz.invalid/${npc.slug}`) : undefined
        const portrait = image
          ? image.origin === "https://quartz.invalid"
            ? resolveRelative(current, image.pathname.slice(1) as FullSlug) +
              image.search +
              image.hash
            : image.href
          : undefined
        return [{ label, value, portrait }]
      })
      const days = mentions.get(file.slug) ?? []
      const state = String(file.frontmatter?.stav ?? "")
      const success = nodes.find((node) => calloutType(node) === "success")
      const finishedLink =
        success &&
        elements(success)
          .filter((node) => node.tagName === "a")
          .map((node) => linkedSlug(file.slug!, String(node.properties.href)))
          .find((slug) => /^denik\/\d+\.-den$/.test(slug ?? ""))
      const closed = state === "splněný" || state === "neúspěšný"
      const finished = closed
        ? finishedLink
          ? Number(finishedLink.match(/\/(\d+)/)![1])
          : days.at(-1)
        : undefined
      const hash = [...file.slug!].reduce((value, char) => (value * 31 + char.charCodeAt(0)) | 0, 0)
      return {
        slug: file.slug!,
        href: resolveRelative(current, file.slug!),
        title: (file.frontmatter?.title ?? "").replace(/\s*\((splněno|uzavřeno)\)\s*$/i, ""),
        summary,
        fields,
        state,
        label: questLabels[state] ?? state,
        given: days[0],
        finished,
        main: fields.some((field) => field.label === "Priorita" && field.value === "Hlavní"),
        rotation: (((hash >>> 0) % 9) - 4) * 0.2,
      }
    })
  return [
    { id: "active", title: "Aktivní", states: ["aktivní"] },
    { id: "paused", title: "Pozastavené", states: ["pozastavený"] },
    { id: "finished", title: "Splněné", states: ["splněný"] },
    { id: "other", title: "Vedlejší a slepé stopy", states: ["slepá stopa", "neúspěšný"] },
  ].map((group) => ({
    ...group,
    cards: cards
      .filter((card) => group.states.includes(card.state))
      .sort(
        (a, b) =>
          (group.id === "active" ? Number(b.main) - Number(a.main) : 0) ||
          ((group.id === "finished" ? b.finished : b.given) ?? -1) -
            ((group.id === "finished" ? a.finished : a.given) ?? -1) ||
          a.title.localeCompare(b.title, "cs"),
      ),
  }))
}
