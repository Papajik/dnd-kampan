import assert from "node:assert/strict"
import { test } from "node:test"
import type { QuartzPluginData } from "../plugins/vfile"
import { firstImage, getDayCast } from "./dayCastModel"

const file = (slug: string, data: Partial<QuartzPluginData> = {}) =>
  ({ slug, ...data }) as QuartzPluginData
const day = file("denik/9.-den", {
  links: [
    "npc/Zora",
    "npc/Anna",
    "Gertruda",
    "bestiar/Vlk",
    "npc/index",
    "map/cesta-druziny",
    "denik/8.-den",
    "postavy/Hrdina",
  ] as QuartzPluginData["links"],
})

test("groups linked entities, sorts Czech titles, resolves aliases and excludes indexes", () => {
  const groups = getDayCast(
    [
      file("npc/Zora", { frontmatter: { title: "Zora", tags: [] } }),
      file("npc/Anna", { frontmatter: { title: "Anna", tags: [] } }),
      file("npc/Gertruda", { aliases: ["Gertruda"] as QuartzPluginData["aliases"] }),
      file("bestiar/Vlk"),
      file("postavy/Hrdina"),
      file("npc/index"),
      file("map/cesta-druziny"),
      file("denik/8.-den"),
      file("npc/Neznámý"),
    ],
    day,
  )
  assert.deepEqual(
    groups.map((group) => group.type),
    ["postavy", "npc", "bestiar"],
  )
  assert.deepEqual(
    groups[1].entries.map((entry) => entry.title),
    ["Anna", "Gertruda", "Zora"],
  )
  assert.equal(groups[1].entries[0].href, "../npc/Anna")
  assert.deepEqual(getDayCast([], day), [])
  assert.deepEqual(getDayCast([file("npc/Anna")], file("npc/Zora", { links: day.links })), [])
})

test("uses first resolved HTML image and rebases it from nested target pages", () => {
  const htmlAst: QuartzPluginData["htmlAst"] = {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "p",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "img",
            properties: { src: "../../_assets/portraits/vlk.jpeg" },
            children: [],
          },
          { type: "element", tagName: "img", properties: { src: "other.jpeg" }, children: [] },
        ],
      },
    ],
  }
  const target = file("bestiar/zvirata/Vlk", { htmlAst })
  const linkedDay = file("denik/9.-den", {
    links: ["bestiar/zvirata/Vlk"] as QuartzPluginData["links"],
  })
  assert.equal(firstImage(htmlAst), "../../_assets/portraits/vlk.jpeg")
  assert.equal(
    getDayCast([target], linkedDay)[0].entries[0].portrait,
    "../_assets/portraits/vlk.jpeg",
  )
  assert.equal(firstImage(undefined), undefined)
  target.htmlAst = {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "img",
        properties: { src: "https://example.com/portrait.jpg" },
        children: [],
      },
    ],
  }
  assert.equal(
    getDayCast([target], linkedDay)[0].entries[0].portrait,
    "https://example.com/portrait.jpg",
  )
})
