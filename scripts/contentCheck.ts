import { isEntityPage } from "../quartz/components/entityAppearancesModel"
import { FullSlug } from "../quartz/util/path"
import { posix } from "node:path"
import matter from "gray-matter"
import { getJourneyMap } from "../quartz/components/campaignJourneyModel"
import { npcCategory, npcStates, npcRelations } from "../quartz/components/npcStatusModel"

export interface ContentFile {
  /** Path relative to `content/`, e.g. `npc/Treja.md` or `map/map.jpeg`. */
  path: string
  /** Markdown source; undefined for assets. */
  text?: string
}

export interface Issue {
  level: "error" | "warning"
  file: string
  message: string
}

const QUEST_STATES = ["aktivní", "pozastavený", "splněný", "neúspěšný", "slepá stopa"]
const CLOSED_QUEST_STATES = ["splněný", "neúspěšný"]
const ENTITY_FOLDERS = ["denik", "postavy", "npc", "bestiar", "lokace", "predmety", "svet", "ukoly"]
const JOURNEY_PAGE = "map/cesta-druziny.md"

interface Page {
  path: string
  dir: string
  name: string
  body: string
  frontmatter: Record<string, unknown>
  hasFrontmatter: boolean
}

function dirname(path: string): string {
  const index = path.lastIndexOf("/")
  return index === -1 ? "" : path.slice(0, index)
}

function basename(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1)
}

function stripMd(path: string): string {
  return path.endsWith(".md") ? path.slice(0, -3) : path
}

function isIndex(path: string): boolean {
  return basename(path) === "index.md"
}

function dayNumber(path: string): number | undefined {
  const match = path.match(/^denik\/(\d+)\. den\.md$/)
  return match ? Number(match[1]) : undefined
}

/** Wikilink targets outside fenced and inline code, with heading/block anchors removed. */
export function extractWikilinks(body: string): string[] {
  const withoutCode = body.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "")
  const targets: string[] = []
  for (const match of withoutCode.matchAll(/!?\[\[([^\]]+?)\]\]/g)) {
    const target = match[1].split(/\\?\|/)[0].split("#")[0].trim()
    if (target) targets.push(target)
  }
  return targets
}

export class LinkResolver {
  private readonly targets = new Set<string>()

  constructor(files: ContentFile[], pages: Page[]) {
    for (const file of files) {
      this.targets.add(stripMd(file.path))
      this.targets.add(stripMd(basename(file.path)))
    }
    for (const page of pages) {
      const aliases = page.frontmatter.aliases
      if (!Array.isArray(aliases)) continue
      for (const alias of aliases) {
        if (typeof alias !== "string") continue
        this.targets.add(alias)
      }
    }
  }

