---
name: dnd-recap
description: Připrav krátké shrnutí „Minule jste…“ na začátek další DnD session, nebo přehled otevřených linek a nejasností z kampaně. Použij, když uživatel chce recap, připomenutí, co se stalo, co družina řeší, nebo otázky pro hráče či DM. Do `content/` zapisuje jen sekci „Minule jste…“ na úvodní stránce.
---

# DnD Recap

Recap slouží k přečtení nahlas na začátku session nebo k rychlé orientaci. Vychází výhradně ze zápisů v `content/`. Jediné, co v nich mění, je sekce `## Minule jste…` v `content/index.md` (viz [Zápis na web](#zápis-na-web)).

## Podklady

1. `content/index.md` – aktuální stav a horké stopy.
2. Poslední jeden až dva dny v `content/denik/` (nejvyšší číslo souboru `<N>. den.md`).
3. Aktivní úkoly: soubory v `content/ukoly/` se `stav: aktivní`.
4. `content/postavy/Majetek družiny.md` – co má kdo u sebe a co je zapůjčené.
5. Podle potřeby stránky NPC a lokací, které poslední dny zmiňují.

## Výstup

Piš česky, ve druhé osobě množného čísla („Minule jste…“). Verze pro uživatele je bez wikilinků a Markdown odkazů, aby se text dal rovnou přečíst nahlas. Drž se tohoto pořadí:

1. **Minule jste…** – 4–8 vět o posledním dni, chronologicky, s důrazem na rozhodnutí a cliffhanger, na kterém session skončila.
2. **Kde právě jste** – jedna věta: místo, čas, kdo je s družinou.
3. **Otevřené linky** – 3–6 bodů z aktivních úkolů a horkých stop, každý s jednou větou, co je další krok.
4. **Nezapomeňte** – zapůjčené věci k vrácení, sliby NPC, nevyzvednuté odměny; jen pokud jsou v zápisech.

Na požádání přidej:

- **Otázky pro DM** – nejasnosti, které zápisy nechávají otevřené (např. sekce „Nejasnosti“ v Majetku družiny, rozpory mezi stránkami).
- **Delší recap** – shrnutí celé kampaně po hlavních linkách místo po dnech.

## Zápis na web

Krátkou verzi recapu udržuj v `content/index.md` v sekci `## Minule jste…`, hned pod úvodním odstavcem a nad sekcí „Kde právě jsme“, aby si ji hráči mohli přečíst před hrou i z telefonu.

- Nahraď celou existující sekci; nikdy nepřidávej druhou. Ostatních sekcí indexu se nedotýkej.
- Obsah: první řádek `_Po [[<N>. den]]_` s odkazem na poslední den, pod ním jen bod 1 výše zkrácený na 3–5 vět. „Kde právě jste“, „Otevřené linky“ a „Nezapomeňte“ na web nepatří, úvodní stránka je už má v „Kde právě jsme“ a „Právě teď“.
- Na webu se smí použít wikilinky na postavy, NPC a lokace, ale střídmě, nejvýš jeden odkaz na jednu stránku.
- Otázky pro DM a nalezené rozpory do indexu nepiš, ty patří jen uživateli.
- Po zápisu spusť `npm run check:content`.

## Pravidla

- Nic nevymýšlej a nedomýšlej motivace postav; co zápisy neříkají, vynech.
- Nespoileruj: recap je pro hráče, takže ignoruj případné soubory ve složce `private/`.
- Když najdeš rozpor mezi stránkami (třeba jiný směr lokace v textu a na mapě), zmiň ho uživateli zvlášť pod recapem, ne v něm.
