import { stopRouteProgress, type JourneyCoordinates, type JourneyMap } from "./campaignJourneyModel"

export interface FogCircle {
  center: JourneyCoordinates
  radius: number
  opacity: number
}

export interface FogReveal {
  circles: FogCircle[]
  corridors: JourneyCoordinates[][]
}

export function getFogReveal(
  map: Pick<JourneyMap, "stops" | "segments" | "fog">,
  day: number,
  progress = 1,
): FogReveal {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0
  const current = map.segments.filter((segment) => segment.day === day)
  const length = (points: JourneyCoordinates[]) =>
    points
      .slice(1)
      .reduce(
        (sum, point, i) => sum + Math.hypot(point[0] - points[i][0], point[1] - points[i][1]),
        0,
      )
  let remaining = current.reduce((sum, segment) => sum + length(segment.points), 0) * p
  const corridors = map.segments
    .filter((segment) => segment.day < day)
    .map((segment) => segment.points)
  for (const segment of current) {
    if (p === 1) {
      corridors.push(segment.points)
      continue
    }
    if (remaining <= 0) break
    const points: JourneyCoordinates[] = [segment.points[0]]
    for (let i = 1; i < segment.points.length; i++) {
      const a = segment.points[i - 1],
        b = segment.points[i]
      const distance = Math.hypot(b[0] - a[0], b[1] - a[1])
      if (distance > remaining) {
        points.push([
          a[0] + ((b[0] - a[0]) * remaining) / distance,
          a[1] + ((b[1] - a[1]) * remaining) / distance,
        ])
        remaining = 0
        break
      }
      points.push(b)
      remaining -= distance
    }
    if (points.length > 1) corridors.push(points)
  }
  const circles: FogCircle[] = map.fog ? [{ center: map.fog.home, radius: 140, opacity: 1 }] : []
  for (const stop of map.stops) {
    if (stop.day > day) continue
    const arrival = stopRouteProgress(stop.coordinates, current)
    const opacity = stop.day < day || p === 1 ? 1 : Math.max(0, Math.min(1, (p - arrival) * 10 + 1))
    if (opacity > 0) circles.push({ center: stop.coordinates, radius: 110, opacity })
  }
  return { circles, corridors }
}
