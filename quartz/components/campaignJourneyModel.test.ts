import assert from "node:assert"
import { describe, test } from "node:test"
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug } from "../util/path"
import { getDayNavigation, getJourneyMap, getJourneySegmentState } from "./campaignJourneyModel"

describe("campaign journey model", () => {
  test("keeps only valid stops and segments", () => {
    const journeyMap = getJourneyMap({
      journeyMap: {
        width: 1600,
        height: 1200,
        stops: [
          {
            id: "second",
            order: 2,
            day: 3,
            label: "Druhá",
            coordinates: [20, 30],
            icon: "second.svg",
          },
          {
            id: "invalid",
            order: 0,
            day: 3,
            label: "Neplatná",
            coordinates: [20, 30],
            icon: "invalid.svg",
          },
          {
            id: "second",
            order: 3,
            day: 3,
            label: "Duplicitní",
            coordinates: [30, 40],
            icon: "duplicate.svg",
          },
          {
            id: "first",
            order: 1,
            day: 2,
            label: "První",
            coordinates: [10, 20],
            icon: "first.svg",
          },
        ],
        segments: [
          {
            day: 2,
            points: [
              [10, 20],
              [20, 30],
            ],
          },
          { day: 3, points: [[10, 20]] },
        ],
      },
    })

    assert.deepStrictEqual(
      journeyMap.stops.map((stop) => stop.id),
      ["first", "second"],
    )
    assert.deepStrictEqual(journeyMap.segments, [
      {
        day: 2,
        points: [
          [10, 20],
          [20, 30],
        ],
      },
    ])
  })

  test("classifies segments around the selected day", () => {
    assert.strictEqual(getJourneySegmentState(2, 3), "past")
    assert.strictEqual(getJourneySegmentState(3, 3), "current")
    assert.strictEqual(getJourneySegmentState(4, 3), "future")
  })
})

describe("day navigation", () => {
  const files = [9, 1, 3].map((day) => ({
    slug: `denik/${day}.-den` as FullSlug,
    filePath: `content/denik/${day}. den.md` as QuartzPluginData["filePath"],
    frontmatter: {
      title: `${day}. den`,
      tags: [],
      journey: { summary: "Shrnutí", location: "Glensdale" },
    },
  })) as QuartzPluginData[]

  test("finds neighbours among recorded days and retains summary and location", () => {
    const result = getDayNavigation(files, "denik/3.-den" as FullSlug)!
    assert.strictEqual(result.previous?.day, 1)
    assert.strictEqual(result.next?.day, 9)
    assert.strictEqual(result.current.summary, "Shrnutí")
    assert.strictEqual(result.current.location, "Glensdale")
  })

  test("leaves missing neighbours empty and ignores non-day pages", () => {
    assert.strictEqual(getDayNavigation(files, "denik/1.-den" as FullSlug)?.previous, undefined)
    assert.strictEqual(getDayNavigation(files, "denik/9.-den" as FullSlug)?.next, undefined)
    assert.strictEqual(getDayNavigation(files, "denik/index" as FullSlug), undefined)
    const single = getDayNavigation(files.slice(0, 1), "denik/9.-den" as FullSlug)!
    assert.strictEqual(single.previous, undefined)
    assert.strictEqual(single.next, undefined)
  })
})
