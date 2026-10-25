import assert from "node:assert/strict"
import { test } from "node:test"
import type { QuartzPluginData } from "../plugins/vfile"
import { formatChangeDate, getRecentChanges } from "./recentChangesModel"
const file = (slug: string, created = "2026-10-24", modified = created) =>
  ({
    slug,
    dates: { created: new Date(created), modified: new Date(modified) },
  }) as QuartzPluginData

test("excludes special pages, sorts and limits changes", () => {
  const result = getRecentChanges([
    file("npc/Henry"),
    file("denik/9.-den", "2026-10-23", "2026-10-25"),
    ...["index", "npc/index", "statistiky", "map/foo", "tags/npc", "npc/"].map((slug) =>
      file(slug),
    ),
  ])
  assert.deepEqual(
    result.map((r) => [r.file.slug, r.label]),
    [
      ["denik/9.-den", "Deník"],
      ["npc/Henry", "NPC"],
    ],
  )
  assert.equal(
    getRecentChanges(
      result.map((r) => r.file),
      1,
    ).length,
    1,
  )
  assert.equal(getRecentChanges([{ slug: "npc/X" } as QuartzPluginData]).length, 0)
  assert.equal(formatChangeDate(new Date("2026-10-25T12:00:00Z")), "25. 10. 2026")
})
