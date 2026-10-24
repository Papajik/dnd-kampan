import assert from "node:assert/strict"
import { test } from "node:test"
import type { QuartzPluginData } from "../plugins/vfile"
import type { FullSlug } from "../util/path"
import { getRelationships, mermaidLabel, vazbySection } from "./relationshipModel"

const file = (
  slug: string,
  title: string,
  typ: string,
  rawMarkdown: string,
  aliases: string[] = [],
) =>
  ({
    slug: slug as FullSlug,
    frontmatter: { title, typ, tags: [], aliases },
    rawMarkdown,
  }) as QuartzPluginData

test("Vazby parser stops at next section and handles a final section", () => {
  assert.equal(
    vazbySection("## Vazby\n- [[A]]: zná.\n## Poznámky\n- [[B]]: nepatří."),
    "- [[A]]: zná.\n",
  )
  assert.equal(vazbySection("## Vazby\n- [[A]]: zná."), "- [[A]]: zná.")
  assert.equal(vazbySection("## Jiné\n- [[A]]: zná."), "")
})

test("relationships resolve aliases and compound bullets, merge mirrored pairs and cluster only table or Vazby associations", () => {
  const files = [
    file(
      "npc/A",
      "A",
      "npc",
      "| Organizace | [[Frakce]] |\n## Vazby\n- [[Béčko]] (a [[C]]): zná je.\n## Poznámky\n- [[D]]: ignorovat.",
    ),
    file("postavy/B", "B", "postava", "## Vazby\n- [[A]]: důvěřuje jí.", ["Béčko"]),
    file("npc/C", "C", "npc", ""),
    file("npc/D", "D", "npc", ""),
    file("svet/frakce/F", "Frakce", "frakce", ""),
  ]
  const model = getRelationships(files, "svet/vztahy" as FullSlug)
  assert.equal(model.edges.length, 2)
  assert.equal(model.edges[0].descriptions.length, 2)
  assert.equal(model.nodes.find((node) => node.file.slug === "npc/A")?.group, "Frakce")
  assert.equal(model.nodes.find((node) => node.file.slug === "postavy/B")?.group, "Družina")
  assert.ok(!model.nodes.some((node) => node.file.slug === "npc/D"))
  assert.ok(model.diagrams.every((d) => d.source.includes("click ") && d.edges.length <= 10))
  assert.deepEqual(getRelationships([], "svet/vztahy" as FullSlug).diagrams, [])
})

test("Mermaid labels escape control characters, quotes, brackets and HTML", () => {
  assert.equal(mermaidLabel('A [B] "C" <x> & `\n'), "A #91;B#93; #34;C#34; #60;x#62; #38; #96; ")
})
