import { QuartzComponent } from "./types"
import { getDayCast } from "./dayCastModel"
import style from "./styles/dayCast.scss"

export const DayCast: QuartzComponent = ({ allFiles, fileData }) => {
  const groups = getDayCast(allFiles, fileData)
  if (groups.length === 0) return null
  return (
    <section class="day-cast" aria-label="V tomto dni">
      <h2>V tomto dni</h2>
      {groups.map((group) => (
        <div class="day-cast-group">
          <h3>{group.label}</h3>
          <ul>
            {group.entries.map((entry) => (
              <li>
                <a class="internal" href={entry.href}>
                  {entry.portrait ? (
                    <img src={entry.portrait} alt="" loading="lazy" />
                  ) : (
                    <span class="day-cast-initial" aria-hidden="true">
                      {entry.title.charAt(0)}
                    </span>
                  )}
                  <span>{entry.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
DayCast.css = style
