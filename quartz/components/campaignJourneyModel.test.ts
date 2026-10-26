import assert from "node:assert"
import { describe, test } from "node:test"
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug } from "../util/path"
import {
  getDayNavigation,
  getJourneyMap,
  getJourneySegmentState,
  hasJourneyDay,
  getReplayDays,
  replayTimeline,
  stopRouteProgress,
} from "./campaignJourneyModel"

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

describe("map links and replay", () => {
  const map = getJourneyMap({
    journeyMap: {
      segments: [
        {
          day: 5,
          points: [
            [10, 20],
            [30, 40],
          ],
        },
      ],
      stops: [
        { id: "camp", order: 1, day: 7, label: "Tábor", coordinates: [30, 40], icon: "camp.svg" },
      ],
    },
  })
  test("includes segment-only and stop-only days, excludes missing days", () => {
    assert.strictEqual(hasJourneyDay(map, 1), false)
    assert.strictEqual(hasJourneyDay(map, 5), true)
    assert.strictEqual(hasJourneyDay(map, 7), true)
    assert.deepStrictEqual(getReplayDays([{ day: 7 }, { day: 1 }, { day: 5 }], map), [5, 7])
  })
  test("replay walks to each stop, holds there, then continues", () => {
    const timeline = replayTimeline(360, [0.5, 1], { speed: 180, hold: 800, lead: 600 })
    assert.strictEqual(timeline.duration, 600 + 2000 + 1600)
    assert.strictEqual(timeline.progressAt(0), 0)
    assert.strictEqual(timeline.progressAt(600), 0)
    assert.strictEqual(timeline.progressAt(1100), 0.25)
    assert.strictEqual(timeline.progressAt(1600), 0.5)
    assert.strictEqual(timeline.progressAt(2400), 0.5)
    assert.strictEqual(timeline.progressAt(2900), 0.75)
    assert.strictEqual(timeline.progressAt(3400), 1)
    assert.strictEqual(timeline.progressAt(4200), 1)
  })
  test("replay without a route only holds on the stops", () => {
    const timeline = replayTimeline(0, [0, 0])
    assert.strictEqual(timeline.duration, 1200)
    assert.strictEqual(timeline.progressAt(0), 1)
    assert.strictEqual(replayTimeline(10, []).duration, 600 + 1500)
  })
})

test("stops appear at their nearest progress across multiple route segments", () => {
  const segments = [
    {
      day: 5,
      points: [
        [0, 0],
        [100, 0],
      ],
    },
    {
      day: 5,
      points: [
        [100, 0],
        [100, 100],
      ],
    },
  ] as Parameters<typeof stopRouteProgress>[1]
  assert.strictEqual(stopRouteProgress([50, 5], segments), 0.25)
  assert.strictEqual(stopRouteProgress([100, 50], segments), 0.75)
  assert.strictEqual(stopRouteProgress([100, 100], segments), 1)
  assert.strictEqual(stopRouteProgress([0, 0], []), 0)
})

test("keeps portal and return travel and ignores unknown travel kinds", () => {
  const map = getJourneyMap({
    journeyMap: {
      segments: [
        {
          day: 9,
          travel: "portal",
          points: [
            [0, 0],
            [1, 1],
          ],
        },
        {
          day: 9,
          travel: "return",
          points: [
            [0, 0],
            [1, 1],
          ],
        },
        {
          day: 9,
          travel: "boat",
          points: [
            [0, 0],
            [1, 1],
          ],
        },
      ],
    },
  })
  assert.deepEqual(
    map.segments.map((segment) => segment.travel),
    ["portal", "return", undefined],
  )
})
