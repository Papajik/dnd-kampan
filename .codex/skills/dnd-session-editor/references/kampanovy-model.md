# Kampanový model

## Složky

| Oblast | Cesta | Účel |
| --- | --- | --- |
| Kronika | `content/denik/` | Průběh každého odehraného dne. |
| Hráčské postavy | `content/postavy/` | Stav a významné vazby družiny. |
| NPC | `content/npc/` | Kontakty, protivníci a jejich zjištěná fakta. |
| Lokace | `content/lokace/` | Důležitá místa a změny, které v nich nastaly. |
| Předměty | `content/predmety/` | Magické věci, dokumenty a příběhové stopy. |
| Úkoly | `content/ukoly/` | Aktivní, splněné a slepé linky. |
| Svět | `content/svet/` | Frakce, božstva a širší lore. |

## Osvědčené vzory

- Den `1` kombinuje boj, nové stopy a důsledky dne.
- Den `4` je členěn časy, protože podklady byly časové.
- Den `5` propojuje nalezený loot, dopisy, výslechy, bitvy a návrat do vesnice.
- Den `6` posunul děj pod Glensdale; proto se záznamy propsaly do Treji, Dorgara, dolů, truhličky, úkolů a hlavního indexu.
- Stránka NPC jako `npc/Treja.md` přidává nové skutečnosti jako samostatné body, typicky „V [[6. den|6. dni]] …“.

## Rozhodování nad poznámkami

| Poznámka | Kam ji zapsat |
| --- | --- |
| Odehraná scéna | Deník; shrnutí jen když ovlivní další rozhodování. |
| Nově zjištěné vlastnictví nebo identita | NPC, postava nebo předmět a odkaz v deníku. |
| Změna místa (otevřené dveře, zával, nebezpečí) | Lokace a deník. |
| Nový cíl nebo závazek | Úkol, index úkolů, deník a případně hlavní index. |
| Dokončený cíl | Přesun do `ukoly/splnene/`, aktualizace indexu a dne. |
| Slyšená legenda či neověřená informace | Svět/NPC s uvedením zdroje („podle Henryho“, „Gertruda tvrdí“). |
