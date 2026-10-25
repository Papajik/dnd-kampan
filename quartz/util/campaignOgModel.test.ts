import assert from "node:assert/strict"
import { test } from "node:test"
import type { JourneyMap } from "../components/campaignJourneyModel"
import { journeyCrop, journeyOverlay } from "./campaignOgModel"

const map: JourneyMap = {
  width: 1600,
  height: 1200,
  stops: [{ id: "a", label: "A", icon: "", day: 5, order: 1, coordinates: [1500, 1150] }],
  segments: [
    {
      day: 4,
      points: [
        [1400, 1000],
        [1450, 1050],
      ],
    },
    {
      day: 5,
      points: [
        [1450, 1050],
        [1500, 1150],
      ],
    },
    {
      day: 6,
      points: [
        [1500, 1150],
        [1600, 1200],
      ],
    },
  ],
}

test("crop includes selected day, padding and stays within map edges", () => {
  const crop = journeyCrop(map, 5)!
  assert.ok(crop.left >= 0 && crop.top >= 0)
  assert.ok(crop.left + crop.width <= map.width)
  assert.ok(crop.top + crop.height <= map.height)
  assert.ok(crop.left <= 1450 && crop.left + crop.width > 1500)
  assert.ok(crop.top <= 1050 && crop.top + crop.height > 1150)
  assert.equal(journeyCrop(map, 1), undefined)
})

test("stop-only days have a nonzero crop; routes support segment-only days", () => {
  assert.equal(journeyCrop({ ...map, segments: [] }, 5)?.width, 420)
  assert.ok(journeyCrop({ ...map, stops: [] }, 5))
})

test("overlay shows faint past, dashed current and selected stops, excludes future", () => {
  const svg = journeyOverlay(map, 5, journeyCrop(map, 5)!)
  assert.equal((svg.match(/<polyline/g) ?? []).length, 2)
  assert.equal((svg.match(/<circle/g) ?? []).length, 1)
  assert.match(svg, /opacity="0.22"/)
  assert.match(svg, /opacity="1"/)
  assert.match(svg, /stroke-dasharray="8 6"/)
})
