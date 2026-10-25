import assert from "node:assert/strict"
import { test } from "node:test"
import { clampCamera, fitToBox, journeyBounds, zoomAround } from "./campaignJourneyCamera"
import type { JourneyStop } from "./campaignJourneyModel"
const view = { width: 800, height: 600 }
const map = { width: 1600, height: 1200 }
test("bounds include every segment of the day and stops, and leave empty days undefined", () => {
  const stops = [{ day: 7, coordinates: [20, 30] }] as JourneyStop[]
  const segments = [
    {
      day: 5,
      points: [
        [100, 200],
        [300, 400],
      ],
    },
    {
      day: 5,
      points: [
        [50, 500],
        [400, 100],
      ],
    },
  ] as Parameters<typeof journeyBounds>[1]
  assert.deepEqual(journeyBounds(stops, segments, 5), {
    left: 50,
    top: 100,
    right: 400,
    bottom: 500,
  })
  assert.deepEqual(journeyBounds(stops, segments, 7), { left: 20, right: 20, top: 30, bottom: 30 })
  assert.equal(journeyBounds(stops, segments, 1), undefined)
  assert.equal(journeyBounds(stops, segments)?.left, 20)
})
test("fit adds padding, centers the box, and limits single-point zoom", () => {
  assert.deepEqual(fitToBox({ left: 200, right: 1200, top: 100, bottom: 900 }, view, map, 60), {
    scale: 0.6,
    x: -20,
    y: 0,
  })
  const single = fitToBox({ left: 800, right: 800, top: 600, bottom: 600 }, view, map)
  assert.equal(single.scale, 1.6)
  assert.equal(single.x + 800 * single.scale, 400)
})
test("clamp keeps the viewport covered by the map and constrains scale at both limits", () => {
  assert.deepEqual(clampCamera({ x: 10000, y: -10000, scale: 10 }, view, map), {
    scale: 3,
    x: 0,
    y: -3000,
  })
  assert.equal(clampCamera({ x: 0, y: 0, scale: 0.01 }, view, map).scale, 0.5)
})
test("zoom preserves the map coordinate beneath the anchor", () => {
  const camera = { x: -20, y: 40, scale: 0.5 }
  const next = zoomAround(camera, [120, 180], 2)
  assert.equal((120 - next.x) / next.scale, (120 - camera.x) / camera.scale)
  assert.equal((180 - next.y) / next.scale, (180 - camera.y) / camera.scale)
})
