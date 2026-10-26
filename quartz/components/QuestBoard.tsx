import type { QuartzComponent } from "./types"
import { getQuestBoard } from "./questBoardModel"
import style from "./styles/questBoard.scss"

export const QuestBoard: QuartzComponent = ({ allFiles, fileData }) => {
  if (fileData.slug !== "ukoly/index") return null
  return (
    <section class="quest-board" aria-label="Nástěnka úkolů">
      <h2>Nástěnka úkolů</h2>
      {getQuestBoard(allFiles)
        .filter((group) => group.cards.length)
        .map((group) => {
          const cards = (
            <ul class={`quest-notes quest-notes-${group.id}`}>
              {group.cards.map((card) => (
                <li>
                  <a
                    class="internal quest-note"
                    href={card.href}
                    style={{ "--note-rotation": `${card.rotation}deg` }}
                  >
                    <span class={`quest-stamp quest-stamp-${card.state}`}>{card.label}</span>
                    <h4>{card.title}</h4>
                    {card.summary && <p>{card.summary}</p>}
                    <dl>
                      {card.fields.map((field) => (
                        <div>
                          <dt>{field.label}</dt>
                          <dd>
                            {field.portrait && <img src={field.portrait} alt="" loading="lazy" />}
                            {field.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <footer>
                      <span>
                        {card.given === undefined
                          ? "Zadáno: bez doloženého dne"
                          : `Zadáno: ${card.given}. den`}
                      </span>
                      {card.finished !== undefined && (
                        <span>
                          {card.state === "splněný" ? "Splněno" : "Uzavřeno"}: {card.finished}. den
                        </span>
                      )}
                    </footer>
                  </a>
                </li>
              ))}
            </ul>
          )
          return group.id === "finished" ? (
            <details class="quest-archive" open={group.cards.length < 4}>
              <summary>
                {group.title} <span>({group.cards.length})</span>
              </summary>
              {cards}
            </details>
          ) : (
            <section class={`quest-section quest-section-${group.id}`}>
              <h3>
                {group.title} <span>({group.cards.length})</span>
              </h3>
              {cards}
            </section>
          )
        })}
    </section>
  )
}
QuestBoard.css = style
