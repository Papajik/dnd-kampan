import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { CampaignJourney } from "../CampaignJourney"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const Content: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData, tree } = props
  const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []
  if (fileData.slug?.startsWith("npc/")) classes.push("npc-profile")
  const classString = ["popover-hint", ...classes].join(" ")
  return (
    <article class={classString}>
      {content}
      <CampaignJourney {...props} />
    </article>
  )
}

Content.css = CampaignJourney.css
Content.afterDOMLoaded = CampaignJourney.afterDOMLoaded

export default (() => Content) satisfies QuartzComponentConstructor
