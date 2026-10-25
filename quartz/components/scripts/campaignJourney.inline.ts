import { fitToBox, journeyBounds } from "../campaignJourneyCamera"
import { createJourneyCamera } from "./campaignJourneyCamera"
import {
  getReplayDays,
  replayDuration,
  stopRouteProgress,
  type JourneyDay,
  type JourneyStop,
  type JourneySegment,
} from "../campaignJourneyModel"

document.addEventListener("nav", () => {
  const root = document.querySelector<HTMLElement>(".campaign-journey")
  if (!root) return
  const journey = root
  const stage = journey.querySelector<HTMLElement>(".campaign-journey-stage")!
  const viewport = journey.querySelector<HTMLElement>(".campaign-journey-viewport")!
  const route = journey.querySelector<SVGSVGElement>(".campaign-journey-route")!
  const slider = journey.querySelector<HTMLInputElement>('input[type="range"]')!
  const playButton = journey.querySelector<HTMLButtonElement>('[data-action="play"]')!
  const legend = journey.querySelector<HTMLElement>(".campaign-journey-legend")!
  const eventContent = journey.querySelector<HTMLElement>(".campaign-journey-event-content")!
  const data = JSON.parse(journey.dataset.journey!) as {
    days: JourneyDay[]
    stops: JourneyStop[]
    segments: JourneySegment[]
  }
  if (!data.days.length) return
  const map = { width: Number(journey.dataset.mapWidth), height: Number(journey.dataset.mapHeight) }
  const view = () => ({ width: viewport.clientWidth, height: viewport.clientHeight })
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
  const controller = new AbortController()
  const { signal } = controller
  const listen = (
    target: EventTarget | Document,
    event: string,
    handler: EventListener,
    options: AddEventListenerOptions = {},
  ) => target.addEventListener(event, handler, { ...options, signal })
  let replayFrame = 0
  let resizeTimer = 0
  let selectedIndex = Number(slider.value)
  let playing = false
  let elapsed = 0
  let replayLastTime = 0
  let replayReady = false
  const animations = new Set<Animation>()
  const paths = Array.from(route.querySelectorAll<SVGPolylineElement>("polyline[data-day]"))
  const lengths = paths.map((path) => path.getTotalLength())
  const replayDays = getReplayDays(data.days, data)
  const stopProgress = new Map(
    data.stops.map((stop) => [
      stop.id,
      stopRouteProgress(
        stop.coordinates,
        data.segments.filter((segment) => segment.day === stop.day),
      ),
    ]),
  )
  const svgNS = "http://www.w3.org/2000/svg"
  const defs = document.createElementNS(svgNS, "defs")
  route.prepend(defs)
  const reveals = paths.map((path, index) => {
    const mask = document.createElementNS(svgNS, "mask")
    mask.id = `journey-reveal-${index}`
    mask.setAttribute("maskUnits", "userSpaceOnUse")
    mask.setAttribute("x", "-20")
    mask.setAttribute("y", "-20")
    mask.setAttribute("width", String(map.width + 40))
    mask.setAttribute("height", String(map.height + 40))
    const line = document.createElementNS(svgNS, "polyline")
    line.setAttribute("points", path.getAttribute("points")!)
    line.setAttribute("class", "campaign-journey-reveal")
    mask.append(line)
    defs.append(mask)
    path.setAttribute("mask", `url(#${mask.id})`)
    return line
  })
  const token = document.createElement("div")
  token.className = "campaign-journey-token"
  token.setAttribute("role", "img")
  token.ariaLabel = "Poloha družiny"
  stage.append(token)

  const animate = (element: Element, frames: Keyframe[], duration: number) => {
    if (reducedMotion.matches) return
    const animation = element.animate(frames, { duration, easing: "ease-in-out" })
    animations.add(animation)
    animation.onfinish = () => animations.delete(animation)
    animation.oncancel = () => animations.delete(animation)
  }
  const camera = createJourneyCamera(viewport, stage, map, reducedMotion, signal, () => interrupt())
  const moveCamera = camera.move
  const zoom = camera.zoom
  const fit = (day?: number, smooth = true) => {
    const box = journeyBounds(data.stops, data.segments, day)
    if (box)
      moveCamera(fitToBox(box, view(), map, Math.min(65, viewport.clientWidth * 0.12)), smooth)
  }
  const positionToken = (pathIndex: number, distance: number) => {
    const point = paths[pathIndex]?.getPointAtLength(distance)
    token.hidden = !point
    if (point) {
      token.style.left = `${point.x}px`
      token.style.top = `${point.y}px`
    }
  }
  const restToken = () => {
    const day = data.days[selectedIndex].day
    const index = paths.findLastIndex((path) => Number(path.dataset.day) <= day)
    token.hidden = index < 0
    if (index >= 0) positionToken(index, lengths[index])
  }
  const pause = () => {
    playing = false
    cancelAnimationFrame(replayFrame)
    playButton.textContent = "▶"
    playButton.ariaLabel = "Přehrát cestu"
    playButton.setAttribute("aria-pressed", "false")
  }
  const interrupt = () => {
    pause()
    replayReady = false
    restToken()
    journey.querySelectorAll(".is-waiting").forEach((pin) => pin.classList.remove("is-waiting"))
  }
  const chooseStop = (stop: JourneyStop) => {
    interrupt()
    const index = data.days.findIndex((day) => day.day === stop.day)
    if (index < 0) return
    selectDay(index, false, stop.id)
    const [x, y] = stop.coordinates
    moveCamera(fitToBox({ left: x, right: x, top: y, bottom: y }, view(), map))
  }
  data.stops.forEach((stop) => {
    const pin = document.createElement("button")
    pin.className = "campaign-journey-pin"
    pin.type = "button"
    pin.dataset.stopId = stop.id
    pin.dataset.day = String(stop.day)
    pin.style.left = `${stop.coordinates[0]}px`
    pin.style.top = `${stop.coordinates[1]}px`
    pin.ariaLabel = `${stop.label}, den ${stop.day}`
    const icon = document.createElement("img")
    icon.src = stop.icon
    icon.alt = ""
    const order = document.createElement("span")
    order.textContent = String(stop.order)
    const tooltip = document.createElement("small")
    tooltip.className = "campaign-journey-tooltip"
    tooltip.textContent = stop.label
    pin.append(icon, order, tooltip)
    stage.append(pin)
  })

  function selectDay(index: number, focus = true, stopId?: string, updateHash = true) {
    const day = data.days[index]
    if (!day) return
    const changed = selectedIndex !== index
    selectedIndex = index
    slider.value = String(index)
    journey.querySelector(".campaign-journey-event-day")!.textContent = String(day.day)
    const link = journey.querySelector<HTMLAnchorElement>(".campaign-journey-event h2 a")!
    link.textContent = day.title
    link.href = day.href
    journey.querySelector(".campaign-journey-event-summary")!.textContent = day.summary
    journey.querySelector(".campaign-journey-event-location")!.textContent =
      day.location ?? "Poloha na mapě zatím není určená."
    const list = journey.querySelector(".campaign-journey-event-stops")!
    list.replaceChildren()
    const stops = data.stops.filter((stop) => stop.day === day.day)
    if (!stops.length) {
      const item = document.createElement("li")
      item.textContent = "Pro tento den zatím nejsou na mapě zastávky."
      list.append(item)
    }
    stops.forEach((stop) => {
      const item = document.createElement("li")
      const button = document.createElement("button")
      button.type = "button"
      button.dataset.stopId = stop.id
      button.textContent = stop.label
      item.append(button)
      list.append(item)
    })
    journey.querySelector<HTMLDetailsElement>(".campaign-journey-event")!.open = true
    journey
      .querySelectorAll<HTMLElement>("[data-day]")
      .forEach((element) =>
        element.classList.toggle("is-active", Number(element.dataset.day) === day.day),
      )
    paths.forEach((path, i) => {
      const n = Number(path.dataset.day)
      path.classList.toggle("is-past", n < day.day)
      path.classList.toggle("is-current", n === day.day)
      path.classList.toggle("is-future", n > day.day)
      reveals[i].getAnimations().forEach((animation) => animation.cancel())
      if (n === day.day && !reducedMotion.matches)
        animate(
          reveals[i],
          [
            { strokeDasharray: `${lengths[i]} ${lengths[i]}`, strokeDashoffset: lengths[i] },
            { strokeDasharray: `${lengths[i]} ${lengths[i]}`, strokeDashoffset: 0 },
          ],
          850,
        )
    })
    journey.querySelectorAll<HTMLElement>("[data-stop-id]").forEach((element) => {
      const stop = data.stops.find((stop) => stop.id === element.dataset.stopId)!
      const wasFuture = element.classList.contains("is-future")
      element.classList.toggle("is-past", stop.day < day.day)
      element.classList.toggle("is-current", stop.day === day.day)
      element.classList.toggle("is-future", stop.day > day.day)
      element.classList.toggle("is-active", stop.id === stopId)
      element.setAttribute("aria-current", stop.day === day.day ? "true" : "false")
      if (wasFuture && stop.day <= day.day && element.classList.contains("campaign-journey-pin"))
        animate(
          element,
          [
            { transform: "translate(-50%, -50%) scale(.6)" },
            { transform: "translate(-50%, -50%) scale(1)" },
          ],
          350,
        )
    })
    // Move only the legend's scrollport; scrollIntoView also moves outer page ancestors.
    const first = legend.querySelector<HTMLElement>(`[data-day="${day.day}"]`)
    if (first) {
      const row = first.getBoundingClientRect(),
        container = legend.getBoundingClientRect()
      if (row.top < container.top) legend.scrollTop += row.top - container.top
      else if (row.bottom > container.bottom) legend.scrollTop += row.bottom - container.bottom
    }
    if (changed)
      animate(
        eventContent,
        [
          { opacity: 0, transform: "translateY(5px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        220,
      )
    if (updateHash) history.replaceState(history.state, "", `#den-${day.day}`)
    if (focus) fit(day.day)
    restToken()
  }

  const dayPathIndices = () =>
    paths.flatMap((path, i) =>
      Number(path.dataset.day) === data.days[selectedIndex].day ? [i] : [],
    )
  const updateWalk = (progress: number) => {
    const indices = dayPathIndices()
    const total = indices.reduce((sum, i) => sum + lengths[i], 0)
    let distance = total * progress
    for (const i of indices) {
      if (distance <= lengths[i] || i === indices.at(-1)) {
        positionToken(i, distance)
        break
      }
      distance -= lengths[i]
    }
    journey.querySelectorAll<HTMLElement>(".campaign-journey-pin.is-current").forEach((pin) => {
      const completed = progress >= (stopProgress.get(pin.dataset.stopId!) ?? 0)
      const waiting = pin.classList.contains("is-waiting")
      pin.classList.toggle("is-waiting", !completed)
      if (waiting && completed)
        animate(
          pin,
          [
            { transform: "translate(-50%, -50%) scale(.6)" },
            { transform: "translate(-50%, -50%) scale(1)" },
          ],
          350,
        )
    })
  }
  const startDay = () => {
    elapsed = 0
    replayReady = true
    updateWalk(reducedMotion.matches ? 1 : 0)
  }
  const replayTick = (now: number) => {
    if (!playing) return
    elapsed += now - replayLastTime
    replayLastTime = now
    const total = dayPathIndices().reduce((sum, i) => sum + lengths[i], 0)
    const duration = replayDuration(total)
    updateWalk(reducedMotion.matches ? 1 : Math.min(1, elapsed / duration))
    if (elapsed >= duration) {
      const next = data.days.findIndex(
        (day, i) => i > selectedIndex && replayDays.includes(day.day),
      )
      if (next < 0) {
        pause()
        replayReady = false
        return
      }
      selectDay(
        next,
        paths.some((path) => Number(path.dataset.day) === data.days[next].day),
      )
      startDay()
    }
    replayFrame = requestAnimationFrame(replayTick)
  }
  const togglePlay = () => {
    if (playing) {
      pause()
      return
    }
    if (!replayDays.length) return
    if (!replayReady) {
      if (selectedIndex === data.days.length - 1)
        selectDay(data.days.findIndex((day) => day.day === replayDays[0]))
      else if (dayPathIndices().length) fit(data.days[selectedIndex].day)
      startDay()
    }
    playing = true
    playButton.textContent = "❚❚"
    playButton.ariaLabel = "Pozastavit"
    playButton.setAttribute("aria-pressed", "true")
    replayLastTime = performance.now()
    replayFrame = requestAnimationFrame(replayTick)
  }
  listen(journey, "click", ((event: MouseEvent) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("button")
    if (!button) return
    const stop = data.stops.find((stop) => stop.id === button.dataset.stopId)
    if (stop) {
      chooseStop(stop)
      return
    }
    const action = button.dataset.action
    if (action === "play") {
      togglePlay()
      return
    }
    if (action === "zoom-in" || action === "zoom-out") {
      zoom(action === "zoom-in" ? 1.2 : 1 / 1.2, [
        viewport.clientWidth / 2,
        viewport.clientHeight / 2,
      ])
      return
    }
    if (action === "reset") {
      interrupt()
      fit()
      return
    }
    const index = button.dataset.day
      ? data.days.findIndex((day) => day.day === Number(button.dataset.day))
      : action === "previous-day"
        ? Math.max(0, selectedIndex - 1)
        : action === "next-day"
          ? Math.min(data.days.length - 1, selectedIndex + 1)
          : -1
    if (index >= 0) {
      interrupt()
      selectDay(index)
    }
  }) as EventListener)
  listen(slider, "input", () => {
    interrupt()
    selectDay(Number(slider.value))
  })
  const markerToggle = journey.querySelector<HTMLInputElement>(
    '[data-action="toggle-marker-mode"]',
  )!
  listen(markerToggle, "change", () => {
    journey.dataset.markerMode = markerToggle.checked ? "icon" : "number"
  })
  listen(document, "keydown", ((event: KeyboardEvent) => {
    const target = event.target as HTMLElement
    if (
      event.code !== "Space" ||
      event.repeat ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      target.closest("input, textarea, select, button, a, summary, [contenteditable]")
    )
      return
    event.preventDefault()
    togglePlay()
  }) as EventListener)
  const fromHash = () => {
    const match = location.hash.match(/^#den-(\d+)$/)
    const index = match ? data.days.findIndex((day) => day.day === Number(match[1])) : -1
    if (index >= 0) {
      interrupt()
      selectDay(index, true, undefined, false)
    }
  }
  listen(window, "hashchange", fromHash)
  listen(window, "resize", () => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => fit(), 150)
  })
  listen(reducedMotion, "change", () => {
    animations.forEach((animation) => animation.cancel())
    animations.clear()
    if (reducedMotion.matches && playing) updateWalk(1)
  })
  stage.style.width = `${map.width}px`
  stage.style.height = `${map.height}px`
  fit(undefined, false)
  selectDay(selectedIndex, false, undefined, false)
  fromHash()
  window.addCleanup(() => {
    controller.abort()
    camera.dispose()
    cancelAnimationFrame(replayFrame)
    clearTimeout(resizeTimer)
    animations.forEach((animation) => animation.cancel())
    defs.remove()
    token.remove()
    stage.querySelectorAll(".campaign-journey-pin").forEach((pin) => pin.remove())
  })
})
