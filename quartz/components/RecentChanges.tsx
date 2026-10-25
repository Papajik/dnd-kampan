import { QuartzComponent } from "./types"
import { resolveRelative } from "../util/path"
import { formatChangeDate, getRecentChanges } from "./recentChangesModel"
import style from "./styles/recentChanges.scss"

export const RecentChanges: QuartzComponent = ({ fileData, allFiles }) => {
  if (fileData.slug !== "index") return null
  const changes = getRecentChanges(allFiles)
  if (!changes.length) return null
  return (
    <section class="recent-changes" aria-labelledby="recent-changes-title">
      <h2 id="recent-changes-title">Co je nového</h2>
      <ul>
        {changes.map(({ file, date, label }) => (
          <li>
            <a class="internal" href={resolveRelative(fileData.slug!, file.slug!)}>
              {file.frontmatter?.title ?? file.slug}
            </a>
            <span class="recent-change-meta">
              {label} · <time dateTime={date.toISOString()}>{formatChangeDate(date)}</time>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
RecentChanges.css = style
