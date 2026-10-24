import type { QuartzComponent } from "./types"
import { resolveRelative } from "../util/path"
import { getCampaignStatistics } from "./campaignStatisticsModel"
import { getPageType, pageTypes } from "./pageTypeModel"
import style from "./styles/campaignOverviews.scss"

export const CampaignStatistics: QuartzComponent = ({ allFiles, fileData }) => {
  if (fileData.slug !== "statistiky") return null
  const stats = getCampaignStatistics(allFiles, fileData.slug)
  const number = (value: number) => value.toLocaleString("cs-CZ")
  const metrics = [
    ["Odehrané dny", stats.days.length],
    ["NPC", stats.npcs],
    ["Nestvůry v bestiáři", stats.counts.bestiar],
    ["Lokace", stats.counts.lokace],
    ["Předměty", stats.counts.predmety],
    ["Slov v deníku", stats.words],
  ] as const
  const max = Math.max(1, ...stats.days.map((day) => day.words))
  return (
    <section class="campaign-statistics" aria-label="Statistiky kampaně">
      <dl class="campaign-metrics">
        {metrics.map(([label, count]) => (
          <div>
            <dt>{label}</dt>
            <dd>{number(count)}</dd>
          </div>
        ))}
      </dl>
      <p>
        Z NPC: {stats.npcCounts.alive} živých · {stats.npcCounts.dead} mrtvých (včetně nemrtvých) ·{" "}
        {stats.npcCounts.unknown} s neznámým stavem.
      </p>
      <h2>Úkoly podle stavu</h2>
      <ul class="quest-totals">
        {stats.quests.map(({ state, count }) => (
          <li>
            {state}: <strong>{count}</strong>
          </li>
        ))}
      </ul>
      <h2>Nejčastěji zmiňovaní</h2>
      <p>Počet různých dnů, které odkazují na danou stránku.</p>
      <ol class="campaign-ranking">
        {stats.top.map(({ file, days }) => (
          <li>
            <a class="internal" href={resolveRelative(fileData.slug!, file.slug!)}>
              {file.frontmatter?.title}
            </a>{" "}
            <small>{pageTypes[getPageType(file.slug!)]}</small>
            <strong>{days.length} dní</strong>
          </li>
        ))}
      </ol>
      <h2>Slov v jednotlivých dnech</h2>
      <p>Text deníku bez metadat a obrázků; u odkazů se počítá viditelný text.</p>
      <ul class="word-bars">
        {stats.days.map((day) => (
          <li>
            <a class="internal" href={day.href}>
              {day.day}. den
            </a>
            <span class="word-track" aria-hidden="true">
              <span style={{ width: `${(day.words / max) * 100}%` }} />
            </span>
            <strong>{number(day.words)}</strong>
          </li>
        ))}
      </ul>
      <h2>Nejvíc nových tváří</h2>
      <p>První zmínky všech typů entit, včetně míst, předmětů a úkolů; nejde jen o osoby.</p>
      {stats.firsts.length ? (
        <ul>
          {stats.firsts.map((day) => (
            <li>
              <a class="internal" href={day.href}>
                {day.title}
              </a>
              : {day.count} poprvé zmíněných entit
            </li>
          ))}
        </ul>
      ) : (
        <p>Zatím nejsou doložené zmínky.</p>
      )}
    </section>
  )
}
CampaignStatistics.css = style
