---
name: dnd-bestiary
description: Vytvářej a udržuj propojený bestiář pro tuto DnD Quartz/Obsidian kampaň. Použij při přidání, úpravě nebo odkazování na nestvůry a bytosti; ne pro jednotlivé NPC.
---

# DnD Bestiary

Udržuj `content/bestiar/` jako kroniku setkání družiny s významnými nestvůrami. Bestiář doplňuje deník: deník popisuje konkrétní střet, bestiář soustředí ověřené poznatky o tvorovi napříč kampaní, jeho portrét a stručný popis.

## Pracovní postup

1. Nejdřív vyhledej existující stránku přes `rg --files content`; nevytvářej duplicitní záznam pro skloňovaný tvar nebo překlep.
2. Přečti deníky, lokace a další stránky, které daného tvora zmiňují. Zapiš jen fakta potvrzená ve hře a ke každému novému poznatku přidej odkaz na den.
3. Pro novou důležitou nestvůru vytvoř `content/bestiar/<Název>.md`, přidej ji do `content/bestiar/index.md` a doplň wikilinky pouze tam, kde zlepší orientaci.
4. Před vytvořením nebo zásadní úpravou stránky načti [profil bestiáře](references/profil-bestiare.md).
5. Spusť Quartz build nebo alespoň zkontroluj nové wikilinky vůči názvům souborů.

## Hranice obsahu

- Bestiář je zápis v deníku kampaně, ne encyklopedie pravidel. Každá stránka má tabulku `Druh`, `Výskyt`, `První setkání` a `Stav poznání`; je-li k dispozici, následuje pod ní portrét a vyprávěcí sekce `## Popis`.
- Zapisuj výhradně to, co družina přímo prožila nebo pozorovala, případně co jí v kampani sdělila pojmenovaná postava. Každý poznatek propoj odkazem na den, lokaci nebo postavu.
- Je-li tvor výslovně potvrzený jako převzatý a existuje pro něj vhodná wiki, použij pro `## Popis` krátkou parafrázi jeho vzhledu. Nevkládej pravidla, statistiky, schopnosti ani dlouhý přepis zdroje.
- Homebrew je vždy popsaný výhradně z materiálů kampaně nebo na základě informací od uživatele. Stejný název jako v jiné hře není důvodem pro přebírání jejích údajů.
- Neznámé informace neodhaduješ. Zapiš `Neznámé` nebo je uveď v `## Neobjasněné otázky`.
- Portrét ukládej lokálně do `content/_assets/portraits/bestiar/` a vlož jej hned pod frontmatter jako `![[soubor.webp|240]]`. Pokud portrét ještě není k dispozici, nevkládej náhradní obrázek ani prázdný odkaz.
- Nevkládej stat block ani mechanické hodnoty.

## Propojení

- Odkazuj na den v českém tvaru, například `[[8. den|8. dni]]`.
- Odkazuj na existující lokace, NPC, úkoly a předměty jen při skutečné vazbě.
- Jednotlivé osoby patří do `content/npc/`; bestiář je pro druhy, monstra a anonymní či opakovaně se vracející nestvůry.
- Jednorázové bezejmenné potvory nezakládej samostatně, pokud nepřinášejí pokračující hrozbu, stopu nebo opakované střety.

## Kontrolní seznam

- [ ] Ověřil jsem, že stránka ani její alternativa už neexistuje.
- [ ] Každý údaj pochází z kampaně a je propojený s příslušným záznamem.
- [ ] Externí wiki jsem použil jen pro krátký popis potvrzeně převzatého tvora.
- [ ] Neznámé schopnosti a původ jsem si nedomýšlel.
- [ ] Portrét je lokální asset, nebo jsem jej korektně vynechal.
- [ ] Index a nové wikilinky odpovídají skutečnému obsahu.
