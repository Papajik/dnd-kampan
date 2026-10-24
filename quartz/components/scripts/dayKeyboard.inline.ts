document.addEventListener("nav", () => {
  const onKey = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    const target = document.activeElement
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable || target.closest("input, textarea, select"))
    )
      return
    if (
      document.querySelector(
        ".search-container.active, .image-lightbox[open], .global-graph-outer.active",
      )
    )
      return
    const direction = event.key === "ArrowLeft" ? "previous" : "next"
    const control =
      document.querySelector<HTMLElement>(`.campaign-journey [data-action="${direction}-day"]`) ??
      document.querySelector<HTMLElement>(`.day-navigation-top [data-day-direction="${direction}"]`)
    if (control) {
      event.preventDefault()
      control.click()
    }
  }
  document.addEventListener("keydown", onKey)
  window.addCleanup(() => document.removeEventListener("keydown", onKey))
})
