import { RecentChanges } from "../RecentChanges"
import { CampaignStatistics } from "../CampaignStatistics"
import { Relationships } from "../Relationships"
import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { CampaignJourney } from "../CampaignJourney"
import DayNavigation from "../DayNavigation"
import { DayCast } from "../DayCast"
import { concatenateResources } from "../../util/resources"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const BottomDayNavigation = DayNavigation({ variant: "bottom" })

const Content: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData, tree } = props
  const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []
  const typ = fileData.frontmatter?.typ
  if (typ === "npc" || typ === "bestiář" || typ === "postava") classes.push("npc-profile")
  const classString = ["popover-hint", ...classes].join(" ")
  return (
    <article class={classString}>
      {content}
      <RecentChanges {...props} />
      <CampaignJourney {...props} />
      <CampaignStatistics {...props} />
      <Relationships {...props} />
      <DayCast {...props} />
      <BottomDayNavigation {...props} />
    </article>
  )
}

Content.css = concatenateResources(
  CampaignJourney.css,
  RecentChanges.css,
  BottomDayNavigation.css,
  DayCast.css,
  CampaignStatistics.css,
)
Content.afterDOMLoaded = CampaignJourney.afterDOMLoaded

export default (() => Content) satisfies QuartzComponentConstructor
