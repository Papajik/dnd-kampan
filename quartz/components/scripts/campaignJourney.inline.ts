document.addEventListener("nav", () => {
  const journey = document.querySelector<HTMLElement>(".campaign-journey")
  if (!journey) return

  const stage = journey.querySelector<HTMLElement>(".campaign-journey-stage")
  const viewport = journey.querySelector<HTMLElement>(".campaign-journey-viewport")
  const image = stage?.querySelector<HTMLImageElement>("img")
  const route = stage?.querySelector<SVGElement>(".campaign-journey-route")
  const polyline = route?.querySelector<SVGPolylineElement>("polyline")
  const slider = journey.querySelector<HTMLInputElement>('input[type="range"]')
  const routeToggle = journey.querySelector<HTMLInputElement>('[data-action="toggle-route"]')
  const eventDay = journey.querySelector<HTMLElement>(".campaign-journey-event-day")
  const eventLink = journey.querySelector<HTMLAnchorElement>(".campaign-journey-event h2 a")
  const eventSummary = journey.querySelector<HTMLElement>(".campaign-journey-event-summary")
  const eventLocation = journey.querySelector<HTMLElement>(".campaign-journey-event-location")
  if (!stage || !viewport || !image || !route || !polyline || !slider || !eventDay || !eventLink || !eventSummary || !eventLocation) return

  const events = JSON.parse(journey.dataset.events ?? "[]") as Array<{
    day: number
    title: string
    summary: string
    location?: string
    coordinates?: string
    href: string
  }>
  const mapWidth = Number(journey.dataset.mapWidth)
  const mapHeight = Number(journey.dataset.mapHeight)
  let selectedDay = Number(slider.value)
  let scale = 1
  let translateX = 0
  let translateY = 0
  let dragStart: { x: number; y: number; translateX: number; translateY: number } | undefined

  const getCoordinates = (coordinates?: string) => {
    if (!coordinates) return undefined
    const [y, x] = coordinates.split(",").map((value) => Number(value.trim()))
    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : undefined
  }

  const applyTransform = () => {
    stage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
  }

  const focusOn = (coordinates?: string) => {
    const point = getCoordinates(coordinates)
    if (!point) return
    translateX = viewport.clientWidth / 2 - point.x * scale
    translateY = viewport.clientHeight / 2 - point.y * scale
    applyTransform()
  }

  const fitMap = () => {
    scale = Math.min(viewport.clientWidth / mapWidth, viewport.clientHeight / mapHeight)
    translateX = (viewport.clientWidth - mapWidth * scale) / 2
    translateY = (viewport.clientHeight - mapHeight * scale) / 2
    applyTransform()
  }

  const renderPins = () => {
    stage.querySelectorAll(".campaign-journey-pin").forEach((pin) => pin.remove())
    const mappedEvents = events.filter((event) => getCoordinates(event.coordinates))
    polyline.setAttribute(
      "points",
      mappedEvents
        .map((event) => getCoordinates(event.coordinates))
        .filter((point): point is { x: number; y: number } => point !== undefined)
        .map((point) => `${point.x},${point.y}`)
        .join(" "),
    )

    mappedEvents.forEach((event) => {
      const point = getCoordinates(event.coordinates)
      if (!point) return
      const matchingEvents = mappedEvents.filter((candidate) => candidate.coordinates === event.coordinates)
      const occurrence = matchingEvents.findIndex((candidate) => candidate.day === event.day)
      const offset = (occurrence - (matchingEvents.length - 1) / 2) * 36
      const pin = document.createElement("button")
      pin.className = "campaign-journey-pin"
      pin.type = "button"
      pin.textContent = String(event.day)
      pin.style.left = `${point.x}px`
      pin.style.top = `${point.y}px`
      pin.style.marginLeft = `${offset}px`
      pin.ariaLabel = `Zobrazit události dne ${event.day}`
      pin.addEventListener("click", () => selectDay(event.day, true))
      stage.append(pin)
    })
  }

  const selectDay = (day: number, shouldFocus = true) => {
    const event = events.find((candidate) => candidate.day === day)
    if (!event) return
    selectedDay = day
    slider.value = String(day)
    eventDay.textContent = `Den ${event.day}`
    eventLink.textContent = event.title
    eventLink.href = event.href
    eventSummary.textContent = event.summary
    eventLocation.textContent = event.location ?? "Poloha na mapě zatím není určená."
    journey.querySelectorAll<HTMLButtonElement>("[data-day]").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.day) === day)
    })
    stage.querySelectorAll<HTMLButtonElement>(".campaign-journey-pin").forEach((pin) => {
      pin.classList.toggle("is-active", Number(pin.textContent) === day)
    })
    if (shouldFocus) focusOn(event.coordinates)
  }

  const changeScale = (factor: number) => {
    const previousScale = scale
    scale = Math.max(0.2, Math.min(3, scale * factor))
    const focusX = viewport.clientWidth / 2
    const focusY = viewport.clientHeight / 2
    translateX = focusX - ((focusX - translateX) / previousScale) * scale
    translateY = focusY - ((focusY - translateY) / previousScale) * scale
    applyTransform()
  }

  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    changeScale(event.deltaY > 0 ? 0.85 : 1.15)
  }

  const onPointerDown = (event: PointerEvent) => {
    dragStart = { x: event.clientX, y: event.clientY, translateX, translateY }
    viewport.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!dragStart) return
    translateX = dragStart.translateX + event.clientX - dragStart.x
    translateY = dragStart.translateY + event.clientY - dragStart.y
    applyTransform()
  }

  const onPointerUp = () => {
    dragStart = undefined
  }

  const onRouteToggle = () => {
    route.classList.toggle("is-hidden", !routeToggle?.checked)
  }

  stage.style.width = `${mapWidth}px`
  stage.style.height = `${mapHeight}px`
  route.setAttribute("viewBox", `0 0 ${mapWidth} ${mapHeight}`)
  renderPins()
  fitMap()
  selectDay(selectedDay, false)

  slider.addEventListener("input", () => selectDay(Number(slider.value), false))
  journey.querySelectorAll<HTMLButtonElement>("[data-day]").forEach((button) => {
    button.addEventListener("click", () => selectDay(Number(button.dataset.day), false))
  })
  journey.querySelector<HTMLButtonElement>('[data-action="previous-day"]')?.addEventListener("click", () => {
    selectDay(Math.max(Number(slider.min), selectedDay - 1), false)
  })
  journey.querySelector<HTMLButtonElement>('[data-action="next-day"]')?.addEventListener("click", () => {
    selectDay(Math.min(Number(slider.max), selectedDay + 1), false)
  })
  journey.querySelector<HTMLButtonElement>('[data-action="zoom-in"]')?.addEventListener("click", () => changeScale(1.2))
  journey.querySelector<HTMLButtonElement>('[data-action="zoom-out"]')?.addEventListener("click", () => changeScale(0.8))
  journey.querySelector<HTMLButtonElement>('[data-action="reset"]')?.addEventListener("click", fitMap)
  routeToggle?.addEventListener("change", onRouteToggle)
  viewport.addEventListener("wheel", onWheel, { passive: false })
  viewport.addEventListener("pointerdown", onPointerDown)
  viewport.addEventListener("pointermove", onPointerMove)
  viewport.addEventListener("pointerup", onPointerUp)
  viewport.addEventListener("pointercancel", onPointerUp)
  window.addEventListener("resize", fitMap)
  window.addCleanup(() => {
    viewport.removeEventListener("wheel", onWheel)
    viewport.removeEventListener("pointerdown", onPointerDown)
    viewport.removeEventListener("pointermove", onPointerMove)
    viewport.removeEventListener("pointerup", onPointerUp)
    viewport.removeEventListener("pointercancel", onPointerUp)
    window.removeEventListener("resize", fitMap)
  })
})
