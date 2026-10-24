# Profil hráčské postavy

Stránky v `content/postavy/` mají stejnou kostru. Hodnoty v tabulce vyplňuj **jen tehdy, když je potvrdí hráč nebo deník**; jinak buňku nech prázdnou. Nic neodhaduj, ani když to vypadá zřejmě.

```md
---
title: Celé jméno postavy
typ: postava
aliases:
  - Přezdívka
---

![[portret.webp|240]]

Krátká úvodní věta (např. od kdy je v družině).

## Základní informace

| Vlastnost | Informace |
| --------- | --------- |
| Rasa      |           |
| Povolání  |           |
| Úroveň    |           |
| Hráč      |           |
| Původ     |           |

## Poznámky

- V [[N. den|N. dni]] nastala konkrétní skutečnost.
```

- Portrét vlož jen tehdy, když existuje v `content/_assets/portraits/postavy/`; s portrétem se stránka zobrazí jako profil (portrét vlevo, tabulka vpravo).
- Výbavu nezapisuj sem, ale do `content/postavy/Majetek družiny.md`.
- Pozadí dodané hráčem patří mezi tabulku a `## Poznámky`: `## Rychlé info` (stručné body), `## Příběh` (souvislý text) a delší ukázky jako sbalený callout `> [!quote]- …`. Vzor je `Feldon Lastfeast.md`. Postavy a místa jen z pozadí nezakládej jako samostatné stránky.
