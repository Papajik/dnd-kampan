# Úkol

Používej tento vzor pro nové úkoly nebo při cílené úpravě existujícího úkolu.

```md
---
title: Název úkolu
typ: úkol
stav: aktivní
---

> [!todo] Aktuální stav
> Stručný ověřený stav a bezprostřední další krok.

## Zadání

Jednou až dvěma větami popiš konkrétní cíl.

## Přehled

| Vlastnost | Informace |
| --- | --- |
| Zadavatel | [[NPC]] nebo Družina |
| Cíl | Konkrétní výsledek |
| Odměna | Neznámá |
| Priorita | Hlavní / Vedlejší |
| Cíl výpravy | [[Lokace]] nebo — |

## Historie

- Ve [[N. den|N. dni]] byl úkol zadán nebo nastala důležitá změna.

## Stopy a souvislosti

- [[Související entita]]
```

## Stav a přesun

| Stav | Frontmatter | Horní blok | Umístění |
| --- | --- | --- | --- |
| Aktivní | `stav: aktivní` | `[!todo] Aktuální stav` | `content/ukoly/` |
| Pozastavený | `stav: pozastavený` | `[!warning] Pozastaveno` | `content/ukoly/` |
| Splněný | `stav: splněný` | `[!success] Splněno` s dnem dokončení | `content/ukoly/splnene/` |
| Neúspěšný | `stav: neúspěšný` | `[!failure] Uzavřeno` s důvodem | `content/ukoly/splnene/` |

Při přesunu splněného nebo neúspěšného úkolu přidej do `## Historie` poslední bod s odkazem na den a uprav `content/ukoly/index.md`. Zachovej název souboru; pouze frontmatter má suffix `(splněno)` nebo `(uzavřeno)`.

## Pravidla obsahu

- `Aktuální stav` má být současný, stručný a neopakovat celou historii.
- `Historie` zapisuje ověřitelné změny po dnech; žádné neurčité poznámky bez zdroje.
- `Stopy a souvislosti` obsahují pouze relevantní wikilinky; nevytvářej dlouhý seznam všech zmíněných jmen.
- Neznámou odměnu, lokaci či zadavatele označ `Neznámá` nebo `—`, neodhaduješ ji.
