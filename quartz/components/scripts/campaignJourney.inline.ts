document.addEventListener("nav", () => {
  const journey = document.querySelector<HTMLElement>(".campaign-journey")
  if (!journey) return

  const stage = journey.querySelector<HTMLElement>(".campaign-journey-stage")
  const viewport = journey.querySelector<HTMLElement>(".campaign-journey-viewport")
  const image = stage?.querySelector<HTMLImageElement>("img")
  const route = stage?.querySelector<SVGElement>(".campaign-journey-route")
  const slider = journey.querySelector<HTMLInputElement>('input[type="range"]')
  const routeToggle = journey.querySelector<HTMLInputElement>('[data-action="toggle-route"]')
  const eventDetails = journey.querySelector<HTMLDetailsElement>(".campaign-journey-event")
  const eventDay = journey.querySelector<HTMLElement>(".campaign-journey-event-day")
  const eventLink = journey.querySelector<HTMLAnchorElement>(".campaign-journey-event h2 a")
  const eventSummary = journey.querySelector<HTMLElement>(".campaign-journey-event-summary")
  const eventLocation = journey.querySelector<HTMLElement>(".campaign-journey-event-location")
  const eventStops = journey.querySelector<HTMLUListElement>(".campaign-journey-event-stops")
  if (
    !stage ||
    !viewport ||
    !image ||
    !route ||
    !slider ||
    !eventDetails ||
    !eventDay ||
    !eventLink ||
    !eventSummary ||
    !eventLocation ||
    !eventStops
  )
    return

  const data = JSON.parse(journey.dataset.journey ?? "{}") as {
    days: Array<{ day: number; title: string; summary: string; location?: string; href: string }>
    stops: Array<{
      id: string
      order: number
      day: number
      label: string
      coordinates: [number, number]
      icon: string
    }>
    segments: Array<{ day: number; points: [number, number][] }>
  }
  const mapWidth = Number(journey.dataset.mapWidth)
  const mapHeight = Number(journey.dataset.mapHeight)
  const dayIndex = new Map(data.days.map((day, index) => [day.day, index]))
  let selectedIndex = Number(slider.value)
  let activeStopId: string | undefined
  let scale = 1
  let translateX = 0
  let translateY = 0
  let dragStart: { x: number; y: number; translateX: number; translateY: number } | undefined

  const applyTransform = () => {
    stage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
  }

  const focusOn = (coordinates?: [number, number]) => {
    if (!coordinates) return
    const [x, y] = coordinates
    translateX = viewport.clientWidth / 2 - x * scale
    translateY = viewport.clientHeight / 2 - y * scale
    applyTransform()
  }

  const fitMap = () => {
    scale = Math.min(viewport.clientWidth / mapWidth, viewport.clientHeight / mapHeight)
    translateX = (viewport.clientWidth - mapWidth * scale) / 2
    translateY = (viewport.clientHeight - mapHeight * scale) / 2
    applyTransform()
  }

  const renderStops = () => {
    stage.querySelectorAll(".campaign-journey-pin").forEach((pin) => pin.remove())
    data.stops.forEach((stop) => {
      const pin = document.createElement("button")
      pin.className = "campaign-journey-pin"
      pin.type = "button"
      pin.dataset.stopId = stop.id
      pin.dataset.day = String(stop.day)
      pin.style.left = `${stop.coordinates[0]}px`
      pin.style.top = `${stop.coordinates[1]}px`
      pin.ariaLabel = `Zobrazit den ${stop.day}: ${stop.label}`

      const icon = document.createElement("img")
      icon.src = stop.icon
      icon.alt = ""
      const order = document.createElement("span")
      order.textContent = String(stop.order)
      pin.append(icon, order)
      pin.addEventListener("pointerdown", (event) => event.stopPropagation())
      pin.addEventListener("click", () => {
        const index = dayIndex.get(stop.day)
        if (index === undefined) return
        selectDay(index, false, stop.id)
        focusOn(stop.coordinates)
      })
      stage.append(pin)
    })
  }

  const renderEventStops = (day: number) => {
    eventStops.replaceChildren()
    data.stops
      .filter((stop) => stop.day === day)
      .forEach((stop) => {
        const item = document.createElement("li")
        item.textContent = stop.label
        eventStops.append(item)
      })
  }

  const selectDay = (index: number, shouldFocus = true, stopId?: string) => {
    const day = data.days[index]
    if (!day) return

    selectedIndex = index
    activeStopId = stopId
    slider.value = String(index)
    eventDay.textContent = String(day.day)
    eventLink.textContent = day.title
    eventLink.href = day.href
    eventSummary.textContent = day.summary
    eventLocation.textContent = day.location ?? "Poloha na mapě zatím není určená."
    renderEventStops(day.day)
    eventDetails.open = true

    journey.querySelectorAll<HTMLButtonElement>("[data-day]").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.day) === day.day)
    })
    route.querySelectorAll<SVGPolylineElement>("polyline[data-day]").forEach((segment) => {
      const segmentDay = Number(segment.dataset.day)
      segment.classList.toggle("is-past", segmentDay < day.day)
      segment.classList.toggle("is-current", segmentDay === day.day)
      segment.classList.toggle("is-future", segmentDay > day.day)
    })
    journey.querySelectorAll<HTMLElement>("[data-stop-id]").forEach((element) => {
      const stop = data.stops.find((candidate) => candidate.id === element.dataset.stopId)
      if (!stop) return

      element.classList.toggle("is-past", stop.day < day.day)
      element.classList.toggle("is-current", stop.day === day.day)
      element.classList.toggle("is-future", stop.day > day.day)
      element.classList.toggle("is-active", stop.id === activeStopId)
      if (element instanceof HTMLButtonElement && element.closest(".campaign-journey-legend")) {
        element.setAttribute("aria-current", stop.id === activeStopId ? "true" : "false")
      }
    })

    if (shouldFocus) focusOn(data.stops.find((stop) => stop.day === day.day)?.coordinates)
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

  stage.style.width = `${mapWidth}px`
  stage.style.height = `${mapHeight}px`
  renderStops()
  fitMap()
  selectDay(selectedIndex, false)

  slider.addEventListener("input", () => selectDay(Number(slider.value), false))
  journey
    .querySelectorAll<HTMLButtonElement>(".campaign-journey-day-buttons [data-day]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const index = dayIndex.get(Number(button.dataset.day))
        if (index !== undefined) selectDay(index, false)
      })
    })
  journey
    .querySelector<HTMLButtonElement>('[data-action="previous-day"]')
    ?.addEventListener("click", () => {
      selectDay(Math.max(0, selectedIndex - 1), false)
    })
  journey
    .querySelector<HTMLButtonElement>('[data-action="next-day"]')
    ?.addEventListener("click", () => {
      selectDay(Math.min(data.days.length - 1, selectedIndex + 1), false)
    })
  journey
    .querySelectorAll<HTMLButtonElement>(".campaign-journey-legend [data-stop-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const stop = data.stops.find((candidate) => candidate.id === button.dataset.stopId)
        const index = stop ? dayIndex.get(stop.day) : undefined
        if (!stop || index === undefined) return
        selectDay(index, false, stop.id)
        focusOn(stop.coordinates)
      })
    })
  journey
    .querySelector<HTMLButtonElement>('[data-action="zoom-in"]')
    ?.addEventListener("click", () => changeScale(1.2))
  journey
    .querySelector<HTMLButtonElement>('[data-action="zoom-out"]')
    ?.addEventListener("click", () => changeScale(0.8))
  journey
    .querySelector<HTMLButtonElement>('[data-action="reset"]')
    ?.addEventListener("click", fitMap)
  routeToggle?.addEventListener("change", () =>
    route.classList.toggle("is-hidden", !routeToggle.checked),
  )
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
