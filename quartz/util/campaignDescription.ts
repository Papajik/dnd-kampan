import type { Element, Root } from "hast"
import { toString } from "hast-util-to-string"
import { getPageType } from "../components/pageTypeModel"

export function shorten(text: string, limit = 140): string {
  text = text.replace(/\s+/g, " ").trim()
  if (text.length <= limit) return text
  const prefix = text.slice(0, limit)
  const boundary = prefix.lastIndexOf(" ")
  return prefix.slice(0, boundary > 0 ? boundary : limit).trimEnd() + "…"
}

export function pageIntro(tree: Root): string | undefined {
  for (const node of tree.children) {
    if (node.type !== "element" || node.tagName !== "p") continue
    const text = toString(node).replace(/\s+/g, " ").trim()
    if (text) return text
  }
}

export function statusText(node: Element): string {
  const parts: string[] = []
  const collect = (element: Element) => {
    const classes = element.properties.className
    if (Array.isArray(classes) && classes.includes("callout-title")) return
    if (element.tagName === "p") parts.push(toString(element))
    else for (const child of element.children) if (child.type === "element") collect(child)
  }
  collect(node)
  return parts.join(" ").replace(/\s+/g, " ").trim()
}

export const known = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "" && !/^(—|-|Neznám[éýá]?)$/i.test(value.trim())

const profileKeys: Record<string, string[]> = {
  npc: ["Povolání / role", "Působí", "Organizace"],
  postavy: ["Rasa", "Povolání", "Původ"],
  bestiar: ["Druh", "Výskyt", "První setkání"],
}

function findTable(node: Root | Element): Element | undefined {
  for (const child of node.children) {
    if (child.type !== "element") continue
    if (child.tagName === "table") return child
    if (child.tagName === "div") {
      const table = findTable(child)
      if (table) return table
    }
  }
}

/** Short "role · place" line from the profile table, for pages without an intro paragraph. */
export function profileSummary(slug: string, tree: Root): string | undefined {
  const keys = profileKeys[getPageType(slug)]
  const table = keys && findTable(tree)
  if (!table) return undefined
  const rows = new Map<string, string>()
  const visit = (node: Element) => {
    if (node.tagName === "tr") {
      const cells = node.children.filter(
        (cell): cell is Element => cell.type === "element" && cell.tagName === "td",
      )
      if (cells.length >= 2)
        rows.set(toString(cells[0]).trim(), toString(cells[1]).replace(/\s+/g, " ").trim())
      return
    }
    for (const child of node.children) if (child.type === "element") visit(child)
  }
  visit(table)
  const labelled = getPageType(slug) === "bestiar"
  const values = keys
    .filter((key) => known(rows.get(key)))
    .map((key) => (labelled ? `${key}: ${rows.get(key)}` : rows.get(key)!))
  return values.length ? values.join(" · ") : undefined
}

export function campaignDescription(
  slug: string,
  frontmatter: Record<string, unknown> | undefined,
  tree: Root,
): string | undefined {
  const type = getPageType(slug)
  const journey = frontmatter?.journey as { summary?: unknown; location?: unknown } | undefined
  if (type === "denik" && typeof journey?.summary === "string") {
    const location = typeof journey.location === "string" ? journey.location.trim() : ""
    return journey.summary.trim() + (location ? ` Místo: ${location.replace(/[.!?]+$/, "")}.` : "")
  }
  if (!["npc", "postavy", "bestiar", "lokace", "predmety", "ukoly"].includes(type)) return undefined
  if (type === "ukoly") {
    const first = tree.children.find((node) => node.type === "element")
    if (
      first?.type === "element" &&
      ["todo", "success"].includes(
        String(first.properties.dataCallout ?? first.properties["data-callout"]),
      )
    ) {
      const status = statusText(first)
      if (status) return shorten(status, 300)
    }
  }
  const intro = pageIntro(tree)
  if (intro) return shorten(intro, 300)
  const profile = profileSummary(slug, tree)
  if (!profile) return undefined
  const status = [frontmatter?.stav, frontmatter?.vztah].filter(known)
  return status.length
    ? `${profile}. ${status.map((value, i) => (i ? value.toLocaleLowerCase("cs") : value)).join(", ")}.`
    : `${profile}.`
}
