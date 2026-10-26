---
name: dnd-journey-map
description: Doplňuj zastávky a trasy na mapu cesty družiny (`content/map/cesta-druziny.md`) a markery lokací či NPC na Leaflet mapy Glensdale a okolí. Použij, když uživatel chce zakreslit, kam družina došla, přidat zastávku či ikonu, nebo umístit lokaci na mapu.
---

# DnD Journey Map

V kampani jsou dva nezávislé mapové systémy se **dvěma různými souřadnicovými soustavami**. Nikdy je nezaměňuj a polohu nikdy neodhaduj: když není jasná z poznámek, z mapy ani od uživatele, zeptej se.

## 1. Mapa cesty družiny

Soubor `content/map/cesta-druziny.md` vykresluje komponenta `quartz/components/CampaignJourney.tsx` nad obrázkem `content/map/map.jpeg` (1600 × 1200 px). Data jsou v `journeyMap` ve frontmatteru:

```yaml
journeyMap:
  image: map.jpeg
  width: 1600
  height: 1200
  stops:
    - id: krypta-milencu # unikátní, kebab-case bez diakritiky
      order: 7 # pořadí v legendě, navazuje na poslední zastávku
      day: 4 # číslo dne v deníku
      label: Krypta milenců
      coordinates: [565, 990] # [x, y] v pixelech, počátek vlevo nahoře
      icon: journey-icons/07_krypta_milencu.svg
  segments:
    - day: 4
      points: [[790, 1010], [565, 990]] # lomená čára trasy, alespoň 2 body
```

Pravidla:

- `coordinates` a `points` jsou `[x, y]` od **levého horního rohu** obrázku.
- Segment navazuje na poslední bod předchozího segmentu; trasu veď po cestách na mapě, ne vzdušnou čarou přes hory.
- `order` je chronologické pořadí zastávek napříč dny (tak, jak je družina navštívila); legenda i přehrávání podle něj řadí. Při vložení zastávky doprostřed přečísluj následující zastávky i názvy jejich ikon.
- Každý den začíná tam, kde družina skutečně ráno byla (často v Glensdale), a končí tam, kde přespala – návrat do vesnice zakresli.
- Když se družina vrací stejnou cestou, zapiš zpáteční cestu jako samostatný segment s `travel: return` (vykreslí se tlumeněji) a veď jeho body asi 10 px vedle cesty tam, aby se čáry nepřekrývaly.
- Zastávka, kterou družina míjí znovu (rozcestí apod.), leží přesně na bodech obou tras.
- Přesun portálem zapiš jako samostatný segment s `travel: portal` (vykreslí se jako zelený tečkovaný oblouk a neodkrývá mlhu); body nastav do mírného oblouku.
- Ikony jsou kreslené obrázky v `content/map/journey-icons/` pojmenované `<order>_<id_s_podtržítky>.svg` (a `.png`). Novou ikonu vygeneruj podle sekce „Nová ikona“ níže; dokud ikona není, zastávku nepřidávej.
- Zastávka nebo segment pro den, který není v deníku, se nezobrazí; `npm run check:content` hlídá dny, ikony i duplicitní `id`.

Orientační body na `map.jpeg` (x, y): Glensdale ≈ [990, 1078], Laketown ≈ [605, 600], The Warm Inn ≈ [1010, 740], Dark Town ≈ [1205, 400], Nhal’Ruven ≈ [1485, 250]. Mirrathen Forest leží západně od Glensdale, pohoří Khurzales Mountains se táhne severovýchodně a východně od vesnice. Přibližně zakreslené: Doly u Glensdale ≈ [1085, 1060] na úpatí hor, Sulthura ≈ [1170, 905] v horách severovýchodně.

## Nová ikona

1. Vygeneruj obrázek přes Codex (`codex exec … < /dev/null`, nástroj na generování obrázků; bez zavřeného stdin se na pozadí zasekne) a jako referenci přilož některou stávající ikonu (`-i content/map/journey-icons/08_svatyne_selhary_tabor_blackskulls.png`). Zadání drž ve stylu: _hand-drawn woodcut / ink engraving, single dark sepia-brown ink (#372213), flat parchment background (#c9a878), no text, no border, wide ~2:1 composition, bold lines readable at 200×100 px_, plus popis motivu dne.
2. Výsledek si prohlédni; špatný nebo nečitelný motiv vygeneruj znovu.
3. Převeď ho na průhlednou ikonu ve správné barvě a velikosti: `python3 scripts/journey-icon.py vstup.png content/map/journey-icons/<order>_<id>` (vytvoří `.png` i `.svg`).

## 2. Leaflet mapy s markery

Stránky `content/map/glensdale.md` (obrázek `glensdale.jpeg`, 1600 × 1600) a `content/map/okoli-glensdale.md` (obrázek `map.jpeg`, 1600 × 1200) zobrazují markery ze všech stránek, které mají ve frontmatteru `marker`:

```yaml
marker:
  - mapName: okoli-glensdale # nebo glensdale
    coordinates: 121, 990 # řetězec "y, x"; y se počítá OD SPODNÍHO okraje
    icon: lucide-landmark # název ikony z lucide.dev s prefixem lucide-
    colour: "#6b5634"
    minZoom: -1
```

- `coordinates` je řetězec `"y, x"` v pixelech, kde `y` roste **zdola nahoru** (Leaflet `CRS.Simple`).
- Převod z mapy cesty na marker okolí: `y_leaflet = 1200 − y_cesta`, `x` zůstává. Glensdale `[990, 1079]` → `"121, 990"`.
- Nejspolehlivější je nechat uživatele kliknout nástrojem s ikonou špendlíku na mapě (copy tool je zapnutý v `quartz.config.ts`); zkopíruje přesně formát `"y, x"`.
- `marker: []` znamená, že stránka do mapy patří, ale poloha zatím není známá.

## Postup

1. Přečti deník dotčeného dne a zjisti, kudy družina šla a kde se zastavila.
2. Ověř polohu: orientační body výše, popis v lokaci, nebo dotaz na uživatele. Neznámou polohu nezapisuj.
3. Uprav `journeyMap` (zastávky + segmenty) nebo `marker` příslušné stránky.
4. Spusť `npm run check:content`; upozornění „bez zastávky ani trasy na mapě“ je v pořádku jen u dnů, kde poloha opravdu není známá.
5. Pro vizuální kontrolu spusť `npx quartz build --serve` a otevři `/map/cesta-druziny`.
