import type { QuartzPluginData } from "../plugins/vfile"
import type { FullSlug } from "../util/path"
import { getJourneyDays } from "./campaignJourneyModel"
import { getEntityAppearances, isEntityPage } from "./entityAppearancesModel"
import { npcCategory, npcStates } from "./npcStatusModel"
import { getPageType } from "./pageTypeModel"
import { getQuestTimeline, questStates } from "./questTimelineModel"

export function diaryWordCount(markdown: string): number {
  const text = markdown
    .replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "")
    .replace(/%%[\s\S]*?%%/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/!\[\[[^\]]*\]\]/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(
      /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
      (_, target, label) => label ?? target.split("#")[0],
    )
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
  return text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0
}

export function getCampaignStatistics(files: QuartzPluginData[], slug: FullSlug) {
  const entities = files.filter(isEntityPage)
  const days = getJourneyDays(files, slug).map((day) => ({
    ...day,
    words: diaryWordCount(files.find((file) => file.slug === day.slug)?.rawMarkdown ?? ""),
  }))
  const appearances = entities.map((file) => ({
    file,
    days: getEntityAppearances(files, file, slug),
  }))
  const firsts = days.map((day) => ({
    ...day,
    count: appearances.filter((entry) => entry.days[0]?.day === day.day).length,
  }))
  const npcs = entities.filter((file) => file.frontmatter?.typ === "npc")
  const npcCounts = { alive: 0, dead: 0, unknown: 0 }
  for (const npc of npcs) npcCounts[npcCategory(npcStates, npc.frontmatter?.stav) ?? "unknown"]++
  const timeline = getQuestTimeline(files, slug)
  return {
    days,
    words: days.reduce((sum, day) => sum + day.words, 0),
    npcs: npcs.length,
    npcCounts,
    counts: Object.fromEntries(
      ["bestiar", "lokace", "predmety"].map((type) => [
        type,
        entities.filter((file) => getPageType(file.slug!) === type).length,
      ]),
    ),
    quests: questStates.map((state) => ({
      state,
      count: timeline.quests.filter((q) => q.state === state).length,
    })),
    top: appearances
      .filter((entry) => entry.days.length > 0)
      .sort(
        (a, b) =>
          b.days.length - a.days.length ||
          a.file.frontmatter!.title.localeCompare(b.file.frontmatter!.title, "cs"),
      )
      .slice(0, 10),
    firsts: firsts.filter(
      (day) => day.count > 0 && day.count === Math.max(...firsts.map((d) => d.count)),
    ),
  }
}
