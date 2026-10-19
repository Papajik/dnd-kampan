---
name: dnd-recap
description: Připrav krátké shrnutí „Minule jste…“ na začátek další DnD session, nebo přehled otevřených linek a nejasností z kampaně. Použij, když uživatel chce recap, připomenutí, co se stalo, co družina řeší, nebo otázky pro hráče či DM. Nic nezapisuje do `content/`.
---

# DnD Recap

Recap slouží k přečtení nahlas na začátku session nebo k rychlé orientaci. Vychází výhradně ze zápisů v `content/` a nic v nich nemění.

## Podklady

1. `content/index.md` – aktuální stav a horké stopy.
2. Poslední jeden až dva dny v `content/denik/` (nejvyšší číslo souboru `<N>. den.md`).
3. Aktivní úkoly: soubory v `content/ukoly/` se `stav: aktivní`.
4. `content/postavy/Majetek družiny.md` – co má kdo u sebe a co je zapůjčené.
5. Podle potřeby stránky NPC a lokací, které poslední dny zmiňují.

## Výstup

Piš česky, ve druhé osobě množného čísla („Minule jste…“), bez wikilinků a Markdown odkazů, aby se text dal rovnou přečíst. Drž se tohoto pořadí:

1. **Minule jste…** – 4–8 vět o posledním dni, chronologicky, s důrazem na rozhodnutí a cliffhanger, na kterém session skončila.
2. **Kde právě jste** – jedna věta: místo, čas, kdo je s družinou.
3. **Otevřené linky** – 3–6 bodů z aktivních úkolů a horkých stop, každý s jednou větou, co je další krok.
4. **Nezapomeňte** – zapůjčené věci k vrácení, sliby NPC, nevyzvednuté odměny; jen pokud jsou v zápisech.

Na požádání přidej:

- **Otázky pro DM** – nejasnosti, které zápisy nechávají otevřené (např. sekce „Nejasnosti“ v Majetku družiny, rozpory mezi stránkami).
- **Delší recap** – shrnutí celé kampaně po hlavních linkách místo po dnech.

## Pravidla

- Nic nevymýšlej a nedomýšlej motivace postav; co zápisy neříkají, vynech.
- Nespoileruj: recap je pro hráče, takže ignoruj případné soubory ve složce `private/`.
- Když najdeš rozpor mezi stránkami (třeba jiný směr lokace v textu a na mapě), zmiň ho uživateli zvlášť pod recapem, ne v něm.
