import { QuartzComponent, QuartzComponentConstructor } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { getDayNavigation, getJourneyMap, hasJourneyDay } from "./campaignJourneyModel"
import style from "./styles/dayNavigation.scss"
// @ts-ignore
import keyboard from "./scripts/dayKeyboard.inline"

export default ((options?: { variant?: "top" | "bottom" }) => {
  const variant = options?.variant ?? "top"
  const DayNavigation: QuartzComponent = ({ allFiles, fileData }) => {
    if (!fileData.slug) return null
    const navigation = getDayNavigation(allFiles, fileData.slug)
    if (!navigation) return null
    const { current, previous, next } = navigation
    const mapFile = allFiles.find((file) => file.slug === "map/cesta-druziny")
    const onMap = mapFile && hasJourneyDay(getJourneyMap(mapFile.frontmatter), current.day)
    return (
      <section class={`day-navigation day-navigation-${variant}`} aria-label="Navigace deníkem">
        {variant === "top" && (
          <div class="day-summary">
            <p>{current.summary}</p>
            {current.location && <p class="day-location">Místo: {current.location}</p>}
            {onMap && (
              <a
                class="internal day-map-link"
                href={`${resolveRelative(fileData.slug, "map/cesta-druziny" as FullSlug)}#den-${current.day}`}
              >
                🗺 Na mapě
              </a>
            )}
          </div>
        )}
        <nav aria-label={variant === "top" ? "Sousední dny nahoře" : "Sousední dny dole"}>
          <span>
            {previous && (
              <a class="internal" data-day-direction="previous" href={previous.href}>
                ← {previous.day}. den
              </a>
            )}
          </span>
          <span>
            {next && (
              <a class="internal" data-day-direction="next" href={next.href}>
                {next.day}. den →
              </a>
            )}
          </span>
        </nav>
      </section>
    )
  }
  DayNavigation.css = style
  DayNavigation.afterDOMLoaded = keyboard
  return DayNavigation
}) satisfies QuartzComponentConstructor
