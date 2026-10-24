import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"
import type { QuartzPluginData } from "../plugins/vfile"
import { FilePath, FullSlug, resolveRelative, simplifySlug, slugifyFilePath } from "../util/path"
import { isEntityPage } from "./entityAppearancesModel"
import { getPageType, pageTypes } from "./pageTypeModel"

export function firstImage(tree: Root | undefined): string | undefined {
  let src: string | undefined
  if (tree)
    visit(tree, "element", (node: Element) => {
      if (!src && node.tagName === "img" && typeof node.properties.src === "string")
        src = node.properties.src
    })
  return src
}

export function getDayCast(allFiles: QuartzPluginData[], day: QuartzPluginData) {
  if (!day.slug || !/^denik\/\d+\.-den$/.test(day.slug)) return []
  const links = new Set(day.links ?? [])
  const entities = allFiles.filter((file) => {
    if (!file.slug || !isEntityPage(file)) return false
    const aliases = [
      file.slug,
      ...(file.aliases ?? []),
      ...(file.frontmatter?.aliases ?? []).map((alias) =>
        slugifyFilePath(`${alias}.md` as FilePath),
      ),
    ]
    return aliases.some((slug) => links.has(simplifySlug(slug)))
  })
  return (["postavy", "npc", "bestiar", "lokace", "predmety", "ukoly", "svet"] as const)
    .map((type) => ({
      type,
      label: pageTypes[type],
      entries: entities
        .filter((file) => getPageType(file.slug!) === type)
        .map((file) => {
          const src = firstImage(file.htmlAst)
          const title = file.frontmatter?.title ?? file.slug!.split("/").at(-1)!
          const base = new URL(file.slug!, "https://quartz.invalid/")
          const imageUrl = src ? new URL(src, base) : undefined
          const portrait =
            imageUrl && imageUrl.origin === base.origin
              ? resolveRelative(day.slug!, imageUrl.pathname.slice(1) as FullSlug) +
                imageUrl.search +
                imageUrl.hash
              : src
          return { slug: file.slug!, title, href: resolveRelative(day.slug!, file.slug!), portrait }
        })
        .sort((a, b) => a.title.localeCompare(b.title, "cs")),
    }))
    .filter((group) => group.entries.length > 0)
}
