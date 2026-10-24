document.addEventListener("nav", () => {
  const dialog = document.querySelector<HTMLDialogElement>(".image-lightbox")
  const enlarged = dialog?.querySelector("img")
  const closeButton = dialog?.querySelector("button")
  if (!dialog || !enlarged || !closeButton) return
  let previousFocus: HTMLElement | null = null
  let overflow: string | undefined
  const restore = () => {
    if (overflow !== undefined) document.body.style.overflow = overflow
    overflow = undefined
    previousFocus?.focus({ preventScroll: true })
    previousFocus = null
  }
  const close = () => dialog.close()
  const outside = (event: MouseEvent) => {
    if (event.target === dialog) close()
  }
  // Quartz's document-level Escape handlers call preventDefault, which blocks the native close
  const escape = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return
    event.preventDefault()
    close()
  }
  const images = Array.from(document.querySelectorAll<HTMLImageElement>("article img")).filter(
    (image) => !image.closest("a, .campaign-journey, .leaflet-map, .leaflet-container"),
  )
  const cleanups: (() => void)[] = []
  for (const image of images) {
    const originalTabindex = image.getAttribute("tabindex")
    const originalRole = image.getAttribute("role")
    const originalLabel = image.getAttribute("aria-label")
    const prepare = () => {
      if (image.naturalWidth < 120) return
      image.classList.add("lightbox-zoomable")
      image.tabIndex = 0
      image.setAttribute("role", "button")
      image.setAttribute("aria-label", `Zvětšit obrázek${image.alt ? `: ${image.alt}` : ""}`)
    }
    const open = () => {
      if (image.naturalWidth < 120 || dialog.open) return
      previousFocus = image
      enlarged.src = image.currentSrc || image.src
      enlarged.alt = image.alt
      overflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      dialog.showModal()
      closeButton.focus()
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        open()
      }
    }
    prepare()
    image.addEventListener("load", prepare)
    image.addEventListener("click", open)
    image.addEventListener("keydown", key)
    cleanups.push(() => {
      image.removeEventListener("load", prepare)
      image.removeEventListener("click", open)
      image.removeEventListener("keydown", key)
      image.classList.remove("lightbox-zoomable")
      for (const [name, value] of [
        ["tabindex", originalTabindex],
        ["role", originalRole],
        ["aria-label", originalLabel],
      ]) {
        if (value === null) image.removeAttribute(name!)
        else image.setAttribute(name!, value!)
      }
    })
  }
  closeButton.addEventListener("click", close)
  dialog.addEventListener("click", outside)
  dialog.addEventListener("keydown", escape)
  dialog.addEventListener("close", restore)
  window.addCleanup(() => {
    if (dialog.open) close()
    restore()
    closeButton.removeEventListener("click", close)
    dialog.removeEventListener("click", outside)
    dialog.removeEventListener("keydown", escape)
    dialog.removeEventListener("close", restore)
    cleanups.forEach((cleanup) => cleanup())
  })
})
