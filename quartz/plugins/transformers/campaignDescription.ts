import type { Root } from "hast"
import type { QuartzTransformerPlugin } from "../types"
import { campaignDescription } from "../../util/campaignDescription"
import { escapeHTML } from "../../util/escape"

export const CampaignDescription: QuartzTransformerPlugin = () => ({
  name: "CampaignDescription",
  htmlPlugins() {
    return [
      () => (tree: Root, file) => {
        if (file.data.frontmatter?.description) return
        const description = campaignDescription(file.data.slug ?? "", file.data.frontmatter, tree)
        if (description) file.data.description = escapeHTML(description)
      },
    ]
  },
})
