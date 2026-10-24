import assert from "node:assert/strict"
import { test } from "node:test"
import type { QuartzPluginData } from "../plugins/vfile"
import type { FullSlug } from "../util/path"
import { diaryWordCount, getCampaignStatistics } from "./campaignStatisticsModel"

test("diary words exclude metadata, embeds and markup while keeping displayed link text", () => {
  assert.equal(
    diaryWordCount(
      "---\ntitle: Tajný název\n---\n# Ahoj **světe**\n[[Dlouhý cíl|Krátký text]] [odkaz](https://example.com) ![[obraz s popisem.png]] ![další obrázek](img.png) %% tajná poznámka %% <!-- skryto -->",
    ),
    5,
  )
  assert.equal(diaryWordCount(""), 0)
  assert.equal(diaryWordCount("[[Glensdale]] a [[5. den|pátý den]]."), 4)
})

test("statistics count unique diary days and normalized NPC states, excluding indexes", () => {
  const file = (slug: string, typ: string, data: Partial<QuartzPluginData> = {}) =>
    ({ slug, frontmatter: { title: slug, typ, tags: [] }, ...data }) as QuartzPluginData
  const npc = file("npc/A", "npc", {
    frontmatter: { title: "A", tags: [], typ: "npc", stav: "Nemrtvá" },
  })
  const files = [
    npc,
    file("npc/B", "npc"),
    file("npc/index", "npc"),
    file("bestiar/X", "bestiář"),
    file("denik/1.-den", "deník", {
      filePath: "content/denik/1. den.md" as QuartzPluginData["filePath"],
      rawMarkdown: "Ahoj světe",
      links: ["npc/A", "npc/A"] as QuartzPluginData["links"],
    }),
  ]
  const stats = getCampaignStatistics(files, "statistiky" as FullSlug)
  assert.equal(stats.npcs, 2)
  assert.deepEqual(stats.npcCounts, { alive: 0, dead: 1, unknown: 1 })
  assert.equal(stats.counts.bestiar, 1)
  assert.equal(stats.words, 2)
  assert.equal(stats.top[0].days.length, 1)
  assert.equal(stats.firsts[0].count, 1)
  assert.deepEqual(getCampaignStatistics([], "statistiky" as FullSlug).firsts, [])
})
