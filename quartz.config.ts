import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { campaignImage } from "./quartz/util/campaignOg"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "DnD Kampaň u Pompa",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "cs-CZ",
    baseUrl: "dnd.papajik.cz",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Cinzel",
        body: "Alegreya",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#f5eedc",
          lightgray: "#e2d5b6",
          gray: "#a8977a",
          darkgray: "#4a3b2b",
          dark: "#2a1f15",
          secondary: "#7d4630",
          tertiary: "#a8772c",
          highlight: "rgba(125, 70, 48, 0.07)",
          textHighlight: "#e9c46a88",
        },
        darkMode: {
          light: "#1b1611",
          lightgray: "#3a3025",
          gray: "#6f604c",
          darkgray: "#d9ccb2",
          dark: "#f0e6d0",
          secondary: "#cfa27c",
          tertiary: "#c9a24a",
          highlight: "rgba(207, 162, 124, 0.1)",
          textHighlight: "#b3870288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.LeafletMap({ enableCopyTool: true }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages({ imageStructure: campaignImage }),
    ],
  },
}

export default config
