document.addEventListener("nav", () => {
  for (const roster of document.querySelectorAll<HTMLElement>(".npc-roster")) {
    const filters: Record<string, string> = { stav: "", vztah: "" }
    const buttons = roster.querySelectorAll<HTMLButtonElement>("button[data-filter]")
    const rows = roster.querySelectorAll<HTMLTableRowElement>("tbody tr")
    for (const button of buttons) {
      const filter = () => {
        filters[button.dataset.filter!] = button.dataset.value!
        for (const chip of buttons) {
          chip.setAttribute(
            "aria-pressed",
            String(filters[chip.dataset.filter!] === chip.dataset.value),
          )
        }
        let visible = 0
        for (const row of rows) {
          row.hidden = !Object.entries(filters).every(
            ([field, value]) => !value || row.dataset[field] === value,
          )
          if (!row.hidden) visible++
        }
        roster.querySelector<HTMLElement>(".npc-roster-count")!.textContent =
          `Zobrazeno: ${visible} z ${rows.length}`
        roster.querySelector<HTMLElement>(".npc-roster-empty")!.hidden = visible > 0
      }
      button.addEventListener("click", filter)
      window.addCleanup(() => button.removeEventListener("click", filter))
    }
  }
})
