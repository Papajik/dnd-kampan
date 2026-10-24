import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug } from "../util/path"
import { getEntityAppearances, isEntityPage } from "./entityAppearancesModel"

const file = (slug: string, data: Partial<QuartzPluginData> = {}) =>
  ({ slug, ...data }) as QuartzPluginData
const day = (number: number, links: string[]) =>
  file(`denik/${number}.-den`, {
    filePath: `content/denik/${number}. den.md` as QuartzPluginData["filePath"],
    links: links as QuartzPluginData["links"],
  })

describe("entity appearances", () => {
  test("sorts diary backlinks, deduplicates days and ignores other pages", () => {
    const target = file("npc/Treja")
    const days = getEntityAppearances(
      [
        day(9, ["npc/Treja", "npc/Treja"]),
        file("lokace/Glensdale", { links: ["npc/Treja"] as QuartzPluginData["links"] }),
        day(3, ["npc/Treja"]),
        day(5, ["npc/Henry"]),
      ],
      target,
      target.slug!,
    )
    assert.deepEqual(
      days.map((day) => day.day),
      [3, 9],
    )
    assert.equal(days[0].href, "../denik/3.-den")
  })

  test("counts alias redirect slugs and frontmatter aliases with spaces", () => {
    const target = file("postavy/Feldon-Lastfeast", {
      aliases: ["Feldon"] as FullSlug[],
      frontmatter: { title: "Feldon", tags: [], aliases: ["Malý Feldon"] },
    })
    assert.deepEqual(
      getEntityAppearances(
        [day(5, ["Malý-Feldon"]), day(3, ["Feldon"]), day(1, ["postavy/Feldon-Lastfeast"])],
        target,
        target.slug!,
      ).map((day) => day.day),
      [1, 3, 5],
    )
  })

  test("recognizes entities and excludes folder indexes and diary pages", () => {
    for (const slug of ["npc/Treja", "ukoly/splnene/Úkol", "svet/bozstvo/Selhára"]) {
      assert.equal(isEntityPage(file(slug)), true)
    }
    for (const slug of ["npc/index", "npc/", "index", "denik/9.-den", "map/cesta-druziny"]) {
      assert.equal(isEntityPage(file(slug)), false)
    }
    assert.deepEqual(getEntityAppearances([], file("npc/Treja"), "npc/Treja" as FullSlug), [])
  })
})
