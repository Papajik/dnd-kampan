import type { JourneyCoordinates, JourneySegment, JourneyStop } from "./campaignJourneyModel"

export interface Camera {
  x: number
  y: number
  scale: number
}
export interface Size {
  width: number
  height: number
}
export interface Bounds {
  left: number
  top: number
  right: number
  bottom: number
}

export function journeyBounds(
  stops: JourneyStop[],
  segments: JourneySegment[],
  day?: number,
): Bounds | undefined {
  const points = [
    ...stops.filter((s) => day === undefined || s.day === day).map((s) => s.coordinates),
    ...segments.filter((s) => day === undefined || s.day === day).flatMap((s) => s.points),
  ]
  return points.length
    ? {
        left: Math.min(...points.map((p) => p[0])),
        right: Math.max(...points.map((p) => p[0])),
        top: Math.min(...points.map((p) => p[1])),
        bottom: Math.max(...points.map((p) => p[1])),
      }
    : undefined
}

export function minimumScale(view: Size, map: Size) {
  return Math.min(3, Math.max(view.width / map.width, view.height / map.height))
}

export function clampCamera(camera: Camera, view: Size, map: Size): Camera {
  const scale = Math.max(minimumScale(view, map), Math.min(3, camera.scale))
  const axis = (position: number, viewport: number, image: number) =>
    image <= viewport ? (viewport - image) / 2 : Math.max(viewport - image, Math.min(0, position))
  return {
    scale,
    x: axis(camera.x, view.width, map.width * scale),
    y: axis(camera.y, view.height, map.height * scale),
  }
}

export function fitToBox(box: Bounds, view: Size, map: Size, padding = 60, maxScale = 1.6): Camera {
  const scale = Math.max(
    minimumScale(view, map),
    Math.min(
      maxScale,
      Math.max(1, view.width - padding * 2) / Math.max(1, box.right - box.left),
      Math.max(1, view.height - padding * 2) / Math.max(1, box.bottom - box.top),
    ),
  )
  return clampCamera(
    {
      scale,
      x: view.width / 2 - ((box.left + box.right) / 2) * scale,
      y: view.height / 2 - ((box.top + box.bottom) / 2) * scale,
    },
    view,
    map,
  )
}

export function zoomAround(camera: Camera, point: JourneyCoordinates, scale: number): Camera {
  return {
    scale,
    x: point[0] - ((point[0] - camera.x) * scale) / camera.scale,
    y: point[1] - ((point[1] - camera.y) * scale) / camera.scale,
  }
}
