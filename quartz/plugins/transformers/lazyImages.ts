import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"
import type { QuartzTransformerPlugin } from "../types"

// The first image (portrait or opening sketch) stays eager; the rest load on scroll.
export const LazyImages: QuartzTransformerPlugin = () => ({
  name: "LazyImages",
  htmlPlugins() {
    return [
      () => (tree: Root) => {
        let first = true
        visit(tree, "element", (node: Element) => {
          if (node.tagName !== "img") return
          node.properties.decoding = "async"
          if (!first) node.properties.loading = "lazy"
          first = false
        })
      },
    ]
  },
})