  resolves(target: string, fromDir: string): boolean {
    const normalized = stripMd(target.replace(/^\.?\//, ""))
    if (this.targets.has(normalized)) return true
    return fromDir !== "" && this.targets.has(`${fromDir}/${normalized}`)
  }
}

function parsePage(file: ContentFile, issues: Issue[]): Page | undefined {
  if (file.text === undefined || !file.path.endsWith(".md")) return undefined
  const text = file.text
  const page: Page = {
    path: file.path,
    dir: dirname(file.path),
    name: stripMd(basename(file.path)),
    body: text,
    frontmatter: {},
    hasFrontmatter: text.startsWith("---\n") || text.startsWith("---\r\n"),
  }

  if (!page.hasFrontmatter) {
    if (/^\s+---\r?\n/.test(text)) {
      issues.push({
        level: "error",
        file: file.path,
        message: "frontmatter musí začínat `---` na úplně prvním řádku, jinak se nenačte",
      })
    }
    return page
  }

  try {
    const parsed = matter(text)
    page.frontmatter = parsed.data
    page.body = parsed.content
  } catch (error) {
    issues.push({
      level: "error",
      file: file.path,
      message: `frontmatter není platný YAML: ${(error as Error).message.split("\n")[0]}`,
    })
  }
  return page
}

function checkEntityFrontmatter(page: Page, issues: Issue[]) {
  const folder = page.path.split("/")[0]
  if (!ENTITY_FOLDERS.includes(folder) || isIndex(page.path)) return
  if (!page.hasFrontmatter) {
    issues.push({ level: "error", file: page.path, message: "chybí frontmatter s `title` a `typ`" })
    return
  }
  for (const key of ["title", "typ"]) {
    if (typeof page.frontmatter[key] !== "string" || page.frontmatter[key] === "") {
      issues.push({ level: "error", file: page.path, message: `chybí \`${key}\` ve frontmatteru` })
    }
  }
}

function checkDay(page: Page, issues: Issue[]) {
  if (dayNumber(page.path) === undefined) return
  const journey = page.frontmatter.journey as Record<string, unknown> | undefined
  for (const key of ["summary", "location"]) {
    if (typeof journey?.[key] !== "string" || journey[key] === "") {
      issues.push({
        level: "error",
        file: page.path,
        message: `chybí \`journey.${key}\` pro časovou osu na mapě cesty`,
      })
    }
  }
}

function sectionLinks(body: string, heading: string): string[] {
  const match = body.match(new RegExp(`^## ${heading}\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"))
  return match ? extractWikilinks(match[1]).map((target) => stripMd(basename(target))) : []
}

function checkQuests(pages: Page[], issues: Issue[]) {
  const quests = pages.filter((page) => page.path.startsWith("ukoly/") && !isIndex(page.path))
  const index = pages.find((page) => page.path === "ukoly/index.md")
  const indexed = new Set(
    index ? extractWikilinks(index.body).map((t) => stripMd(basename(t))) : [],
  )
  const activeSection = new Set(index ? sectionLinks(index.body, "Aktivní") : [])
  const doneSection = new Set(index ? sectionLinks(index.body, "Splněné") : [])

  for (const quest of quests) {
    const state = quest.frontmatter.stav
    if (typeof state !== "string" || !QUEST_STATES.includes(state)) {
      issues.push({
        level: "error",
        file: quest.path,
        message: `\`stav\` musí být jedno z: ${QUEST_STATES.join(", ")}`,
      })
      continue
    }

    const closed = CLOSED_QUEST_STATES.includes(state)
    const inDoneFolder = quest.path.startsWith("ukoly/splnene/")
    if (closed && !inDoneFolder) {
      issues.push({
        level: "error",
        file: quest.path,
        message: `úkol se stavem „${state}“ patří do \`ukoly/splnene/\``,
      })
    } else if (!closed && inDoneFolder) {
      issues.push({
        level: "error",
        file: quest.path,
        message: `úkol se stavem „${state}“ nepatří do \`ukoly/splnene/\``,
      })
    }

    if (!index) continue
    if (!indexed.has(quest.name)) {
      issues.push({ level: "error", file: quest.path, message: "úkol chybí v `ukoly/index.md`" })
    } else if (state === "aktivní" && !activeSection.has(quest.name)) {
      issues.push({
        level: "error",
        file: "ukoly/index.md",
        message: `aktivní úkol [[${quest.name}]] není v sekci „Aktivní“`,
      })
    } else if (closed && !doneSection.has(quest.name)) {
      issues.push({
        level: "error",
        file: "ukoly/index.md",
        message: `uzavřený úkol [[${quest.name}]] není v sekci „Splněné“`,
      })
    } else if (!closed && doneSection.has(quest.name)) {
      issues.push({
        level: "error",
        file: "ukoly/index.md",
        message: `[[${quest.name}]] je v sekci „Splněné“, ale má stav „${state}“`,
      })
    }
  }
}

function checkFolderIndexes(pages: Page[], issues: Issue[]) {
  for (const index of pages.filter((page) => isIndex(page.path) && page.dir !== "")) {
    if (!ENTITY_FOLDERS.includes(index.dir.split("/")[0]) || index.dir === "ukoly") continue
    const listed = new Set(extractWikilinks(index.body).map((target) => stripMd(basename(target))))
    const members = pages.filter(
      (page) =>
        !isIndex(page.path) && page.dir.startsWith(index.dir) && dayNumber(page.path) === undefined,
    )
    for (const member of members) {
      const nested =
        pages.some((page) => page.path === `${member.dir}/index.md`) && member.dir !== index.dir
      if (!nested && !listed.has(member.name)) {
        issues.push({
          level: "warning",
          file: member.path,
          message: `stránka není uvedená v \`${index.path}\``,
        })
      }
    }
  }
}

