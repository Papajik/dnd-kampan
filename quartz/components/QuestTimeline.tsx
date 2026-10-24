import type { QuartzComponent } from "./types"
import { resolveRelative } from "../util/path"
import { getQuestTimeline, questStates } from "./questTimelineModel"
import style from "./styles/campaignOverviews.scss"

export const QuestTimeline: QuartzComponent = ({ allFiles, fileData }) => {
  if (fileData.slug !== "ukoly/index") return null
  const { days, quests } = getQuestTimeline(allFiles, fileData.slug)
  return (
    <section class="quest-timeline">
      <h2>Časová osa úkolů</h2>
      <p>
        Tečky označují dny zmínek. Přerušovaná čára prodlužuje aktivní úkol do posledního zapsaného
        dne; neznamená novou zmínku.
      </p>
      <ul class="quest-legend">
        {questStates.map((state, index) => (
          <li data-state={index}>{state}</li>
        ))}
      </ul>
      <div
        class="overview-scroll"
        tabIndex={0}
        role="region"
        aria-label="Časová osa úkolů, posun do stran"
      >
        <div class="quest-grid" style={{ "--quest-days": days.length }}>
          <strong>Úkol / den</strong>
          {days.map((day) => (
            <a class="internal quest-day" href={day.href} title={day.title}>
              {day.day}.
            </a>
          ))}
          {quests.map((quest) => (
            <>
              <div class="quest-name">
                <a class="internal" href={resolveRelative(fileData.slug!, quest.file.slug!)}>
                  {quest.file.frontmatter?.title}
                </a>
                <small>
                  {quest.state}
                  {quest.first === undefined ? " · bez doloženého dne" : ""}
                </small>
              </div>
              {days.map((day) => {
                const mentioned = quest.mentions.includes(day.day)
                const bar =
                  quest.first !== undefined && day.day >= quest.first && day.day <= quest.last!
                const tail =
                  quest.state === "aktivní" && quest.last !== undefined && day.day > quest.last
                return (
                  <span
                    class={`quest-cell${bar ? " known" : ""}${tail ? " tail" : ""}`}
                    data-state={questStates.indexOf(quest.state as (typeof questStates)[number])}
                  >
                    {mentioned && (
                      <a
                        class="internal quest-dot"
                        href={day.href}
                        title={`${quest.file.frontmatter?.title} · ${day.title}`}
                        aria-label={`Zmínka: ${day.title}`}
                      >
                        ●
                      </a>
                    )}
                  </span>
                )
              })}
            </>
          ))}
        </div>
      </div>
    </section>
  )
}
QuestTimeline.css = style
