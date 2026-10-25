import { QuartzComponent } from "./types"
import { resolveRelative } from "../util/path"
import { getEntityAppearances, isEntityPage } from "./entityAppearancesModel"
import { npcCategory, npcStates, npcRelations, stateLabels, relationLabels } from "./npcStatusModel"
import { NpcBadge } from "./NpcBadges"
import style from "./styles/npcStatus.scss"
// @ts-ignore
import script from "./scripts/npcRoster.inline"

export const NpcRoster: QuartzComponent = ({ allFiles, fileData }) => {
  if (fileData.slug !== "npc/index") return null
  const npcs = allFiles
    .filter((file) => file.frontmatter?.typ === "npc" && isEntityPage(file))
    .sort((a, b) => (a.frontmatter?.title ?? "").localeCompare(b.frontmatter?.title ?? "", "cs"))
  return (
    <section class="npc-roster" aria-label="Přehled NPC">
      <h2>Přehled NPC</h2>
      {(
        [
          ["stav", "Stav", stateLabels],
          ["vztah", "Vztah", relationLabels],
        ] as const
      ).map(([field, label, labels]) => (
        <div class="npc-filters" role="group" aria-label={label}>
          <strong>{label}:</strong>
          <button type="button" data-filter={field} data-value="" aria-pressed="true">
            Vše
          </button>
          {Object.entries(labels).map(([value, text]) => (
            <button type="button" data-filter={field} data-value={value} aria-pressed="false">
              {text}
            </button>
          ))}
        </div>
      ))}
      <label class="npc-filters">
        Řazení:
        <select class="npc-sort" aria-label="Řazení NPC">
          <option value="alpha">Abecedně</option>
          <option value="recent">Naposledy viděn</option>
        </select>
      </label>
      <p class="npc-roster-count" role="status">
        Zobrazeno: {npcs.length}
      </p>
      <div class="npc-roster-table">
        <table>
          <thead>
            <tr>
              {["Jméno", "Stav", "Vztah", "Poprvé", "Naposledy"].map((label) => (
                <th scope="col">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {npcs.map((npc) => {
              const { stav, vztah, title } = npc.frontmatter!
              const state = npcCategory(npcStates, stav)
              const relation = npcCategory(npcRelations, vztah)
              const days = getEntityAppearances(allFiles, npc, fileData.slug!)
              return (
                <tr
                  data-stav={state}
                  data-vztah={relation}
                  data-name={title}
                  data-last-day={days.at(-1)?.day ?? -1}
                >
                  <th scope="row">
                    <a class="internal" href={resolveRelative(fileData.slug!, npc.slug!)}>
                      {title}
                    </a>
                  </th>
                  <td>
                    <NpcBadge value={stav} category={state} />
                  </td>
                  <td>
                    <NpcBadge value={vztah} category={relation} />
                  </td>
                  {[days.at(0), days.at(-1)].map((day) => (
                    <td>
                      {day ? (
                        <a class="internal" href={day.href}>
                          {day.day}. den
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p class="npc-roster-empty" hidden>
        Žádné NPC neodpovídá vybraným filtrům.
      </p>
    </section>
  )
}
NpcRoster.css = style
NpcRoster.afterDOMLoaded = script