function checkDiaryIndex(pages: Page[], days: number[], issues: Issue[]) {
  const diaryIndex = pages.find((page) => page.path === "denik/index.md")
  if (diaryIndex) {
    const listed = new Set(extractWikilinks(diaryIndex.body))
    for (const day of days) {
      if (!listed.has(`${day}. den`)) {
        issues.push({
          level: "error",
          file: diaryIndex.path,
          message: `chybí položka pro [[${day}. den]]`,
        })
      }
    }
  }

  const home = pages.find((page) => page.path === "index.md")
  const latest = days.at(-1)
  const lastDayLine = home?.body.match(/Poslední zapsaný den:\s*\[\[(\d+)\. den/)
  if (home && latest !== undefined && lastDayLine && Number(lastDayLine[1]) !== latest) {
    issues.push({
      level: "error",
      file: home.path,
      message: `„Poslední zapsaný den“ ukazuje na ${lastDayLine[1]}. den, ale nejnovější je ${latest}. den`,
    })
  }
}

function checkJourneyMap(pages: Page[], files: ContentFile[], days: number[], issues: Issue[]) {
  const page = pages.find((candidate) => candidate.path === JOURNEY_PAGE)
  if (!page) return

  const raw = (page.frontmatter.journeyMap as { stops?: unknown[] } | undefined)?.stops ?? []
  const map = getJourneyMap(page.frontmatter)
  if (map.stops.length !== raw.length) {
    issues.push({
      level: "error",
      file: page.path,
      message: `${raw.length - map.stops.length} zastávek je neplatných nebo mají duplicitní \`id\` a mapa je nezobrazí`,
    })
  }

  const paths = new Set(files.map((file) => file.path))
  if (map.image && !paths.has(`${page.dir}/${map.image}`)) {
    issues.push({
      level: "error",
      file: page.path,
      message: `obrázek mapy ${map.image} neexistuje`,
    })
  }

  const daySet = new Set(days)
  for (const stop of map.stops) {
    if (!paths.has(`${page.dir}/${stop.icon}`)) {
      issues.push({
        level: "error",
        file: page.path,
        message: `ikona ${stop.icon} zastávky „${stop.id}“ neexistuje`,
      })
    }
    if (!daySet.has(stop.day)) {
      issues.push({
        level: "error",
        file: page.path,
        message: `zastávka „${stop.id}“ odkazuje na neexistující ${stop.day}. den`,
      })
    }
  }

  const mappedDays = new Set([
    ...map.stops.map((stop) => stop.day),
    ...map.segments.map((s) => s.day),
  ])
  const missing = days.filter((day) => !mappedDays.has(day))
  if (missing.length > 0) {
    issues.push({
      level: "warning",
      file: page.path,
      message: `bez zastávky ani trasy na mapě: ${missing.map((day) => `${day}. den`).join(", ")}`,
    })
  }
}

function proseWithoutCode(body: string): string {
  let fence = ""
  return body
    .replace(/<!--[\s\S]*?-->/g, " ")
    .split("\n")
    .map((line) => {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/)
      if (fence) {
        if (
          marker &&
          marker[1][0] === fence[0] &&
          marker[1].length >= fence.length &&
          !marker[2].trim()
        )
          fence = ""
        return ""
      }
      if (marker) {
        fence = marker[1]
        return ""
      }
      return /^(?: {4}|\t)/.test(line) ? "" : line
    })
    .join("\n")
    .replace(/(`+)[\s\S]*?\1/g, " ")
}

function checkLinkWarnings(pages: Page[], issues: Issue[]) {
  const entities = pages.filter((page) => isEntityPage({ slug: stripMd(page.path) as FullSlug }))
  const aliases = (page: Page): string[] =>
    Array.isArray(page.frontmatter.aliases)
      ? page.frontmatter.aliases.filter((alias): alias is string => typeof alias === "string")
      : []
  const names = (page: Page) => [page.name, ...aliases(page)]
  const outgoing = new Map(
    pages.map((page) => {
      const body = proseWithoutCode(page.body)
      const targets = [...extractWikilinks(body)]
      for (const match of body.matchAll(/!?\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+[^)]*)?\)/g)) {
        try {
          targets.push(decodeURIComponent(match[1]).split("#")[0])
        } catch {}
      }
      for (const definition of body.matchAll(/^ {0,3}\[([^\]]+)\]:\s*<?([^\s>]+)>?/gm)) {
        const reference = definition[1].toLocaleLowerCase()
        const prose = body.replace(/^ {0,3}\[[^\]]+\]:.*$/gm, "")
        const used = [...prose.matchAll(/(?<!!)\[([^\]]+)\](?:\[([^\]]*)\])?/g)].some(
          (match) => (match[2] || match[1]).toLocaleLowerCase() === reference,
        )
        if (used) {
          try {
            targets.push(decodeURIComponent(definition[2]).split("#")[0])
          } catch {}
        }
      }
      const linked = new Set<Page>()
      for (const target of targets) {
        if (!target || /^(?:[a-z]+:|#)/i.test(target)) continue
        const normalized = stripMd(target.replace(/^\//, ""))
        const relative = posix.normalize(`${page.dir}/${normalized}`)
        const exact =
          pages.find((candidate) => stripMd(candidate.path) === relative) ??
          pages.find((candidate) => stripMd(candidate.path) === normalized)
        if (exact) linked.add(exact)
        else {
          const matches = pages.filter((candidate) => names(candidate).includes(normalized))
          if (matches.length === 1) linked.add(matches[0])
        }
      }
      return [page, linked] as const
    }),
  )
  const candidates = entities
    .flatMap((entity) =>
      [...new Set([entity.frontmatter.title, ...aliases(entity)])]
        .filter((name): name is string => typeof name === "string" && [...name].length >= 4)
        .map((name) => ({ entity, name })),
    )
    .sort((a, b) => b.name.length - a.name.length)
  for (const page of pages.filter(
    (page) => /^denik\/[^/]+\.md$/.test(page.path) && !isIndex(page.path),
  )) {
    const text = proseWithoutCode(page.body)
      .replace(/!?\[\[[^\]]*\]\]/g, " ")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/(?:[a-z][a-z\d+.-]*:\/\/|www\.)[^\s<>]+/gi, " ")
      .replace(/<[^>]*>/g, " ")
    const occupied: [number, number][] = []
    const mentioned = new Set<Page>()
    for (const { entity, name } of candidates) {
      let start = text.indexOf(name)
      while (start !== -1) {
        const end = start + name.length
        const before = [...text.slice(0, start)].at(-1) ?? ""
        const after = [...text.slice(end)][0] ?? ""
        if (
          !/[\p{L}\p{N}\p{M}_]/u.test(before) &&
          !/[\p{L}\p{N}\p{M}_]/u.test(after) &&
          !occupied.some(([a, b]) => start < b && end > a)
        ) {
          occupied.push([start, end])
          mentioned.add(entity)
        }
        start = text.indexOf(name, end)
      }
    }
    for (const entity of mentioned) {
      if (!outgoing.get(page)?.has(entity))
        issues.push({
          level: "warning",
          file: page.path,
          message: `zmiňuje „${entity.frontmatter.title}“ bez odkazu`,
        })
    }
  }
  for (const entity of entities) {
    const incoming = pages.some(
      (page) =>
        page !== entity &&
        page.path !== `${entity.dir}/index.md` &&
        outgoing.get(page)?.has(entity),
    )
    if (!incoming)
      issues.push({
        level: "warning",
        file: entity.path,
        message: "na stránku neodkazuje žádný deník ani jiná stránka",
      })
  }
}

export function checkContent(files: ContentFile[]): Issue[] {
  const issues: Issue[] = []
  const pages = files
    .map((file) => parsePage(file, issues))
    .filter((page): page is Page => page !== undefined)
  const resolver = new LinkResolver(files, pages)
  const days = pages
    .map((page) => dayNumber(page.path))
    .filter((day): day is number => day !== undefined)
    .sort((first, second) => first - second)

  for (const page of pages) {
    checkEntityFrontmatter(page, issues)
    checkDay(page, issues)
    if (page.frontmatter.typ === "npc") {
      for (const [key, values] of [
        ["stav", npcStates],
        ["vztah", npcRelations],
      ] as const) {
        if (!npcCategory(values, page.frontmatter[key])) {
          issues.push({
            level: "error",
            file: page.path,
            message: `\`${key}\` NPC musí být jedno z: ${Object.keys(values).join(", ")}`,
          })
        }
      }
    }
    for (const target of new Set(extractWikilinks(page.body))) {
      if (!resolver.resolves(target, page.dir)) {
        issues.push({ level: "error", file: page.path, message: `nefunkční odkaz [[${target}]]` })
      }
    }
  }

  checkLinkWarnings(pages, issues)
  checkQuests(pages, issues)
  checkFolderIndexes(pages, issues)
  checkDiaryIndex(pages, days, issues)
  checkJourneyMap(pages, files, days, issues)
  return issues
}
