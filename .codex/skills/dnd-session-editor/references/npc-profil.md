# NPC profil

Používej tento vzor pro nové NPC nebo při cílené úpravě existující stránky.

```md
---
title: Jméno NPC
typ: npc
---

<div class="npc-profile">

![[portret.jpeg|240]]

## Základní informace

| Vlastnost | Informace |
| --- | --- |
| Rasa | Neznámé |
| Povolání / role | Neznámé |
| Působí | Neznámé |
| Organizace | — |
| Stav vůči družině | Neutrální |

</div>

## Vazby

- [[Jiná entita]]: stručně popsaný vztah.

## Poznámky

- Ověřitelné výchozí zjištění.
- V [[N. den|N. dni]] nastala konkrétní nová skutečnost.
```

## Pravidla obsahu

- Nevyplňuj odhadovanou rasu, povolání ani motivaci jako fakt.
- Použij `Neznámé` pro hodnotu, kterou družina nezná, a `—` pro vlastnost, jež se zatím neuplatňuje.
- `Stav vůči družině` udržuj krátký: například `Spojenec`, `Neutrální`, `Nedůvěryhodný`, `Nepřítel`, `Neznámé` nebo `Mrtvý`.
- V `## Vazby` mají být jen skutečné vztahy a odkazy. Dějové detaily patří do `## Poznámky`.

## Vzhled v Quartz

Nastav v Quartz společný styl pro `.npc-profile`: na široké obrazovce grid se dvěma sloupci (`240px` a zbývající šířka), na úzkých obrazovkách jeden sloupec. Obrázek zarovnej nahoru a tabulku nenechávej přesahovat kontejner. Styl přidej do společného stylesheetu a nescopuj jej mimo `.npc-profile`.
