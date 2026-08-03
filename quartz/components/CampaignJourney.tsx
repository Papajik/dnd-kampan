import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/campaignJourney.scss"
// @ts-ignore
import script from "./scripts/campaignJourney.inline"

interface JourneyMetadata {
  summary?: string
  location?: string
  coordinates?: string
}

interface JourneyMapMetadata {
  image?: string
  width?: number
  height?: number
}

interface JourneyEntry {
  day: number
  title: string
  slug: FullSlug
  summary: string
  location?: string
  coordinates?: string
}

function getDay(file: QuartzPluginData): number | undefined {
  const match = file.filePath?.match(/content\/denik\/(\d+)\. den\.md$/)
  return match ? Number(match[1]) : undefined
}

function getJourneyEntries(allFiles: QuartzPluginData[]): JourneyEntry[] {
  return allFiles
    .map((file) => {
      const day = getDay(file)
      if (!day || !file.slug) return undefined

      const journey = (file.frontmatter?.journey ?? {}) as JourneyMetadata
      return {
        day,
        title: file.frontmatter?.title ?? `${day}. den`,
        slug: file.slug as FullSlug,
        summary: journey.summary ?? "Záznam dne čeká na stručné shrnutí.",
        location: journey.location,
        coordinates: journey.coordinates,
      }
    })
    .filter((entry): entry is JourneyEntry => entry !== undefined)
    .sort((first, second) => first.day - second.day)
}

export const CampaignJourney: QuartzComponent = ({ allFiles, fileData }: QuartzComponentProps) => {
  if (fileData.slug !== "map/cesta-druziny") return null

  const map = (fileData.frontmatter?.journeyMap ?? {}) as JourneyMapMetadata
  const entries = getJourneyEntries(allFiles)
  const eventData = entries.map((entry) => ({
    ...entry,
    href: resolveRelative(fileData.slug!, entry.slug),
  }))
  const firstDay = entries.at(0)?.day ?? 1
  const latestDay = entries.at(-1)?.day ?? firstDay

  return (
    <section
      class="campaign-journey"
      data-events={JSON.stringify(eventData)}
      data-map-width={map.width ?? 1600}
      data-map-height={map.height ?? 1200}
    >
      <div class="campaign-journey-map" aria-label="Mapa cesty družiny">
        <div class="campaign-journey-toolbar">
          <div class="campaign-journey-zoom-controls" aria-label="Ovládání mapy">
            <button type="button" data-action="zoom-out" aria-label="Oddálit mapu">−</button>
            <button type="button" data-action="reset" aria-label="Vycentrovat mapu">⌾</button>
            <button type="button" data-action="zoom-in" aria-label="Přiblížit mapu">+</button>
          </div>
          <label class="campaign-journey-route-toggle">
            <input type="checkbox" data-action="toggle-route" checked />
            <span>Trasa družiny</span>
          </label>
        </div>
        <div class="campaign-journey-viewport" tabindex="0">
          <div class="campaign-journey-stage">
            {map.image && <img src={map.image} alt="Mapa okolí Glensdale" draggable={false} />}
            <svg class="campaign-journey-route" aria-hidden="true">
              <polyline />
            </svg>
          </div>
        </div>
        <aside class="campaign-journey-event" aria-live="polite">
          <span class="campaign-journey-event-day">Den {latestDay}</span>
          <h2><a class="internal"></a></h2>
          <p class="campaign-journey-event-summary"></p>
          <p class="campaign-journey-event-location"></p>
        </aside>
      </div>
      <nav class="campaign-journey-timeline" aria-label="Časová osa kampaně">
        <button type="button" data-action="previous-day" aria-label="Předchozí den">‹</button>
        <input type="range" min={firstDay} max={latestDay} value={latestDay} step="1" aria-label="Vybraný den" />
        <button type="button" data-action="next-day" aria-label="Další den">›</button>
        <div class="campaign-journey-day-buttons">
          {entries.map((entry) => (
            <button type="button" data-day={entry.day} aria-label={`Zobrazit den ${entry.day}`}>
              <span>{entry.day}</span>
              <small>{entry.title}</small>
            </button>
          ))}
        </div>
      </nav>
    </section>
  )
}

CampaignJourney.css = style
CampaignJourney.afterDOMLoaded = script

export default (() => CampaignJourney) satisfies QuartzComponentConstructor
