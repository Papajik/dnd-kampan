import assert from "node:assert/strict"
import { test } from "node:test"
import { getJourneyMap } from "./campaignJourneyModel"
import { getFogReveal } from "./campaignJourneyFog"

const map = getJourneyMap({
  journeyMap: {
    fog: { home: [995, 1080] },
    stops: [
      { id: "a", order: 1, day: 2, label: "A", coordinates: [50, 0], icon: "a.svg" },
      { id: "b", order: 2, day: 3, label: "B", coordinates: [200, 0], icon: "b.svg" },
    ],
    segments: [
      {
        day: 2,
        points: [
          [0, 0],
          [100, 0],
        ],
      },
      {
        day: 2,
        points: [
          [100, 0],
          [100, 100],
        ],
      },
      {
        day: 3,
        points: [
          [100, 100],
          [200, 0],
        ],
      },
    ],
  },
})

test("validates optional home coordinates, including map bounds", () => {
  assert.deepEqual(map.fog, { home: [995, 1080] })
  for (const home of [null, "home", [1], [1, 2, 3], [-1, 0], [1601, 1], [1, Infinity], [1, "2"]]) {
    assert.equal(getJourneyMap({ journeyMap: { fog: { home } } }).fog, undefined)
  }
  assert.equal(getJourneyMap({ journeyMap: { fog: "invalid" } }).fog, undefined)
  assert.equal(getJourneyMap(undefined).fog, undefined)
})

test("before map data only home is clear; future routes and stops stay covered", () => {
  assert.deepEqual(getFogReveal(map, 1), {
    circles: [{ center: [995, 1080], radius: 140, opacity: 1 }],
    corridors: [],
  })
  const day = getFogReveal(map, 2)
  assert.equal(day.corridors.length, 2)
  assert.deepEqual(
    day.circles.map((circle) => circle.center),
    [
      [995, 1080],
      [50, 0],
    ],
  )
  assert.equal(getFogReveal(map, 3).circles.length, 3)
  assert.equal(getFogReveal(map, 1).corridors.length, 0)
})

test("partial progress follows total path length and stop clearings open as the token arrives", () => {
  assert.deepEqual(getFogReveal(map, 2, 0.125).corridors, [
    [
      [0, 0],
      [25, 0],
    ],
  ])
  assert.equal(getFogReveal(map, 2, 0.1).circles.length, 1)
  const partial = getFogReveal(map, 2, 0.2)
  assert.ok(partial.circles[1].opacity > 0 && partial.circles[1].opacity < 1)
  assert.equal(getFogReveal(map, 2, 0.25).circles[1].opacity, 1)
  assert.deepEqual(getFogReveal(map, 2, 0.75).corridors, [
    [
      [0, 0],
      [100, 0],
    ],
    [
      [100, 0],
      [100, 50],
    ],
  ])
  assert.equal(getFogReveal(map, 3, 0).corridors.length, 2)
  assert.deepEqual(getFogReveal(map, 2, -1), getFogReveal(map, 2, 0))
  assert.deepEqual(getFogReveal(map, 2, 5), getFogReveal(map, 2))
})

test("stop-only and zero-length routes complete without invalid coordinates", () => {
  const stopOnly = { stops: map.stops, segments: [] }
  assert.equal(getFogReveal(stopOnly, 2, 0).circles.length, 1)
  const zero = {
    ...stopOnly,
    segments: [
      {
        day: 2,
        points: [
          [0, 0],
          [0, 0],
        ] as [number, number][],
      },
    ],
  }
  assert.deepEqual(getFogReveal(zero, 2, 0.5).corridors, [])
  assert.equal(getFogReveal(zero, 2).corridors.length, 1)
})
