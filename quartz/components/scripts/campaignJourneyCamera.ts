import {
  clampCamera,
  minimumScale,
  zoomAround,
  type Camera,
  type Size,
} from "../campaignJourneyCamera"

export function createJourneyCamera(
  viewport: HTMLElement,
  stage: HTMLElement,
  map: Size,
  reducedMotion: MediaQueryList,
  signal: AbortSignal,
  interrupt: () => void,
) {
  const view = () => ({ width: viewport.clientWidth, height: viewport.clientHeight })
  const listen = (
    target: EventTarget,
    event: string,
    handler: EventListener,
    options: AddEventListenerOptions = {},
  ) => target.addEventListener(event, handler, { ...options, signal })
  let camera: Camera = { x: 0, y: 0, scale: 1 }
  let cameraFrame = 0
  let lastTouchTime = -Infinity
  let lastTap: { time: number; x: number; y: number } | undefined
  const applyCamera = (next: Camera) => {
    camera = clampCamera(next, view(), map)
    stage.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`
  }
  const moveCamera = (next: Camera, smooth = true) => {
    cancelAnimationFrame(cameraFrame)
    const target = clampCamera(next, view(), map)
    if (!smooth || reducedMotion.matches) {
      applyCamera(target)
      return
    }
    const start = { ...camera }
    const time = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - time) / 580)
      const ease = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
      applyCamera({
        x: start.x + (target.x - start.x) * ease,
        y: start.y + (target.y - start.y) * ease,
        scale: start.scale + (target.scale - start.scale) * ease,
      })
      if (t < 1) cameraFrame = requestAnimationFrame(tick)
    }
    cameraFrame = requestAnimationFrame(tick)
  }
  const zoom = (factor: number, point: [number, number], smooth = true) => {
    interrupt()
    const scale = Math.max(minimumScale(view(), map), Math.min(3, camera.scale * factor))
    moveCamera(zoomAround(camera, point, scale), smooth)
  }
  const localPoint = (event: { clientX: number; clientY: number }): [number, number] => {
    const rect = viewport.getBoundingClientRect()
    return [event.clientX - rect.left, event.clientY - rect.top]
  }
  const pointers = new Map<number, [number, number]>()
  let gesture: { camera: Camera; points: [number, number][] } | undefined
  let moved = false
  const resetGesture = () => {
    gesture = { camera: { ...camera }, points: [...pointers.values()] }
  }
  listen(viewport, "pointerdown", ((event: PointerEvent) => {
    if (event.button !== 0 || (event.target as Element).closest("button")) return
    interrupt()
    cancelAnimationFrame(cameraFrame)
    pointers.set(event.pointerId, localPoint(event))
    moved = false
    resetGesture()
    viewport.setPointerCapture(event.pointerId)
  }) as EventListener)
  listen(viewport, "pointermove", ((event: PointerEvent) => {
    if (!pointers.has(event.pointerId) || !gesture) return
    pointers.set(event.pointerId, localPoint(event))
    const current = [...pointers.values()]
    const start = gesture.points
    const midpoint = (points: [number, number][]): [number, number] =>
      points.length > 1
        ? [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2]
        : points[0]
    const before = midpoint(start),
      after = midpoint(current)
    if (Math.hypot(after[0] - before[0], after[1] - before[1]) > 4 || current.length > 1)
      moved = true
    let next = gesture.camera
    if (current.length > 1 && start.length > 1) {
      const distance = (points: [number, number][]) =>
        Math.hypot(points[0][0] - points[1][0], points[0][1] - points[1][1])
      const scale = Math.max(
        minimumScale(view(), map),
        Math.min(3, (next.scale * distance(current)) / Math.max(1, distance(start))),
      )
      next = zoomAround(next, before, scale)
    }
    applyCamera({ ...next, x: next.x + after[0] - before[0], y: next.y + after[1] - before[1] })
  }) as EventListener)
  const endPointer = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return
    if (event.pointerType === "touch") lastTouchTime = performance.now()
    if (
      event.type === "pointerup" &&
      event.pointerType === "touch" &&
      !moved &&
      pointers.size === 1
    ) {
      const point = localPoint(event),
        now = performance.now()
      if (
        lastTap &&
        now - lastTap.time < 320 &&
        Math.hypot(point[0] - lastTap.x, point[1] - lastTap.y) < 25
      ) {
        zoom(1.6, point)
        lastTap = undefined
      } else lastTap = { time: now, x: point[0], y: point[1] }
    }
    pointers.delete(event.pointerId)
    resetGesture()
  }
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
    listen(viewport, name, endPointer as EventListener)
  listen(
    viewport,
    "wheel",
    ((event: WheelEvent) => {
      event.preventDefault()
      zoom(Math.exp(-event.deltaY * 0.002), localPoint(event), false)
    }) as EventListener,
    { passive: false },
  )
  listen(viewport, "dblclick", ((event: MouseEvent) => {
    if (performance.now() - lastTouchTime > 700 && !(event.target as Element).closest("button")) {
      event.preventDefault()
      zoom(1.6, localPoint(event))
    }
  }) as EventListener)

  listen(reducedMotion, "change", () => cancelAnimationFrame(cameraFrame))
  return { move: moveCamera, zoom, dispose: () => cancelAnimationFrame(cameraFrame) }
}
