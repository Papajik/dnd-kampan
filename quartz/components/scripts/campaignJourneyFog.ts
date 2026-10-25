import { getFogReveal } from "../campaignJourneyFog"
import type { JourneyMap } from "../campaignJourneyModel"

export function createJourneyFog(
  stage: HTMLElement,
  map: Pick<JourneyMap, "width" | "height" | "stops" | "segments" | "fog">,
  reducedMotion: MediaQueryList,
) {
  const canvas = document.createElement("canvas")
  canvas.className = "campaign-journey-fog"
  canvas.setAttribute("aria-hidden", "true")
  canvas.width = Math.ceil(map.width / 2)
  canvas.height = Math.ceil(map.height / 2)
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
      const radius = 25 + Math.random() * 100
      const brush = mist.createRadialGradient(x, y, 0, x, y, radius)
      brush.addColorStop(0, i % 2 ? "#a1835930" : "#110e0d40")
      brush.addColorStop(1, "transparent")
      mist.fillStyle = brush
      mist.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }
  }
  let frame = 0
  let selectedDay = 1
  let lastDraw = ""
  const draw = (day: number, value: number) => {
    selectedDay = day
    const key = `${day}:${value}`
    if (!context || key === lastDraw) return
    lastDraw = key
    const reveal = getFogReveal(map, day, value)
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.globalCompositeOperation = "source-over"
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(texture, 0, 0)
    context.scale(canvas.width / map.width, canvas.height / map.height)
    context.globalCompositeOperation = "destination-out"
    for (const points of reveal.corridors) {
      // Nested strokes form a soft 130px corridor without a live blur filter.
      for (let width = 130; width >= 50; width -= 10) {
        context.strokeStyle = width === 50 ? "#000" : "#0003"
        context.lineWidth = width
        context.lineCap = "round"
        context.lineJoin = "round"
        context.beginPath()
        points.forEach(([x, y], i) => (i ? context.lineTo(x, y) : context.moveTo(x, y)))
        context.stroke()
      }
    }
    for (const {
      center: [x, y],
      radius,
      opacity,
    } of reveal.circles) {
      const brush = context.createRadialGradient(x, y, radius * 0.4, x, y, radius)
      brush.addColorStop(0, `rgba(0,0,0,${opacity})`)
      brush.addColorStop(1, "transparent")
      context.fillStyle = brush
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }
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
    setEnabled(enabled: boolean) {
      canvas.style.opacity = enabled ? "0.6" : "0"
    },
    dispose() {
      cancel()
      canvas.remove()
    },
  }
}
