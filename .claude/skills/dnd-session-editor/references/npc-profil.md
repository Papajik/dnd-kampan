# NPC profil

Používej tento vzor pro nové NPC nebo při cílené úpravě existující stránky. Před vytvořením profilu ověř `content/_assets/portraits/npc/`; první řádek s embeddem použij jen tehdy, když zde portrét existuje.

```md
---
title: Jméno NPC
typ: npc
---

![[portret.jpeg|240]]

## Základní informace

| Vlastnost | Informace |
| --- | --- |
| Rasa | Neznámé |
| Povolání / role | Neznámé |
| Působí | Neznámé |
| Organizace | — |
| Stav | Živý |
| Stav vůči družině | Neutrální |

## Vazby

- [[Jiná entita]]: stručně popsaný vztah.

## Poznámky

- Ověřitelné výchozí zjištění.
- V [[N. den|N. dni]] nastala konkrétní nová skutečnost.
```

## Pravidla obsahu

- Nevyplňuj odhadovanou rasu, povolání ani motivaci jako fakt.
- Použij `Neznámé` pro hodnotu, kterou družina nezná, a `—` pro vlastnost, jež se zatím neuplatňuje.
- `Stav` popisuje životní stav: `Živý`, `Mrtvý`, `Nezvěstný`, `Neznámý` nebo podle potřeby `Nemrtvý`.
- `Stav vůči družině` udržuj krátký a nezávislý na životním stavu: například `Spojenec`, `Neutrální`, `Nedůvěryhodný`, `Nepřítel` nebo `Neznámé`.
- V `## Vazby` mají být jen skutečné vztahy a odkazy. Dějové detaily patří do `## Poznámky`.

## Vzhled v Quartz

Quartz automaticky přidává třídu `.npc-profile` všem stránkám ve složce `content/npc/`. Na široké obrazovce zobrazí první vložený portrét vlevo a nadpis s tabulkou vpravo; na úzkých obrazovkách je složí pod sebe. Nepřidávej do Markdownu HTML obal `div`, protože by mohl narušit zpracování Obsidian embedů a tabulek.
