import { readFileSync } from "node:fs"
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
export const campaignImage: SocialImageOptions["imageStructure"] = ({
  cfg,
  title,
  description,
  fileData,
}) => {
  const headerFont = getFontSpecificationName(cfg.theme.typography.header)
  const bodyFont = getFontSpecificationName(cfg.theme.typography.body)
  const isHome = title === cfg.pageTitle
  const frontmatter = fileData.frontmatter as Record<string, unknown> | undefined
  const journey = frontmatter?.journey as { summary?: unknown } | undefined
  const typeLabel = typeLabels[String(frontmatter?.typ)]
  // Profile pages start with a table, so their generated description is unreadable
  const subtitle =
    typeof journey?.summary === "string" ? journey.summary : (typeLabel ?? description)

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
            fontSize: title.length > 28 ? 64 : 76,
            lineHeight: 1.15,
            color: parchment,
            maxWidth: 900,
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
            fontSize: 32,
            lineHeight: 1.4,
            color: parchmentMuted,
            maxWidth: 820,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
          }}
        >
          {subtitle}
        </p>
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
    </div>
  )
}
