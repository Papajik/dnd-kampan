import assert from "node:assert"
import { describe, test } from "node:test"
import { checkContent, ContentFile, extractWikilinks } from "./contentCheck"

const messages = (files: ContentFile[]) => checkContent(files).map((issue) => issue.message)

describe("content check", () => {
  test("extracts link targets without aliases, anchors and code", () => {
    assert.deepStrictEqual(
      extractWikilinks(
        "[[Treja|Treji]] ![[istril.png|240]] [[7. den#Ráno]] `[[ignored]]` [[A\\|b]]",
      ),
      ["Treja", "istril.png", "7. den", "A"],
    )
  })

  test("reports frontmatter that does not start on the first line", () => {
    const result = messages([{ path: "denik/5. den.md", text: "\n---\ntitle: 5. den\n---\n" }])
    assert.ok(result.some((message) => message.includes("prvním řádku")))
  })

  test("resolves links by name, path, relative path and alias", () => {
    const files: ContentFile[] = [
      { path: "npc/Treja.md", text: "---\ntitle: Treja\ntyp: npc\n---\n[[Rosa]] [[splnene/X]]" },
      {
        path: "postavy/Rose.md",
        text: "---\ntitle: Rose\ntyp: postava\naliases:\n  - Rosa\n---\n",
      },
      { path: "ukoly/index.md", text: "[[splnene/X|X]] [[npc/Treja]] [[Chybí]]" },
      { path: "ukoly/splnene/X.md", text: "---\ntitle: X\ntyp: úkol\nstav: splněný\n---\n" },
    ]
    const broken = messages(files).filter((message) => message.startsWith("nefunkční"))
    assert.deepStrictEqual(broken, ["nefunkční odkaz [[splnene/X]]", "nefunkční odkaz [[Chybí]]"])
  })

  test("checks quest state against folder and index section", () => {
    const result = messages([
      { path: "ukoly/index.md", text: "## Aktivní\n\n- [[B]]\n\n## Splněné\n\n- [[A]]\n" },
      { path: "ukoly/A.md", text: "---\ntitle: A\ntyp: úkol\nstav: aktivní\n---\n" },
      { path: "ukoly/B.md", text: "---\ntitle: B\ntyp: úkol\nstav: splněný\n---\n" },
    ])
    assert.ok(result.includes("aktivní úkol [[A]] není v sekci „Aktivní“"))
    assert.ok(result.includes("úkol se stavem „splněný“ patří do `ukoly/splnene/`"))
  })

  test("requires journey metadata for diary days", () => {
    const result = messages([
      { path: "denik/1. den.md", text: "---\ntitle: 1. den\ntyp: den\n---\n" },
    ])
    assert.ok(result.includes("chybí `journey.summary` pro časovou osu na mapě cesty"))
  })
})
