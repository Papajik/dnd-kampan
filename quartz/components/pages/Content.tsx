import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { CampaignJourney } from "../CampaignJourney"
import DayNavigation from "../DayNavigation"
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
      <CampaignJourney {...props} />
      <BottomDayNavigation {...props} />
    </article>
  )
}

Content.css = concatenateResources(CampaignJourney.css, BottomDayNavigation.css)
Content.afterDOMLoaded = CampaignJourney.afterDOMLoaded

export default (() => Content) satisfies QuartzComponentConstructor
