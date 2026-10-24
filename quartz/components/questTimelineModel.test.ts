import assert from "node:assert/strict"
import { test } from "node:test"
import type { QuartzPluginData } from "../plugins/vfile"
import { getQuestTimeline } from "./questTimelineModel"
import type { FullSlug } from "../util/path"

const file = (slug: string, data: Partial<QuartzPluginData> = {}) =>
  ({ slug, ...data }) as QuartzPluginData

test("quest days unite incoming and outgoing links, deduplicate, sort active first and retain undated quests", () => {
  const quest = (slug: string, stav: string, links: string[] = []) =>
    file(slug, {
      frontmatter: { title: slug, tags: [], typ: "úkol", stav },
      links: links as QuartzPluginData["links"],
    })
  const days = [1, 2, 3, 4].map((n) =>
    file(`denik/${n}.-den`, {
      filePath: `content/denik/${n}. den.md` as QuartzPluginData["filePath"],
      links: (n === 2 ? ["ukoly/A"] : []) as QuartzPluginData["links"],
    }),
  )
  const result = getQuestTimeline(
    [
      ...days,
      quest("ukoly/splnene/B", "splněný", ["denik/1.-den"]),
      quest("ukoly/A", "aktivní", ["denik/2.-den", "denik/3.-den", "npc/X"]),
      quest("ukoly/C", "pozastavený"),
      file("ukoly/index"),
    ],
    "ukoly/index" as FullSlug,
  )
  assert.deepEqual(
    result.quests.map((q) => [q.state, q.mentions]),
    [
      ["aktivní", [2, 3]],
      ["splněný", [1]],
      ["pozastavený", []],
    ],
  )
  assert.equal(result.days.at(-1)?.day, 4)
  assert.equal(result.quests[0].last, 3)
})
