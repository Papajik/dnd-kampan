import assert from "node:assert/strict"
import { test } from "node:test"
import { mkdtemp, mkdir, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import sharp from "sharp"
import type { QuartzPluginData } from "../plugins/vfile"
import { campaignVisual } from "./campaignOgAssets"

const file = (slug: string, data: Partial<QuartzPluginData> = {}) =>
  ({ slug, ...data }) as QuartzPluginData

test("local WebP portraits and map crops produce cached PNG data URLs", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "campaign-og-"))
  try {
    await mkdir(path.join(directory, "_assets"))
    await mkdir(path.join(directory, "map"))
    await sharp({ create: { width: 600, height: 800, channels: 3, background: "red" } })
      .webp()
      .toFile(path.join(directory, "_assets", "Portrét gnóma.webp"))
    await sharp({ create: { width: 1600, height: 1200, channels: 3, background: "white" } })
      .jpeg()
      .toFile(path.join(directory, "map", "map.jpeg"))
    const portrait = file("postavy/Feldon", {
      htmlAst: {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "img",
            properties: {
              src: "../_assets/Portrét-gnóma.webp",
            },
            children: [],
          },
        ],
      },
    })
    const url = await campaignVisual(portrait, [], directory)
    assert.ok(url)
    assert.ok(url.startsWith("data:image/png;base64,"))
    const metadata = await sharp(Buffer.from(url.split(",")[1], "base64")).metadata()
    assert.equal(metadata.width, 400)
    assert.equal(metadata.height, 410)
    assert.equal(await campaignVisual(portrait, [], directory), url)
    const map = file("map/cesta-druziny", {
      frontmatter: {
        title: "Mapa",
        tags: [],
        journeyMap: {
          image: "map.jpeg",
          width: 1600,
          height: 1200,
          segments: [
            {
              day: 5,
              points: [
                [800, 600],
                [900, 650],
              ],
            },
          ],
        },
      },
    })
    const day = await campaignVisual(file("denik/5.-den"), [map], directory)
    assert.ok(day)
    assert.ok(day.startsWith("data:image/png;base64,"))
    const pixels = await sharp(Buffer.from(day.split(",")[1], "base64"))
      .raw()
      .toBuffer()
    assert.ok(
      pixels.some((pixel) => pixel < 250),
      "route should be visible on white map",
    )
    assert.equal(await campaignVisual(file("denik/1.-den"), [map], directory), undefined)
    portrait.htmlAst!.children[0] = {
      type: "element",
      tagName: "img",
      properties: { src: "https://example.com/portrait.webp" },
      children: [],
    }
    assert.equal(await campaignVisual(portrait, [], directory), undefined)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
