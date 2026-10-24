import type { QuartzPluginData } from "../plugins/vfile"
import { FilePath, FullSlug, resolveRelative, slugifyFilePath } from "../util/path"
import { isEntityPage } from "./entityAppearancesModel"
import { getPageType } from "./pageTypeModel"

export function vazbySection(markdown: string): string {
  return markdown.match(/^## Vazby\s*\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1] ?? ""
}

export function wikiTargets(text: string): string[] {
  return [...text.matchAll(/(?<!!)\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)].map((m) => m[1])
}

export function mermaidLabel(text: string): string {
  return text
    .replace(/&/g, "#38;")
    .replace(/"/g, "#34;")
    .replace(/</g, "#60;")
    .replace(/>/g, "#62;")
    .replace(/\[/g, "#91;")
    .replace(/\]/g, "#93;")
    .replace(/[\r\n]/g, " ")
    .replace(/`/g, "#96;")
}

export function getRelationships(files: QuartzPluginData[], slug: FullSlug) {
  const entities = files.filter((file) => isEntityPage(file) && file.slug !== slug)
  const names = new Map<string, QuartzPluginData[]>()
  for (const file of entities) {
    const keys = [
      file.slug!,
      file.slug!.split("/").at(-1)!,
      file.frontmatter?.title ?? "",
      ...(file.frontmatter?.aliases ?? []),
      ...(file.aliases ?? []),
    ]
    for (const key of new Set(keys.map((key) => slugifyFilePath(`${key}.md` as FilePath)))) {
      names.set(key, [...(names.get(key) ?? []), file])
    }
  }
  const resolve = (target: string) => {
    const key = slugifyFilePath(`${target.trim()}.md` as FilePath)
    const exact = entities.find((file) => file.slug === key)
    const matches = names.get(key)
    return exact ?? (matches?.length === 1 ? matches[0] : undefined)
  }
  const edges = new Map<string, { source: FullSlug; target: FullSlug; descriptions: string[] }>()
  const sources = entities.filter((file) =>
    ["npc", "postava", "frakce", "božstvo"].includes(String(file.frontmatter?.typ)),
  )
  for (const file of sources) {
    for (const line of vazbySection(file.rawMarkdown ?? "").split(/\r?\n/)) {
      const bullet = line.match(/^\s*[-*+]\s+(.+?):\s*(.+)$/)
      if (!bullet) continue
      const description = bullet[2]
        .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
        .replace(/\[\[([^\]]+)\]\]/g, "$1")
        .replace(/[*_]/g, "")
      for (const target of wikiTargets(bullet[1])) {
        const other = resolve(target)
        if (!other?.slug || other.slug === file.slug) continue
        const key = [file.slug!, other.slug].sort().join("\0")
        const edge = edges.get(key) ?? { source: file.slug!, target: other.slug, descriptions: [] }
        const detail = `${file.frontmatter?.title}: ${description}`
        if (!edge.descriptions.includes(detail)) edge.descriptions.push(detail)
        edges.set(key, edge)
      }
    }
  }
  const factions = entities.filter(
    (file) => file.frontmatter?.typ === "frakce" && file.slug?.startsWith("svet/frakce/"),
  )
  const nodes = entities
    .filter((file) =>
      [...edges.values()].some((edge) => edge.source === file.slug || edge.target === file.slug),
    )
    .map((file, index) => {
      const body = file.rawMarkdown ?? ""
      const table = body
        .split(/\r?\n/)
        .filter((line) => /^\s*\|/.test(line))
        .join("\n")
      const links = wikiTargets(table + "\n" + vazbySection(body)).map(resolve)
      const faction =
        file.frontmatter?.typ === "npc" ? factions.find((f) => links.includes(f)) : undefined
      return {
        file,
        id: `n${index}`,
        group:
          getPageType(file.slug!) === "postavy"
            ? "Družina"
            : (faction?.frontmatter?.title ??
              (file.frontmatter?.typ === "frakce" ? file.frontmatter.title : undefined)),
      }
    })
  const allEdges = [...edges.values()]
  const groups = [
    ...new Set(nodes.map((node) => node.group).filter((g): g is string => Boolean(g))),
  ]
  const covered = new Set<(typeof allEdges)[number]>()
  const sections = groups.map((title) => {
    const members = new Set(
      nodes.filter((node) => node.group === title).map((node) => node.file.slug),
    )
    const selected = allEdges.filter(
      (edge) => !covered.has(edge) && (members.has(edge.source) || members.has(edge.target)),
    )
    selected.forEach((edge) => covered.add(edge))
    return { title, edges: selected }
  })
  sections.push({ title: "Další vazby", edges: allEdges.filter((edge) => !covered.has(edge)) })
  const diagrams = sections
    .filter((section) => section.edges.length > 0)
    .flatMap((section) => {
      const parts = []
      for (let offset = 0; offset < section.edges.length; offset += 10) {
        const selected = section.edges.slice(offset, offset + 10)
        const selectedNodes = nodes.filter((node) =>
          selected.some((edge) => edge.source === node.file.slug || edge.target === node.file.slug),
        )
        const lines = [
          `%%{init: {"themeVariables": {"fontFamily": "Alegreya, serif"}}}%%`,
          section.title === "Další vazby" ? "flowchart LR" : "flowchart TB",
        ]
        const addNode = (node: (typeof nodes)[number]) =>
          lines.push(
            `${node.id}["${mermaidLabel(node.file.frontmatter?.title ?? node.file.slug!)}"]:::type-${getPageType(node.file.slug!)}`,
          )
        for (const group of new Set(selectedNodes.map((node) => node.group))) {
          if (group) lines.push(`subgraph g${lines.length}["${mermaidLabel(group)}"]`)
          selectedNodes.filter((node) => node.group === group).forEach(addNode)
          if (group) lines.push("end")
        }
        for (const edge of selected) {
          const source = selectedNodes.find((node) => node.file.slug === edge.source)!
          const target = selectedNodes.find((node) => node.file.slug === edge.target)!
          const text = edge.descriptions[0].split(": ").slice(1).join(": ")
          const words = text.split(/\s+/)
          lines.push(
            `${source.id} ---|"${mermaidLabel(words.slice(0, 5).join(" ") + (words.length > 5 ? "…" : ""))}"| ${target.id}`,
          )
        }
        for (const node of selectedNodes)
          lines.push(
            `click ${node.id} "${mermaidLabel(resolveRelative(slug, node.file.slug!))}" "${mermaidLabel(node.file.frontmatter?.title ?? "Otevřít stránku")}"`,
          )
        parts.push({
          title: section.title + (section.edges.length > 10 ? ` · ${offset / 10 + 1}` : ""),
          nodes: selectedNodes,
          edges: selected,
          source: lines.join("\n"),
        })
      }
      return parts
    })
  return { nodes, edges: allEdges, diagrams }
}
