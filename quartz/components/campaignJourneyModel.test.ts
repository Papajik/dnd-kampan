import assert from "node:assert"
import { describe, test } from "node:test"
import { getJourneyMap, getJourneySegmentState } from "./campaignJourneyModel"

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
