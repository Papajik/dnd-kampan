import { fitToBox, journeyBounds } from "../campaignJourneyCamera"
import { createJourneyFog } from "./campaignJourneyFog"
import { createJourneyCamera } from "./campaignJourneyCamera"
import {
  getReplayDays,
  replayTimeline,
  revealDashArray,
  stopRouteProgress,
  type JourneyMap,
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
  const dayButtons = journey.querySelector<HTMLElement>(".campaign-journey-day-buttons")!
  const eventContent = journey.querySelector<HTMLElement>(".campaign-journey-event-content")!
  const data = JSON.parse(journey.dataset.journey!) as {
    fog?: JourneyMap["fog"]
    days: JourneyDay[]
    stops: JourneyStop[]
    segments: JourneySegment[]
  }
  if (!data.days.length) return
  const map = { width: Number(journey.dataset.mapWidth), height: Number(journey.dataset.mapHeight) }
  const narrow = () => viewport.clientWidth < 600
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
  const fog = createJourneyFog(stage, { ...map, ...data }, reducedMotion)
  const fogToggle = journey.querySelector<HTMLInputElement>('[data-action="toggle-fog"]')!
  try {
    fogToggle.checked = localStorage.getItem("campaign-journey-fog") !== "off"
  } catch {}
  const applyFog = () => {
    journey.dataset.fog = fogToggle.checked ? "on" : "off"
    fog.setEnabled(fogToggle.checked)
  }
  applyFog()
  listen(fogToggle, "change", () => {
    applyFog()
    try {
      localStorage.setItem("campaign-journey-fog", fogToggle.checked ? "on" : "off")
    } catch {}
  })
  let initialized = false
  let replayFrame = 0
  let resizeTimer = 0
  let selectedIndex = Number(slider.value)
  let playing = false
  let elapsed = 0
  let replayLastTime = 0
  let replayReady = false
  let timeline = replayTimeline(0, [])
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
  // Each route's own dash pattern, used to draw it progressively (see revealDashArray).
  const patterns = paths.map((path) =>
    getComputedStyle(path)
      .strokeDasharray.split(/[\s,]+/)
      .map(parseFloat)
      .filter((value) => value > 0),
  )
  const animate = (
    element: Element,
    frames: Keyframe[],
    duration: number,
    options: KeyframeAnimationOptions = {},
  ) => {
    if (reducedMotion.matches) return
    const animation = element.animate(frames, { duration, easing: "ease-in-out", ...options })
    animations.add(animation)
    animation.onfinish = () => animations.delete(animation)
    animation.oncancel = () => animations.delete(animation)
    return animation
  }
  const camera = createJourneyCamera(viewport, stage, map, reducedMotion, signal, () => interrupt())
  const moveCamera = camera.move
  const zoom = camera.zoom
  const fit = (day?: number, smooth = true) => {
    const box = journeyBounds(data.stops, data.segments, day)
    if (box)
      moveCamera(
        fitToBox(box, view(), map, narrow() ? 32 : Math.min(65, viewport.clientWidth * 0.12)),
        smooth,
      )
  }
  let drawFrame = 0
  const setReveal = (i: number, shown?: number) => {
    paths[i].classList.toggle("is-drawing", shown !== undefined)
    // A zero-length dash still paints a round cap, so a path not yet reached stays hidden.
    paths[i].style.visibility = shown !== undefined && shown <= 0 ? "hidden" : ""
    paths[i].style.strokeDasharray =
      shown === undefined ? "" : revealDashArray(patterns[i], lengths[i], shown).join(" ")
  }
  // Show the given paths one after another as a single stroke, up to `progress` of their length.
  const revealPaths = (indices: number[], progress: number) => {
    let distance = indices.reduce((sum, i) => sum + lengths[i], 0) * progress
    for (const i of indices) {
      setReveal(i, Math.max(0, Math.min(lengths[i], distance)))
      distance -= lengths[i]
    }
  }
  const cancelReveals = () => cancelAnimationFrame(drawFrame)
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
    fog.finish()
    paths.forEach((_, i) => setReveal(i))
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
    const stepForward = initialized && index === selectedIndex + 1
    const changed = selectedIndex !== index
    selectedIndex = index
    fog.select(day.day, stepForward)
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
    cancelReveals()
    paths.forEach((path, i) => {
      const n = Number(path.dataset.day)
      path.classList.toggle("is-past", n < day.day)
      path.classList.toggle("is-current", n === day.day)
      path.classList.toggle("is-future", n > day.day)
      setReveal(i)
    })
    // Draw the day's segments one after another as a single stroke.
    const current = dayPathIndices()
    if (current.length && !reducedMotion.matches) {
      const total = current.reduce((sum, i) => sum + lengths[i], 0)
      const duration = Math.min(2400, Math.max(900, total * 2.5))
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration)
        if (progress < 1) {
          revealPaths(current, progress)
          drawFrame = requestAnimationFrame(tick)
        } else current.forEach((i) => setReveal(i))
      }
      revealPaths(current, 0)
      drawFrame = requestAnimationFrame(tick)
    }
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
    const dayButton = dayButtons.querySelector<HTMLElement>(`[data-day="${day.day}"]`)
    if (dayButton) {
      const button = dayButton.getBoundingClientRect(),
        container = dayButtons.getBoundingClientRect()
      if (button.left < container.left) dayButtons.scrollLeft += button.left - container.left
      else if (button.right > container.right)
        dayButtons.scrollLeft += button.right - container.right
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
  }

  const dayPathIndices = () =>
    paths.flatMap((path, i) =>
      Number(path.dataset.day) === data.days[selectedIndex].day ? [i] : [],
    )
  const updateWalk = (progress: number) => {
    fog.draw(data.days[selectedIndex].day, progress)
    revealPaths(dayPathIndices(), progress)
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
    const day = data.days[selectedIndex].day
    timeline = replayTimeline(
      dayPathIndices().reduce((sum, i) => sum + lengths[i], 0),
      data.stops.filter((stop) => stop.day === day).map((stop) => stopProgress.get(stop.id) ?? 0),
    )
    elapsed = 0
    replayReady = true
    cancelReveals()
    updateWalk(reducedMotion.matches ? 1 : 0)
  }
  const replayTick = (now: number) => {
    if (!playing) return
    elapsed += now - replayLastTime
    replayLastTime = now
    updateWalk(reducedMotion.matches ? 1 : timeline.progressAt(elapsed))
    if (elapsed >= timeline.duration) {
      const next = data.days.findIndex(
        (day, i) => i > selectedIndex && replayDays.includes(day.day),
      )
      if (next < 0) {
        pause()
        replayReady = false
        paths.forEach((_, i) => setReveal(i))
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
  // Phones fire resize when the address bar slides; only refit when the width changes.
  let lastWidth = viewport.clientWidth
  const overview = () => fit(narrow() ? data.days[selectedIndex].day : undefined, false)
  listen(window, "resize", () => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      if (viewport.clientWidth === lastWidth) return
      lastWidth = viewport.clientWidth
      fit(narrow() ? data.days[selectedIndex].day : undefined)
    }, 150)
  })
  listen(reducedMotion, "change", () => {
    animations.forEach((animation) => animation.cancel())
    animations.clear()
    if (reducedMotion.matches) {
      fog.finish()
      if (playing) updateWalk(1)
    }
  })
  stage.style.width = `${map.width}px`
  stage.style.height = `${map.height}px`
  selectDay(selectedIndex, false, undefined, false)
  overview()
  fromHash()
  initialized = true
  window.addCleanup(() => {
    controller.abort()
    camera.dispose()
    fog.dispose()
    cancelAnimationFrame(replayFrame)
    clearTimeout(resizeTimer)
    animations.forEach((animation) => animation.cancel())
    cancelReveals()
    stage.querySelectorAll(".campaign-journey-pin").forEach((pin) => pin.remove())
  })
})
