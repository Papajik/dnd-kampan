import { readdir, stat } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import { firstImage } from "../components/dayCastModel"
import { getPageType } from "../components/pageTypeModel"
import { getJourneyMap } from "../components/campaignJourneyModel"
import type { QuartzPluginData } from "../plugins/vfile"
import { slugifyFilePath, type FilePath } from "./path"
import { journeyCrop, journeyOverlay } from "./campaignOgModel"

const images = new Map<string, Promise<string>>()
const assetIndexes = new Map<string, Promise<Map<string, string>>>()

async function localImage(src: string, slug: string, directory: string) {
  const base = new URL(slug, "https://quartz.invalid/")
  const url = new URL(src, base)
  if (url.origin !== base.origin) return undefined
  let index = assetIndexes.get(directory)
  if (!index) {
    index = readdir(directory, { recursive: true }).then(
      (files) =>
        new Map(
          files.map((file) => [slugifyFilePath(file as FilePath), path.join(directory, file)]),
        ),
    )
    assetIndexes.set(directory, index)
  }
  return (await index).get(decodeURIComponent(url.pathname.slice(1)))
}

async function cachedImage(file: string, variant: string, render: () => Promise<Buffer>) {
  const metadata = await stat(file)
  const key = `${file}:${metadata.mtimeMs}:${metadata.size}:${variant}`
  let result = images.get(key)
  if (!result) {
    result = render().then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`)
    images.set(key, result)
  }
  return result
}

export async function campaignVisual(
  file: QuartzPluginData,
  allFiles: QuartzPluginData[],
  directory: string,
) {
  const slug = file.slug ?? ""
  const type = getPageType(slug)
  if (["npc", "postavy", "bestiar"].includes(type)) {
    const src = firstImage(file.htmlAst)
    const portrait = src ? await localImage(src, slug, directory) : undefined
    if (portrait)
      return cachedImage(portrait, "portrait", () =>
        sharp(portrait)
          .rotate()
          .resize(400, 410, { fit: "cover", position: "attention" })
          .png()
          .toBuffer(),
      )
  }
  const day = slug.match(/^denik\/(\d+)\.-den$/)?.[1]
  const mapFile = allFiles.find((page) => page.slug === "map/cesta-druziny")
  if (!day || !mapFile) return undefined
  const map = getJourneyMap(mapFile.frontmatter)
  const crop = journeyCrop(map, Number(day))
  if (!crop) return undefined
  const image = await localImage(map.image ?? "map.jpeg", mapFile.slug!, directory)
  if (!image) return undefined
  const overlay = journeyOverlay(map, Number(day), crop)
  return cachedImage(image, JSON.stringify(crop) + overlay, () =>
    sharp(image)
      .extract(crop)
      .resize(400, 400, { fit: "fill" })
      .composite([{ input: Buffer.from(overlay) }])
      .png()
      .toBuffer(),
  )
}
