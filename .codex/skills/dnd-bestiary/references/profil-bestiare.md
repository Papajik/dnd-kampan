# Profil bestiáře

Používej tuto strukturu pro novou nebo cíleně sjednocovanou stránku v `content/bestiar/`. Stránka je zápisem v deníku kampaně: zachycuje jen to, co družina prožila, pozorovala nebo co jí v kampani sdělila pojmenovaná postava. Nevkládej sekci bez ověřeného obsahu; místo toho ji vynech nebo zapiš `Neznámé`.

```md
---
title: Název tvora
typ: bestiář
---

<!-- Je-li portrét k dispozici, vlož jej sem jako ![[název-tvora.webp|240]]. -->

## Základní informace

| Vlastnost     | Informace               |
| ------------- | ----------------------- |
| Druh          | Neznámé                 |
| Výskyt        | [[Lokace]] nebo Neznámé |
| První setkání | [[N. den]]              |
| Stav poznání  | Pozorováno              |

## Popis

Stručný vyprávěcí popis podoby a dojmu, který tvor na družinu působil.

## Pozorování družiny

- V [[N. den|N. dni]] družina potvrdila konkrétní vlastnost nebo střet.

## Schopnosti a taktika

- Pouze pozorovaný projev, jeho důsledek a odkaz na zdroj v kampani.

## Neobjasněné otázky

- Otázka, na kterou dosavadní záznamy kampaně nedávají odpověď.

## Vazby

- [[Lokace]]: skutečná souvislost.
- [[NPC]]: skutečná souvislost.

## Výskyt v kampani

- [[N. den]]: stručný popis setkání.
```

## Pole a sekce

- Portrét je lokální soubor z `content/_assets/portraits/bestiar/`, vložený bez cesty jako `![[název-tvora.webp|240]]`. Není-li k dispozici, řádek s portrétem vynech.
- `Druh` uváděj pouze tehdy, je-li potvrzený kampaní nebo uživatelem; jinak napiš `Neznámé`.
- `Stav poznání` používej jako `Pozorováno`, `Částečně ověřeno` nebo `Pověst`; neprezentuj neověřenou informaci jako jistotu.
- `Popis` je souvislý text určený ke čtení v deníku. U potvrzeně převzatého tvora může krátce parafrázovat jeho vzhled z vhodné wiki; pro homebrew vychází jen z kampaně nebo informací od uživatele.
- `Schopnosti a taktika` popisuje pouze to, co se přímo projevilo ve hře. Bez takového pozorování sekci vynech.
- `Neobjasněné otázky` použij pro podstatné neznámé skutečnosti; nenahrazuj je informacemi z pravidel, wiki ani jiných externích zdrojů.
- Neuváděj klasifikaci, schopnosti, původ nebo údaje převzaté jen ze jména tvora známého z jiných her.

## Index bestiáře

`content/bestiar/index.md` drž krátký a ručně kurátorovaný. Čleň jej podle významu v kampani, například `## Aktuální hrozby`, `## Známé bytosti` a `## Neověřené stopy`. Ke každému odkazu připoj nanejvýš jednu větu, která nevymýšlí nové informace.
