import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { getJourneyDays, getJourneyMap } from "./campaignJourneyModel"
import style from "./styles/campaignJourney.scss"
// @ts-ignore
import script from "./scripts/campaignJourney.inline"

export const CampaignJourney: QuartzComponent = ({ allFiles, fileData }: QuartzComponentProps) => {
  if (fileData.slug !== "map/cesta-druziny") return null

  const map = getJourneyMap(fileData.frontmatter)
  const days = getJourneyDays(allFiles, fileData.slug)
  const latestDay = days.at(-1)?.day ?? 1
  const initialDayIndex = Math.max(days.length - 1, 0)
  const journeyData = JSON.stringify({ days, stops: map.stops, segments: map.segments })

  return (
    <section
      class="campaign-journey"
      data-journey={journeyData}
      data-map-width={map.width ?? 1600}
      data-map-height={map.height ?? 1200}
      data-marker-mode="icon"
    >
      <div class="campaign-journey-content">
        <div class="campaign-journey-map" aria-label="Mapa cesty družiny">
          <div class="campaign-journey-toolbar">
            <div class="campaign-journey-zoom-controls" aria-label="Ovládání mapy">
              <button type="button" data-action="zoom-out" aria-label="Oddálit mapu">
                −
              </button>
              <button type="button" data-action="reset" aria-label="Vycentrovat mapu">
                ⌾
              </button>
              <button type="button" data-action="zoom-in" aria-label="Přiblížit mapu">
                +
              </button>
            </div>
          </div>
          <div class="campaign-journey-viewport" tabIndex={0}>
            <div class="campaign-journey-stage">
              {map.image && <img src={map.image} alt="Mapa okolí Glensdale" draggable={false} />}
              <svg
                class="campaign-journey-route"
                viewBox={`0 0 ${map.width} ${map.height}`}
                aria-hidden="true"
              >
                {map.segments.map((segment, index) => (
                  <polyline
                    data-day={segment.day}
                    data-segment={index}
                    points={segment.points.map(([x, y]) => `${x},${y}`).join(" ")}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
        <aside class="campaign-journey-sidebar">
          <details class="campaign-journey-event" open>
            <summary>
              <span>
                Den <span class="campaign-journey-event-day">{latestDay}</span>
              </span>
              <span class="campaign-journey-event-toggle" aria-hidden="true">
                ⌄
              </span>
            </summary>
            <div class="campaign-journey-event-content">
              <h2>
                <a class="internal"></a>
              </h2>
              <p class="campaign-journey-event-summary"></p>
              <p class="campaign-journey-event-location"></p>
              <ul class="campaign-journey-event-stops"></ul>
            </div>
          </details>
          <label class="campaign-journey-marker-toggle">
            <input type="checkbox" data-action="toggle-marker-mode" checked />
            <span>Zobrazovat ikony na mapě</span>
          </label>
          <section class="campaign-journey-legend" aria-label="Legenda zastávek">
            <h2>Legenda</h2>
            <div class="campaign-journey-legend-items">
              {map.stops.map((stop) => (
                <button type="button" data-stop-id={stop.id} data-day={stop.day}>
                  <img src={stop.icon} alt="" />
                  <span class="campaign-journey-stop-order">{stop.order}</span>
                  <span>{stop.label}</span>
                  <small>Den {stop.day}</small>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
      <nav class="campaign-journey-timeline" aria-label="Časová osa kampaně">
        <button type="button" data-action="previous-day" aria-label="Předchozí den">
          ‹
        </button>
        <input
          type="range"
          min="0"
          max={initialDayIndex}
          value={initialDayIndex}
          step="1"
          aria-label="Vybraný den"
        />
        <button type="button" data-action="next-day" aria-label="Další den">
          ›
        </button>
        <div class="campaign-journey-day-buttons">
          {days.map((day) => (
            <button type="button" data-day={day.day} aria-label={`Zobrazit den ${day.day}`}>
              <span>{day.day}</span>
              <small>{day.title}</small>
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
