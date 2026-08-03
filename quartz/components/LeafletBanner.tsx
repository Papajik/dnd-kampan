import { readFileSync } from "node:fs"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

const bannerSvg = readFileSync("quartz/plugins/assets/leaflet-medieval-banner.svg", "utf8")

const LeafletBanner: QuartzComponent = () => null

LeafletBanner.afterDOMLoaded = `
const leafletMedievalBanner = ${JSON.stringify(bannerSvg)}

document.addEventListener("nav", () => {
  const installBannerIcon = () => {
    if (!document.querySelector(".leaflet-map")) return
    if (!window.L) {
      window.setTimeout(installBannerIcon, 0)
      return
    }
    if (window.L.medievalBannerIconInstalled) return

    const originalMarker = window.L.marker
    window.L.marker = (coordinates, options = {}) => {
      const originalHtml = options.icon?.options?.html
      if (typeof originalHtml !== "string" || !originalHtml.includes("leaflet-marker-pin")) {
        return originalMarker(coordinates, options)
      }

      const template = document.createElement("template")
      template.innerHTML = originalHtml
      const colour = template.content.querySelector(".leaflet-marker-pin")?.style.fill || "#5d4631"
      const icon = template.content.querySelector("[data-lucide]")?.getAttribute("data-lucide") || "shield"
      const bannerIcon = window.L.divIcon({
        className: "leaflet-marker-icon leaflet-medieval-marker",
        html: '<a class="leaflet-medieval-banner" style="--banner-color:' + colour + '">' + leafletMedievalBanner + '<i data-lucide="' + icon + '"></i></a>',
        iconSize: [50, 69],
        iconAnchor: [25, 69],
        tooltipAnchor: [17, -42],
      })

      return originalMarker(coordinates, { ...options, icon: bannerIcon })
    }
    window.L.medievalBannerIconInstalled = true
  }

  installBannerIcon()
})
`

export default (() => LeafletBanner) satisfies QuartzComponentConstructor
