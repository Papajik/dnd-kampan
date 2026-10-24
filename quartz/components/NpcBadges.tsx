import { QuartzComponent, QuartzComponentConstructor } from "./types"
import { npcCategory, npcStates, npcRelations } from "./npcStatusModel"
import style from "./styles/npcStatus.scss"

export function NpcBadge({ value, category }: { value: unknown; category?: string }) {
  return typeof value === "string" && category ? (
    <span class={`npc-badge npc-${category}`}>{value}</span>
  ) : null
}

const NpcBadges: QuartzComponent = ({ fileData }) => {
  if (fileData.frontmatter?.typ !== "npc") return null
  const { stav, vztah } = fileData.frontmatter
  return (
    <div class="npc-badges" aria-label="Stav a vztah k družině">
      <NpcBadge value={stav} category={npcCategory(npcStates, stav)} />
      <NpcBadge value={vztah} category={npcCategory(npcRelations, vztah)} />
    </div>
  )
}
NpcBadges.css = style
export default (() => NpcBadges) satisfies QuartzComponentConstructor
