document.addEventListener("nav", () => {
  for (const roster of document.querySelectorAll<HTMLElement>(".npc-roster")) {
    const filters: Record<string, string> = { stav: "", vztah: "" }
    const buttons = roster.querySelectorAll<HTMLButtonElement>("button[data-filter]")
    const rows = roster.querySelectorAll<HTMLTableRowElement>("tbody tr")
    const sort = roster.querySelector<HTMLSelectElement>(".npc-sort")!
    try {
      if (localStorage.getItem("npc-roster-sort") === "recent") sort.value = "recent"
    } catch {}
    const reorder = () => {
      const ordered = [...rows].sort(
        (a, b) =>
          (sort.value === "recent" ? Number(b.dataset.lastDay) - Number(a.dataset.lastDay) : 0) ||
          (a.dataset.name ?? "").localeCompare(b.dataset.name ?? "", "cs"),
      )
      roster.querySelector("tbody")!.append(...ordered)
      try {
        localStorage.setItem("npc-roster-sort", sort.value)
      } catch {}
    }
    reorder()
    sort.addEventListener("change", reorder)
    window.addCleanup(() => sort.removeEventListener("change", reorder))
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
