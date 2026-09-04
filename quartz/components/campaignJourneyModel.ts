import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, resolveRelative } from "../util/path"

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
