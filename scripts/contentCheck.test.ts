import assert from "node:assert"
import { describe, test } from "node:test"
import { npcRelations, npcStates } from "../quartz/components/npcStatusModel"
import { checkContent, ContentFile, extractWikilinks } from "./contentCheck"

const messages = (files: ContentFile[]) =>
  checkContent(files)
    .filter((issue) => !issue.message.startsWith("na stránku neodkazuje"))
    .map((issue) => issue.message)

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

describe("NPC frontmatter", () => {
  test("requires both fields and rejects unsupported values", () => {
    for (const fields of ["", "stav: Ztracený\nvztah: Přítel\n"]) {
      const result = messages([
        { path: "npc/A.md", text: `---\ntitle: A\ntyp: npc\n${fields}---\n` },
      ])
      assert.ok(result.some((message) => message.startsWith("`stav` NPC")))
      assert.ok(result.some((message) => message.startsWith("`vztah` NPC")))
    }
  })

  test("accepts every allowed gendered variant", () => {
    const states = Object.keys(npcStates)
    const relations = Object.keys(npcRelations)
    for (const stav of states) {
      for (const vztah of relations) {
        assert.deepStrictEqual(
          messages([
            {
              path: "npc/A.md",
              text: `---\ntitle: A\ntyp: npc\nstav: ${stav}\nvztah: ${vztah}\n---\n`,
            },
          ]),
          [],
        )
      }
    }
  })

  test("does not require NPC fields for other entities or folder indexes", () => {
    assert.deepStrictEqual(
      messages([
        { path: "npc/index.md", text: "---\ntitle: NPC\n---\n" },
        { path: "lokace/A.md", text: "---\ntitle: A\ntyp: lokace\n---\n" },
      ]),
      [],
    )
  })
})

const entity = (name: string, extra = "", folder = "npc"): ContentFile => ({
  path: `${folder}/${name}.md`,
  text: `---\ntitle: ${name}\ntyp: npc\nstav: Živý\nvztah: Spojenec\n${extra}---\n`,
})
const diary = (text: string): ContentFile => ({
  path: "denik/7. den.md",
  text: `---\ntitle: Henry\ntyp: den\n---\n${text}`,
})
const linkWarnings = (files: ContentFile[]) =>
  checkContent(files).filter(
    (i) =>
      i.level === "warning" &&
      (i.message.startsWith("zmiňuje") || i.message.startsWith("na stránku")),
  )

describe("link warnings", () => {
  test("warns once per day and entity, with exact case and Unicode word boundaries", () => {
    const result = linkWarnings([
      entity("Henry", "aliases: [Jindřich]\n"),
      diary("Henry Henry Jindřich henry předHenry Henryho"),
    ])
    assert.equal(result.filter((i) => i.message.startsWith("zmiňuje")).length, 1)
    assert.equal(
      linkWarnings([entity("Henry"), diary("henry předHenry Henryho")]).filter((i) =>
        i.message.startsWith("zmiňuje"),
      ).length,
      0,
    )
  })
  test("ignores links, frontmatter, code, comments and URLs", () => {
    const text =
      "[[Henry]] ![[Henry]] `Henry` ``Henry``\n~~~txt\nHenry\n~~~\n```txt\nHenry\n```\n<!-- Henry --> https://example.cz/Henry"
    assert.deepEqual(linkWarnings([entity("Henry"), diary(text)]), [])
    assert.equal(
      linkWarnings([entity("Henry"), diary("`[[Henry]]` <!-- [[Henry]] --> Henry")]).length,
      2,
    )
  })
  test("longer entity names win, short aliases are ignored", () => {
    const result = linkWarnings([
      entity("Bratr Ash"),
      entity("Ash"),
      entity("Paní", "aliases: [Ash]\n"),
      diary("Bratr Ash"),
    ])
    assert.deepEqual(
      result.filter((i) => i.message.startsWith("zmiňuje")).map((i) => i.message),
      ["zmiňuje „Bratr Ash“ bez odkazu"],
    )
  })
  test("a link anywhere suppresses mentions, including aliases and Markdown relative paths", () => {
    for (const link of [
      "[[Henry]]",
      "[[npc/Henry|pán]]",
      "[[Jindřich]]",
      "[pán](../npc/Henry.md)",
      "[pán][npc]\n\n[npc]: ../npc/Henry.md",
    ]) {
      assert.deepEqual(
        linkWarnings([entity("Henry", "aliases: [Jindřich]\n"), diary(`Henry ${link}`)]),
        [],
      )
    }
  })
  test("orphans exclude self and own index but accept other pages", () => {
    const npc = entity("Henry")
    npc.text += "[[Henry]]"
    const index = { path: "npc/index.md", text: "[[Henry]]" }
    assert.equal(linkWarnings([npc, index]).length, 1)
    assert.equal(
      linkWarnings([npc, { path: "index.md", text: "[unused]: npc/Henry.md" }]).length,
      1,
    )
    assert.deepEqual(linkWarnings([npc, index, { path: "index.md", text: "[[Henry]]" }]), [])
  })
})
