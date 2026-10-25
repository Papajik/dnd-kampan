import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, resolveRelative, simplifySlug } from "../util/path"

export type JourneyCoordinates = [number, number]

export interface JourneyStop {
  id: string
  order: number
  day: number
  label: string
  coordinates: JourneyCoordinates
  icon: string
}

export interface JourneySegment {
  day: number
  points: JourneyCoordinates[]
}

export interface JourneyMap {
  image?: string
  fog?: { home: JourneyCoordinates }
  width: number
  height: number
  stops: JourneyStop[]
  segments: JourneySegment[]
}

export interface JourneyDay {
  day: number
  title: string
  slug: FullSlug
  href: string
  summary: string
  location?: string
}

export type JourneySegmentState = "past" | "current" | "future"

interface JourneyMetadata {
  summary?: unknown
  location?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function isCoordinates(value: unknown): value is JourneyCoordinates {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((coordinate) => typeof coordinate === "number" && Number.isFinite(coordinate))
  )
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0
}

function parseStop(value: unknown): JourneyStop | undefined {
  if (!isRecord(value)) return undefined
  if (
    typeof value.id !== "string" ||
    !isPositiveInteger(value.order) ||
    !isPositiveInteger(value.day) ||
    typeof value.label !== "string" ||
    !isCoordinates(value.coordinates) ||
    typeof value.icon !== "string"
  ) {
    return undefined
  }

  return {
    id: value.id,
    order: value.order,
    day: value.day,
    label: value.label,
    coordinates: value.coordinates,
    icon: value.icon,
  }
}

function parseSegment(value: unknown): JourneySegment | undefined {
  if (!isRecord(value) || !isPositiveInteger(value.day) || !Array.isArray(value.points))
    return undefined

  const points = value.points.filter(isCoordinates)
  return points.length >= 2 ? { day: value.day, points } : undefined
}

export function getJourneyMap(frontmatter: Record<string, unknown> | undefined): JourneyMap {
  const metadata = isRecord(frontmatter?.journeyMap) ? frontmatter.journeyMap : {}
  const parsedStops = Array.isArray(metadata.stops)
    ? metadata.stops.map(parseStop).filter((stop): stop is JourneyStop => stop !== undefined)
    : []
  const stopIds = new Set<string>()
  const stops = parsedStops.filter((stop) => {
    if (stopIds.has(stop.id)) return false
    stopIds.add(stop.id)
    return true
  })
  const segments = Array.isArray(metadata.segments)
    ? metadata.segments
        .map(parseSegment)
        .filter((segment): segment is JourneySegment => segment !== undefined)
    : []

  return {
    image: typeof metadata.image === "string" ? metadata.image : undefined,
    width: typeof metadata.width === "number" ? metadata.width : 1600,
    height: typeof metadata.height === "number" ? metadata.height : 1200,
    fog:
      isRecord(metadata.fog) &&
      isCoordinates(metadata.fog.home) &&
      metadata.fog.home[0] >= 0 &&
      metadata.fog.home[1] >= 0 &&
      metadata.fog.home[0] <= (typeof metadata.width === "number" ? metadata.width : 1600) &&
      metadata.fog.home[1] <= (typeof metadata.height === "number" ? metadata.height : 1200)
        ? { home: metadata.fog.home }
        : undefined,
    stops: stops.sort((first, second) => first.order - second.order),
    segments,
  }
}

function getDay(file: QuartzPluginData): number | undefined {
  const match = file.filePath?.match(/content\/denik\/(\d+)\. den\.md$/)
  return match ? Number(match[1]) : undefined
}

export function getJourneyDays(allFiles: QuartzPluginData[], currentSlug: FullSlug): JourneyDay[] {
  const days: JourneyDay[] = []

  for (const file of allFiles) {
    const day = getDay(file)
    if (!day || !file.slug) continue

    const journey = isRecord(file.frontmatter?.journey)
      ? (file.frontmatter.journey as JourneyMetadata)
      : {}
    days.push({
      day,
      title: typeof file.frontmatter?.title === "string" ? file.frontmatter.title : `${day}. den`,
      slug: file.slug as FullSlug,
      href: resolveRelative(currentSlug, file.slug as FullSlug),
      summary:
        typeof journey.summary === "string"
          ? journey.summary
          : "Záznam dne čeká na stručné shrnutí.",
      location: typeof journey.location === "string" ? journey.location : undefined,
    })
  }

  return days.sort((first, second) => first.day - second.day)
}

export function getJourneySegmentState(day: number, selectedDay: number): JourneySegmentState {
  if (day < selectedDay) return "past"
  if (day > selectedDay) return "future"
  return "current"
}

export function getDayNavigation(allFiles: QuartzPluginData[], slug: FullSlug) {
  const days = getJourneyDays(allFiles, slug)
  const index = days.findIndex((day) => simplifySlug(day.slug) === simplifySlug(slug))
  if (index === -1) return undefined
  return { current: days[index], previous: days[index - 1], next: days[index + 1] }
}

export function hasJourneyDay(map: Pick<JourneyMap, "stops" | "segments">, day: number): boolean {
  return (
    map.stops.some((stop) => stop.day === day) ||
    map.segments.some((segment) => segment.day === day)
  )
}

export function getReplayDays(
  days: Pick<JourneyDay, "day">[],
  map: Pick<JourneyMap, "stops" | "segments">,
): number[] {
  return days
    .filter((day) => hasJourneyDay(map, day.day))
    .map((day) => day.day)
    .sort((a, b) => a - b)
}

export function replayDuration(length: number): number {
  return length <= 0 ? 1200 : Math.min(4000, Math.max(1800, length * 8))
}

export function stopRouteProgress(
  coordinates: JourneyCoordinates,
  segments: JourneySegment[],
): number {
  let nearest = Infinity
  let nearestDistance = 0
  let distance = 0
  for (const segment of segments) {
    for (let i = 1; i < segment.points.length; i++) {
      const [ax, ay] = segment.points[i - 1]
      const [bx, by] = segment.points[i]
      const dx = bx - ax,
        dy = by - ay
      const squared = dx * dx + dy * dy
      const length = Math.sqrt(squared)
      const t = squared
        ? Math.max(
            0,
            Math.min(1, ((coordinates[0] - ax) * dx + (coordinates[1] - ay) * dy) / squared),
          )
        : 0
      const separation = Math.hypot(coordinates[0] - ax - t * dx, coordinates[1] - ay - t * dy)
      if (separation < nearest) {
        nearest = separation
        nearestDistance = distance + length * t
      }
      distance += length
    }
  }
  return distance ? nearestDistance / distance : 0
}
