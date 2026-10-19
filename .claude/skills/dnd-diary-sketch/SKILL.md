---
name: dnd-diary-sketch
description: Přidávej do deníku kampaně ilustrace ve stylu perokresby na starém pergamenovém deníku s nadpisem a poznámkou psanými brkem, případně jejich vtipnou variantu ze školního sešitu do sekce Sešit. Použij, když uživatel chce obrázek, ilustraci nebo kresbičku k nějaké scéně v `content/denik/`.
---

# DnD Diary Sketch

Deníkové ilustrace vypadají jako stránka ze starého deníku dobrodruha: zažloutlý pergamen se skvrnami a ztmavlými okraji, bez linek. Kresba je detailní perokresba se šrafováním v tmavě sépiovém inkoustu. Nahoře je nadpis a dole krátká poznámka, obojí psané brkem **stejnou barvou** jako kresba, bez hodnocení a čísel. Vzor je v `references/style.webp`.

Existuje i vtipná varianta ze školního sešitu (linkovaný papír, propiska, červená poznámka a známka `0/10`), vzor `references/sesit-style.webp`. Ta do deníku nepatří; ukládá se do `content/_assets/sesit/sesit-<N>-<scena>.webp` a přidává se do galerie `content/sesit/index.md` pod nadpis dne. Dělej ji jen na výslovné přání.

## Výběr scény

- Vybírej momenty, které jsou v deníku skutečně zapsané a mají pointu: trapas, nečekané řešení, zvláštní předmět, absurdní hláška. Ilustrace nesmí přidávat děj, který se nestal.
- Nadpis popisuje situaci (3–5 slov), poznámka dole je suchý komentář vypravěče. Obojí česky a krátce, protože delší text generátor kazí.
- Hráčské postavy kresli jen podle známé podoby (Omarson je trpasličí paladin). Když podobu neznáš, zeptej se, nebo raději kresli předměty, nestvůry, místa či postavy zezadu a v dálce.
- Na jeden den stačí jedna ilustrace, výjimečně dvě.

## Generování

Obrázek vygeneruj přes Codex (`codex exec` má zapnuté generování obrázků) a jako referenci přilož `references/style.webp`:

```sh
codex exec --skip-git-repo-check --sandbox workspace-write -C <pracovní-složka> \
  -i .claude/skills/dnd-diary-sketch/references/style.webp \
  "Use your built-in image generation tool to create ONE image, then copy the generated PNG into the current directory as sketch.png. <ZADÁNÍ>" < /dev/null
```

Bez `< /dev/null` se `codex exec` spuštěný na pozadí zasekne na „Reading additional input from stdin…“. Víc obrázků najednou spouštěj nanejvýš po třech; při chybě „model is at capacity“ to zkus znovu.

Zadání skládej z této šablony:

> Square 1:1 image. Background: a single page of an old adventurer's journal — aged, yellowed parchment paper with subtle stains, foxing and slightly darkened edges, filling the whole frame. NO ruled lines, no margin line, no table around the page. In the middle a detailed pen-and-ink drawing with fine cross-hatching in dark sepia-brown iron-gall ink, as if drawn with a quill. At the top a short heading and at the bottom a short note, both handwritten with a quill in the SAME dark sepia-brown ink as the drawing, in an old-fashioned calligraphic hand. No red, no other colours, NO score, NO numbers, no circles. All text is in CZECH and must be spelled EXACTLY as given, including diacritics. No other text anywhere. Drawing: … Heading: '…' Note at the bottom: '…'.

## Kontrola a uložení

1. Výsledek si vždy prohlédni. Při překlepu v textu, chybějící diakritice, textu navíc, červené barvě, liniích sešitu nebo hodnocení vygeneruj znovu (nejvýš třikrát, pak se zeptej uživatele).
2. Převeď na WebP a zmenši: `magick sketch.png -resize 900x900 -quality 82 content/_assets/denik/<N>-<scena>.webp`.
3. Vlož do deníku jako samostatný odstavec hned za scénu, ke které patří: `![[<N>-<scena>.webp]]`. Styl (natočení, stín, šířka) zajišťuje `quartz/styles/custom.scss` pro stránky `denik/`.
4. Spusť `npm run check:content`.
