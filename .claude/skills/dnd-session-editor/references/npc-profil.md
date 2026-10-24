# NPC profil

Používej tento vzor pro nové NPC nebo při cílené úpravě existující stránky. Před vytvořením profilu ověř `content/_assets/portraits/npc/`; první řádek s embeddem použij jen tehdy, když zde portrét existuje.

```md
---
title: Jméno NPC
typ: npc
stav: Živý
vztah: Neutrální
---

![[portret.jpeg|240]]

## Základní informace

| Vlastnost       | Informace |
| --------------- | --------- |
| Rasa            | Neznámé   |
| Povolání / role | Neznámé   |
| Působí          | Neznámé   |
| Organizace      | —         |

## Vazby

- [[Jiná entita]]: stručně popsaný vztah.

## Poznámky

- Ověřitelné výchozí zjištění.
- V [[N. den|N. dni]] nastala konkrétní nová skutečnost.
```

## Pravidla obsahu

- Nevyplňuj odhadovanou rasu, povolání ani motivaci jako fakt.
- Použij `Neznámé` pro hodnotu, kterou družina nezná, a `—` pro vlastnost, jež se zatím neuplatňuje.
- Frontmatter `stav` popisuje životní stav: `Živý`/`Živá`, `Mrtvý`/`Mrtvá`, `Nezvěstný`/`Nezvěstná`, `Nemrtvý`/`Nemrtvá`, `Neznámý`/`Neznámá`/`Neznámé`.
- Frontmatter `vztah` vyjadřuje vztah vůči družině: `Spojenec`/`Spojenkyně`, `Neutrální`, `Nepřítel`/`Nepřítelkyně`, `Nedůvěryhodný`/`Nedůvěryhodná`, `Hledaný`/`Hledaná` nebo `Neznámé`.
- Zachovej doložené znění včetně rodu. Obě hodnoty zapisuj pouze do frontmatteru; Quartz je zobrazí jako odznaky a v přehledu NPC.
- V `## Vazby` mají být jen skutečné vztahy a odkazy. Dějové detaily patří do `## Poznámky`.

## Vzhled v Quartz

Quartz automaticky přidává třídu `.npc-profile` všem stránkám ve složce `content/npc/` (viz `quartz/components/pages/Content.tsx` a `quartz/styles/custom.scss`). Na široké obrazovce zobrazí první vložený portrét vlevo a nadpis s tabulkou vpravo; na úzkých obrazovkách je složí pod sebe. Nepřidávej do Markdownu HTML obal `div`, protože by mohl narušit zpracování Obsidian embedů a tabulek.
