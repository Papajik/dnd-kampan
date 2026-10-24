import { QuartzComponent, QuartzComponentConstructor } from "./types"
import { getEntityAppearances, isEntityPage } from "./entityAppearancesModel"
import style from "./styles/entityAppearances.scss"

const EntityAppearances: QuartzComponent = ({ allFiles, fileData }) => {
  if (!fileData.slug || !isEntityPage(fileData)) return null
  const days = getEntityAppearances(allFiles, fileData, fileData.slug)
  if (!days.length) return null
  return (
    <p class="entity-appearances">
      Objevuje se v:{" "}
      {days.map((day, index) => (
        <span>
          {index > 0 && " · "}
          <a class="internal" href={day.href}>
            {day.day}. den
          </a>
        </span>
      ))}
    </p>
  )
}
EntityAppearances.css = style
export default (() => EntityAppearances) satisfies QuartzComponentConstructor
