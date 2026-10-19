# DnD Kampaň u Pompa

Kronika DnD kampaně kolem vesnice Glensdale – deník po dnech, postavy, NPC, bestiář, lokace, předměty, úkoly a interaktivní mapy. Web běží na [Quartz 4](https://quartz.jzhao.xyz/) a je publikovaný na <https://dnd.papajik.cz>.

## Struktura

| Cesta                      | Obsah                                                   |
| -------------------------- | ------------------------------------------------------- |
| `content/denik/`           | Deník, jeden soubor na odehraný den (`<N>. den.md`).    |
| `content/postavy/`         | Hráčské postavy a společný majetek družiny.             |
| `content/npc/`             | Nehráčské postavy; portréty v `_assets/portraits/npc/`. |
| `content/bestiar/`         | Nestvůry a bytosti, se kterými se družina setkala.      |
| `content/lokace/`          | Místa; `marker` ve frontmatteru je umístí na mapu.      |
| `content/predmety/`        | Magické předměty, dopisy a další stopy.                 |
| `content/ukoly/`           | Aktivní úkoly; splněné leží v `ukoly/splnene/`.         |
| `content/svet/`            | Božstva, frakce a širší lore.                           |
| `content/map/`             | Leaflet mapy a stránka `cesta-druziny` s časovou osou.  |
| `.claude/skills/`          | Postupy pro AI asistenta (zpracování session aj.).      |
| `quartz/`, `quartz.*.ts`   | Generátor webu a jeho úpravy pro kampaň.                |
| `scripts/check-content.ts` | Kontrola obsahu (odkazy, frontmatter, úkoly, mapa).     |

## Konvence obsahu

- Každá stránka začíná frontmatterem (`---` na prvním řádku) s `title` a `typ`.
- Přezdívky a jiné tvary jména patří do `aliases`, aby na ně fungovaly odkazy.
- Úkol má `stav` (`aktivní`, `pozastavený`, `splněný`, `neúspěšný`, `slepá stopa`); uzavřené úkoly se přesouvají do `ukoly/splnene/`.
- Den v deníku má ve frontmatteru `journey.summary` a `journey.location` pro časovou osu na mapě cesty.

## Práce lokálně

```sh
npm ci
npm run check:content          # kontrola obsahu
npx quartz build --serve       # náhled na http://localhost:8080
```

Push do `master` spustí GitHub Actions, které obsah zkontrolují, sestaví web a nasadí ho na GitHub Pages.
