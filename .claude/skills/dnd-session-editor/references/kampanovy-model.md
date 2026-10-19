# Kampanový model

## Složky

| Oblast          | Cesta                                | Účel                                                  |
| --------------- | ------------------------------------ | ----------------------------------------------------- |
| Kronika         | `content/denik/`                     | Průběh každého odehraného dne.                        |
| Hráčské postavy | `content/postavy/`                   | Stav a významné vazby družiny.                        |
| NPC             | `content/npc/`                       | Kontakty, protivníci a jejich zjištěná fakta.         |
| Bestiář         | `content/bestiar/`                   | Druhy nestvůr, jejich pozorované vlastnosti a výskyt. |
| Lokace          | `content/lokace/`                    | Důležitá místa a změny, které v nich nastaly.         |
| Předměty        | `content/predmety/`                  | Magické věci, dokumenty a příběhové stopy.            |
| Úkoly           | `content/ukoly/`                     | Aktivní, splněné a slepé linky.                       |
| Svět            | `content/svet/`                      | Frakce, božstva a širší lore.                         |
| Cesta družiny   | `content/map/cesta-druziny.md`       | Vlastní časová osa a mapa pohybu družiny.             |
| Majetek         | `content/postavy/Majetek družiny.md` | Peníze, odměny a kdo nosí důležité předměty.          |

## Osvědčené vzory

- Den `1` kombinuje boj, nové stopy a důsledky dne.
- Den `4` je členěn časy, protože podklady byly časové.
- Den `5` propojuje nalezený loot, dopisy, výslechy, bitvy a návrat do vesnice.
- Den `6` posunul děj pod Glensdale; proto se záznamy propsaly do Treji, Dorgara, dolů, truhličky, úkolů a hlavního indexu.
- Stránka NPC jako `npc/Treja.md` přidává nové skutečnosti jako samostatné body, typicky „V [[6. den|6. dni]] …“.

## Rozhodování nad poznámkami

| Poznámka                                       | Kam ji zapsat                                                   |
| ---------------------------------------------- | --------------------------------------------------------------- |
| Odehraná scéna                                 | Deník; shrnutí jen když ovlivní další rozhodování.              |
| Nově zjištěné vlastnictví nebo identita        | NPC, postava nebo předmět a odkaz v deníku.                     |
| Změna místa (otevřené dveře, zával, nebezpečí) | Lokace a deník.                                                 |
| Nový cíl nebo závazek                          | Úkol, index úkolů, deník a případně hlavní index.               |
| Dokončený cíl                                  | Přesun do `ukoly/splnene/`, aktualizace indexu a dne.           |
| Získaný, prodaný nebo předaný předmět, peníze  | Deník a `postavy/Majetek družiny.md`.                           |
| Slyšená legenda či neověřená informace         | Svět/NPC s uvedením zdroje („podle Henryho“, „Gertruda tvrdí“). |

## Cesta družiny

Stránka `content/map/cesta-druziny.md` sama načte všechny deníky a vytvoří z nich časovou osu. Každý nový den proto potřebuje ve frontmatteru:

```yaml
---
title: 10. den
typ: den
journey:
  summary: Jednověté shrnutí hlavního posunu dne.
  location: Název místa nebo stručný seznam zastávek.
---
```

- `summary` a `location` doplň vždy; bez nich časová osa ukáže „Záznam dne čeká na stručné shrnutí“.
- Zastávky s ikonami a trasy se nezapisují do deníku, ale do `journeyMap` ve frontmatteru `cesta-druziny.md`. Postup popisuje skill `dnd-journey-map`.

## Majetek družiny

`content/postavy/Majetek družiny.md` drží, u koho jsou důležité předměty, co je svěřené nebo zapůjčené a jaké peníze přišly či odešly. Zapisuj jen částky a předměty z deníku; neznámou částku uveď jako „není zapsaná“ a nepočítej z ní zůstatek.
