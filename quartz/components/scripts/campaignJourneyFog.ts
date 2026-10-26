import { getFogReveal, type FogReveal } from "../campaignJourneyFog"
import type { JourneyMap } from "../campaignJourneyModel"

export function createJourneyFog(
  stage: HTMLElement,
  map: Pick<JourneyMap, "width" | "height" | "stops" | "segments" | "fog">,
  reducedMotion: MediaQueryList,
) {
  const canvas = document.createElement("canvas")
  canvas.className = "campaign-journey-fog"
  canvas.setAttribute("aria-hidden", "true")
  // The fog is a soft blur, so a quarter-resolution canvas looks the same and is far cheaper on phones.
  canvas.width = Math.ceil(map.width / 4)
  canvas.height = Math.ceil(map.height / 4)
  stage.insertBefore(canvas, stage.querySelector(".campaign-journey-route"))
  const context = canvas.getContext("2d")
  const texture = document.createElement("canvas")
  texture.width = canvas.width
  texture.height = canvas.height
  const mist = texture.getContext("2d")
  if (mist) {
    mist.fillStyle = "#30251f"
    mist.fillRect(0, 0, texture.width, texture.height)
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * texture.width,
        y = Math.random() * texture.height
      const radius = ((25 + Math.random() * 100) * texture.width) / 800
      const brush = mist.createRadialGradient(x, y, 0, x, y, radius)
      brush.addColorStop(0, i % 2 ? "#a1835930" : "#110e0d40")
      brush.addColorStop(1, "transparent")
      mist.fillStyle = brush
      mist.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }
  }
  // Earlier days do not change while a day plays: cut them once into a cached base.
  const base = document.createElement("canvas")
  base.width = canvas.width
  base.height = canvas.height
  const baseContext = base.getContext("2d")
  let baseDay = 0
  let frame = 0
  let selectedDay = 1
  let selectedValue = 1
  let enabled = true
  let lastDraw = ""
  const cut = (
    target: CanvasRenderingContext2D,
    corridors: FogReveal["corridors"],
    circles: FogReveal["circles"],
  ) => {
    target.save()
    target.scale(canvas.width / map.width, canvas.height / map.height)
    target.globalCompositeOperation = "destination-out"
    for (const points of corridors) {
      // Nested strokes form a soft 130px corridor without a live blur filter.
      for (let width = 130; width >= 50; width -= 10) {
        target.strokeStyle = width === 50 ? "#000" : "#0003"
        target.lineWidth = width
        target.lineCap = "round"
        target.lineJoin = "round"
        target.beginPath()
        points.forEach(([x, y], i) => (i ? target.lineTo(x, y) : target.moveTo(x, y)))
        target.stroke()
      }
    }
    for (const {
      center: [x, y],
      radius,
      opacity,
    } of circles) {
      const brush = target.createRadialGradient(x, y, radius * 0.4, x, y, radius)
      brush.addColorStop(0, `rgba(0,0,0,${opacity})`)
      brush.addColorStop(1, "transparent")
      target.fillStyle = brush
      target.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }
    target.restore()
  }
  const draw = (day: number, value: number) => {
    selectedDay = day
    selectedValue = value
    const key = `${day}:${value}`
    if (!context || !baseContext || !enabled || key === lastDraw) return
    lastDraw = key
    const reveal = getFogReveal(map, day, value)
    if (baseDay !== day) {
      baseDay = day
      baseContext.clearRect(0, 0, base.width, base.height)
      baseContext.drawImage(texture, 0, 0)
      cut(
        baseContext,
        reveal.corridors.slice(0, reveal.pastCorridors),
        reveal.circles.filter((circle) => !circle.current),
      )
    }
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(base, 0, 0)
    cut(
      context,
      reveal.corridors.slice(reveal.pastCorridors),
      reveal.circles.filter((circle) => circle.current),
    )
  }
  const cancel = () => cancelAnimationFrame(frame)
  return {
    draw(day: number, value = 1) {
      cancel()
      draw(day, value)
    },
    select(day: number, smooth: boolean) {
      cancel()
      if (!smooth || reducedMotion.matches) {
        draw(day, 1)
        return
      }
      const start = performance.now()
      draw(day, 0)
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 800)
        draw(day, p * p * (3 - 2 * p))
        if (p < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    },
    finish() {
      cancel()
      draw(selectedDay, 1)
    },
    setEnabled(on: boolean) {
      enabled = on
      canvas.style.opacity = on ? "0.6" : "0"
      if (on) draw(selectedDay, selectedValue)
    },
    dispose() {
      cancel()
      canvas.remove()
    },
  }
}
