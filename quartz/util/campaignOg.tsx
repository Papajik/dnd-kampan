import { readFileSync } from "node:fs"
import { campaignVisual } from "./campaignOgAssets"
import { known, pageIntro, profileSummary, shorten } from "./campaignDescription"
import { npcCategory, npcStates, npcRelations } from "../components/npcStatusModel"
import { getPageType } from "../components/pageTypeModel"
import { SocialImageOptions } from "./og"
import { getFontSpecificationName } from "./theme"

const background = `data:image/jpeg;base64,${readFileSync("quartz/static/og-background.jpg").toString("base64")}`

const parchment = "#f5eedc"
const parchmentMuted = "#d9ccb2"
const gold = "#c9a24a"

const typeLabels: Record<string, string> = {
  npc: "NPC",
  bestiář: "Bestiář",
  postava: "Postava družiny",
}

/** Social preview: campaign map with a dark parchment-toned overlay and the page title. */
export const campaignImage: SocialImageOptions["imageStructure"] = async ({
  cfg,
  title,
  description,
  fileData,
  allFiles = [],
  contentDir = "content",
}) => {
  const headerFont = getFontSpecificationName(cfg.theme.typography.header)
  const bodyFont = getFontSpecificationName(cfg.theme.typography.body)
  const isHome = title === cfg.pageTitle
  const frontmatter = fileData.frontmatter as Record<string, unknown> | undefined
  const journey = frontmatter?.journey as { summary?: unknown; location?: unknown } | undefined
  const typeLabel = typeLabels[String(frontmatter?.typ)]
  const visual = await campaignVisual(fileData, allFiles, contentDir)
  const intro = fileData.htmlAst ? pageIntro(fileData.htmlAst) : undefined
  const subtitle =
    typeof journey?.summary === "string"
      ? journey.summary
      : visual && intro
        ? shorten(intro)
        : ((fileData.htmlAst && profileSummary(fileData.slug ?? "", fileData.htmlAst)) ??
          typeLabel ??
          description)
  const badge =
    getPageType(fileData.slug ?? "") === "npc"
      ? [
          npcCategory(npcStates, frontmatter?.stav) && frontmatter?.stav,
          npcCategory(npcRelations, frontmatter?.vztah) && frontmatter?.vztah,
        ]
          .filter(known)
          .join(" · ")
      : typeof journey?.location === "string"
        ? journey.location
        : ""

  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%" }}>
      <img src={background} width={1200} height={630} style={{ position: "absolute" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          width: "100%",
          height: "100%",
          padding: "64px 72px",
          backgroundImage:
            "linear-gradient(90deg, rgba(27, 22, 17, 0.94) 0%, rgba(27, 22, 17, 0.82) 55%, rgba(27, 22, 17, 0.35) 100%)",
          fontFamily: bodyFont,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: headerFont,
            fontSize: 30,
            color: gold,
            letterSpacing: 2,
          }}
        >
          {isHome ? cfg.baseUrl : cfg.pageTitle}
        </div>
        <div
          style={{
            display: "flex",
            width: 120,
            height: 2,
            backgroundColor: gold,
            margin: "24px 0",
          }}
        />
        <h1
          style={{
            margin: 0,
            fontFamily: headerFont,
            fontWeight: 700,
            fontSize: visual ? (title.length > 28 ? 48 : 58) : title.length > 28 ? 64 : 76,
            lineHeight: 1.15,
            color: parchment,
            maxWidth: visual ? 590 : 900,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            marginTop: 28,
            fontSize: visual ? 28 : 32,
            lineHeight: 1.4,
            color: parchmentMuted,
            maxWidth: visual ? 590 : 820,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
          }}
        >
          {subtitle}
        </p>
        {badge && (
          <div style={{ display: "flex", color: gold, fontSize: 24, maxWidth: visual ? 590 : 820 }}>
            {shorten(badge, 100)}
          </div>
        )}
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontSize: 26,
            color: parchmentMuted,
          }}
        >
          {isHome ? "Kronika družiny z Glensdale" : cfg.baseUrl}
        </div>
      </div>
      {visual && (
        <img
          src={visual}
          width={400}
          height={getPageType(fileData.slug ?? "") === "denik" ? 400 : 410}
          style={{
            position: "absolute",
            right: 64,
            top: 150,
            border: `2px solid ${gold}`,
            borderRadius: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        />
      )}
    </div>
  )
}
