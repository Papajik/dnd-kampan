import assert from "node:assert/strict"
import { test } from "node:test"
import type { Element, Root, ElementContent } from "hast"
import type { QuartzPluginData } from "../plugins/vfile"
import type { FullSlug } from "../util/path"
import { getQuestBoard } from "./questBoardModel"

const el = (
  tagName: string,
  children: (ElementContent | string)[] = [],
  properties = {},
): Element => ({
  type: "element",
  tagName,
  properties,
  children: children.map((child) =>
    typeof child === "string" ? { type: "text", value: child } : child,
  ),
})
const file = (slug: string, state = "aktivní", children: Element[] = []) =>
  ({
    slug: slug as FullSlug,
    frontmatter: { title: slug.split("/").at(-1)!, typ: "úkol", stav: state, tags: [] },
    htmlAst: { type: "root", children } as Root,
  }) as QuartzPluginData
const day = (n: number, links: string[]) =>
  ({
    slug: `denik/${n}.-den`,
    filePath: `content/denik/${n}. den.md`,
    links,
  }) as QuartzPluginData
const callout = (type: string, text: Element) =>
  el("blockquote", [el("div", ["Nadpis"], { className: ["callout-title"] }), text], {
    dataCallout: type,
  })
const table = (rows: [string, Element | string][]) => [
  el("h2", ["Přehled"]),
  el("div", [
    el("table", [
      el(
        "tbody",
        rows.map(([key, value]) => el("tr", [el("td", [key]), el("td", [value])])),
      ),
    ]),
  ]),
]

test("uses each status callout, excludes its title and falls back to prose", () => {
  for (const type of ["todo", "success", "warning", "failure"]) {
    const quest = file("ukoly/Test", "aktivní", [
      el("p", ["Úvod"]),
      callout(type, el("p", ["Stav úkolu"])),
    ])
    assert.equal(getQuestBoard([quest])[0].cards[0].summary, "Stav úkolu")
  }
  const prose = "Dlouhý příběh ".repeat(30)
  const card = getQuestBoard([file("ukoly/Sen", "aktivní", [el("p", [prose])])])[0].cards[0]
  assert.ok(card.summary.endsWith("…"))
  assert.ok(card.summary.length <= 161)
  assert.ok(prose.startsWith(card.summary.slice(0, -1) + " "))
  assert.equal(getQuestBoard([file("ukoly/Prázdný")])[0].cards[0].summary, "")
})

test("overview reads rendered wikilinks, hides unknown values and resolves NPC portrait", () => {
  const npc = file("npc/Aberot")
  npc.frontmatter!.typ = "npc"
  npc.htmlAst!.children = [el("p", [el("img", [], { src: "../_assets/portrait.webp" })])]
  const quest = file(
    "ukoly/Test",
    "aktivní",
    table([
      ["Zadavatel", el("a", ["Aberotovi"], { href: "../npc/Aberot" })],
      ["Odměna", "Neznámá"],
      ["Cíl výpravy", "—"],
      ["Priorita", "Hlavní"],
    ]),
  )
  const card = getQuestBoard([quest, npc])[0].cards[0]
  assert.deepEqual(card.fields, [
    { label: "Zadavatel", value: "Aberotovi", portrait: "../_assets/portrait.webp" },
    { label: "Priorita", value: "Hlavní", portrait: undefined },
  ])
  assert.equal(card.main, true)
})

test("groups and sorts by priority, given and finished day; success day wins over later mentions", () => {
  const active = file("ukoly/Nový")
  const main = file("ukoly/Hlavní", "aktivní", table([["Priorita", "Hlavní"]]))
  const done = file("ukoly/splnene/Hotovo (splněno)", "splněný", [
    callout("success", el("p", ["Hotovo ", el("a", ["5. dni"], { href: "../../denik/5.-den" })])),
  ])
  const fallback = file("ukoly/splnene/Druhý (uzavřeno)", "splněný")
  const paused = file("ukoly/Pauza", "pozastavený")
  const failed = file("ukoly/splnene/Neúspěch", "neúspěšný")
  const blind = file("ukoly/Stopa", "slepá stopa")
  const groups = getQuestBoard([
    active,
    main,
    done,
    fallback,
    paused,
    failed,
    blind,
    day(2, [main.slug!, done.slug!]),
    day(9, [active.slug!, done.slug!]),
    day(7, [fallback.slug!]),
  ])
  assert.deepEqual(
    groups[0].cards.map((card) => card.title),
    ["Hlavní", "Nový"],
  )
  assert.equal(groups[0].cards[0].given, 2)
  assert.equal(groups[1].cards[0].label, "Pozastaveno")
  assert.deepEqual(
    groups[2].cards.map((card) => [card.title, card.finished]),
    [
      ["Druhý", 7],
      ["Hotovo", 5],
    ],
  )
  assert.equal(groups[2].cards[1].given, 2)
  assert.equal(groups[3].cards.length, 2)
  assert.equal(getQuestBoard([active])[0].cards[0].given, undefined)
  assert.deepEqual(getQuestBoard([active]), getQuestBoard([active]))
})
