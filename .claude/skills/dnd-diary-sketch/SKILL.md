---
name: dnd-diary-sketch
description: Přidávej do deníku kampaně vtipné ilustrace ve stylu kresby propiskou na linkovaném papíře s červenou „učitelskou“ poznámkou a hodnocením. Použij, když uživatel chce obrázek, ilustraci nebo kresbičku k nějaké scéně v `content/denik/`.
---

# DnD Diary Sketch

Ilustrace vypadají jako stránka vytržená ze školního sešitu: linkovaný papír s červeným okrajem, kresba propiskou se šrafováním, nahoře černý ručně psaný nadpis, dole červená poznámka a zakroužkované hodnocení (`0/10`, `10/10`, `?/10`). Vzor je v `references/style.webp`.

## Výběr scény

- Vybírej momenty, které jsou v deníku skutečně zapsané a mají pointu: trapas, nečekané řešení, zvláštní předmět, absurdní hláška. Ilustrace nesmí přidávat děj, který se nestal.
- Nadpis popisuje situaci (3–5 slov), červená poznámka je suchý komentář „učitele“ (DM). Obojí česky a krátce, protože delší text generátor kazí.
- Nekresli konkrétní podobu hráčských postav, pokud ji deník nepopisuje; raději předměty, nestvůry, místa nebo postavy zezadu či v dálce.
- Na jeden den stačí jedna ilustrace, výjimečně dvě.

## Generování

Obrázek vygeneruj přes Codex (`codex exec` má zapnuté generování obrázků) a jako referenci přilož `references/style.webp`:

```sh
codex exec --skip-git-repo-check --sandbox workspace-write -C <pracovní-složka> \
  -i .claude/skills/dnd-diary-sketch/references/style.webp \
  "Use your built-in image generation tool to create ONE image, then copy the generated PNG into the current directory as sketch.png. <ZADÁNÍ>"
```

Zadání skládej z této šablony:

> Square 1:1 image in exactly the same style as the attached reference: a photo-flat scan of a single sheet of lined notebook paper (pale grey horizontal lines, a red vertical margin line on the left), filling the whole frame. In the middle a detailed black ballpoint pen sketch with cross-hatching. At the top, a short heading handwritten in neat black pen. At the bottom, a teacher-style remark handwritten in red pen, plus a red hand-drawn circle with a score. All handwritten text is in CZECH and must be spelled EXACTLY as given, including diacritics. No other text anywhere. Drawing: … Heading (black): '…' Red remark: '…' Red circled score: '…'.

## Kontrola a uložení

1. Výsledek si vždy prohlédni. Při překlepu v textu, chybějící diakritice, textu navíc nebo jiném stylu vygeneruj znovu (nejvýš třikrát, pak se zeptej uživatele).
2. Převeď na WebP a zmenši: `magick sketch.png -resize 900x900 -quality 82 content/_assets/denik/<N>-<scena>.webp`.
3. Vlož do deníku jako samostatný odstavec hned za scénu, ke které patří: `![[<N>-<scena>.webp]]`. Styl (natočení, stín, šířka) zajišťuje `quartz/styles/custom.scss` pro stránky `denik/`.
4. Spusť `npm run check:content`.
