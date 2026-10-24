import type { QuartzComponent } from "./types"
import { resolveRelative } from "../util/path"
import { getRelationships } from "./relationshipModel"
import style from "./styles/campaignOverviews.scss"

export const Relationships: QuartzComponent = ({ allFiles, fileData }) => {
  if (fileData.slug !== "svet/vztahy") return null
  const model = getRelationships(allFiles, fileData.slug)
  return (
    <section class="relationship-diagrams" aria-label="Vztahy a frakce">
      <p>
        {model.nodes.length} propojených entit · {model.edges.length} vazeb. Skupiny vycházejí z
        odkazů v tabulkách a vazbách NPC; samy o sobě nepotvrzují členství ve frakci. Zrcadlené
        vazby jsou sloučené, čáry nemají směr.
      </p>
      {model.diagrams.map((diagram) => (
        <section>
          <h2>{diagram.title}</h2>
          <div
            class="overview-scroll"
            tabIndex={0}
            role="region"
            aria-label={`Diagram: ${diagram.title}`}
          >
            <pre>
              <code class="mermaid">{diagram.source}</code>
            </pre>
          </div>
          <details>
            <summary>Entity a úplné znění vazeb</summary>
            <ul>
              {diagram.nodes.map(({ file }) => (
                <li>
                  <a class="internal" href={resolveRelative(fileData.slug!, file.slug!)}>
                    {file.frontmatter?.title}
                  </a>
                </li>
              ))}
            </ul>
            <ul>
              {diagram.edges.map((edge) => (
                <li>{edge.descriptions.join(" / ")}</li>
              ))}
            </ul>
          </details>
        </section>
      ))}
      {!model.diagrams.length && <p>Zatím nejsou zapsané vazby.</p>}
    </section>
  )
}
Relationships.css = style
