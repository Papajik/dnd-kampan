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
| Cesta družiny | `content/map/cesta-druziny.md` | Vlastní časová osa a mapa pohybu družiny. |

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

## Cesta družiny

Stránka `content/map/cesta-druziny.md` sama čte deníky a vytváří časovou osu. Každý nový odehraný den proto doplň o tento blok frontmatteru:

```yaml
title: 8. den
journey:
  summary: Jednověté shrnutí hlavního posunu dne.
  location: Název místa nebo stručný seznam zastávek.
  map: okoli-glensdale
  coordinates: "x, y"
```

- `summary` a `location` doplň vždy.
- `coordinates` doplň jen tehdy, když je místo na mapě jednoznačné; formát je přesně řetězec `y, x` v pixelech zdrojového obrázku, shodně s Leaflet pluginem.
- Pro `okoli-glensdale` má obrázek rozměr `1600 × 1200`; pro `glensdale` `1600 × 1600`.
- Pokud den zahrnuje více zastávek, nech prozatím souřadnici prázdnou a zaznamenej trasu do běžného textu deníku. Další samostatné body lze přidat až po rozšíření formátu, nehádej jejich polohu.
