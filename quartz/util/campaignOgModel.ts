import { journeyBounds } from "../components/campaignJourneyCamera"
import type { JourneyMap } from "../components/campaignJourneyModel"

export function journeyCrop(map: JourneyMap, day: number) {
  const bounds = journeyBounds(map.stops, map.segments, day)
  if (!bounds) return undefined
  const size = Math.min(
    Math.min(map.width, map.height),
    Math.max(420, bounds.right - bounds.left + 120, bounds.bottom - bounds.top + 120),
  )
  const width = Math.min(map.width, Math.max(size, bounds.right - bounds.left + 120))
  const height = Math.min(map.height, Math.max(size, bounds.bottom - bounds.top + 120))
  return {
    left: Math.round(
      Math.max(0, Math.min(map.width - width, (bounds.left + bounds.right - width) / 2)),
    ),
    top: Math.round(
      Math.max(0, Math.min(map.height - height, (bounds.top + bounds.bottom - height) / 2)),
    ),
    width: Math.round(width),
    height: Math.round(height),
  }
}

export function journeyOverlay(
  map: JourneyMap,
  day: number,
  crop: NonNullable<ReturnType<typeof journeyCrop>>,
) {
  const x = (value: number) => ((value - crop.left) / crop.width) * 400
  const y = (value: number) => ((value - crop.top) / crop.height) * 400
  const routes = map.segments
    .filter((segment) => segment.day <= day)
    .map(
      (segment) =>
        `<polyline points="${segment.points.map(([px, py]) => `${x(px)},${y(py)}`).join(" ")}" fill="none" stroke="#e69a39" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" stroke-linejoin="round" opacity="${segment.day === day ? 1 : 0.22}"/>`,
    )
  const stops = map.stops
    .filter((stop) => stop.day === day)
    .map(
      (stop) =>
        `<circle cx="${x(stop.coordinates[0])}" cy="${y(stop.coordinates[1])}" r="5" fill="#e69a39" stroke="#342419" stroke-width="2"/>`,
    )
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">${routes.join("")}${stops.join("")}</svg>`
}
