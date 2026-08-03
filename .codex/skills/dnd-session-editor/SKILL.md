---
name: dnd-session-editor
description: Zpracovávej ruční poznámky z DnD session do propojené Quartz/Obsidian kampaně. Použij při psaní či revizi deníku dne, aktualizaci postav, NPC, lokací, předmětů, světa a úkolů, při přesunu splněných úkolů nebo při obnově aktuálního stavu v `content/index.md`.
---

# DnD Session Editor

Udržuj `content/` jako spolehlivou kroniku: deník vypráví, stránky entit uchovávají současný stav a indexy dávají stručný přehled.

## Pracovní postup

1. Urči cílový den a přečti jeho ruční poznámky spolu s předchozím dnem, `content/index.md` a všemi dotčenými stránkami. Nehádej chybějící fakta; nejasnost zachovej jako nejistotu nebo polož krátký dotaz.
2. Přepiš poznámky do `content/denik/<N>. den.md` v dosavadním českém, chronologickém a minulém čase. Zachovej význam, oprav jen zjevné překlepy. Rozděl delší den podle scén, času nebo bitev a zakonči jej stručnými „Důležitými stopami“, pokud se hodí.
3. Pro každou podstatnou změnu přidej odkaz na existující stránku pomocí `[[Název]]` nebo `[[Soubor|správný tvar]]`. Nejprve vyhledej existující název přes `rg --files content`; nevytvářej duplicitní stránky pro překlep ani jiné skloňování.
4. Aktualizuj pouze dotčené stránky v `postavy/`, `npc/`, `lokace/`, `predmety/`, `svet/` a `ukoly/`. Přidej jeden konkrétní, datovaný bod s odkazem na den; nepřepisuj starší fakta, pokud jim nová informace přímo neodporuje.
5. Pro novou důležitou entitu vytvoř krátkou samostatnou stránku v odpovídající složce a přidej ji do jejího indexu. Jednorázové bezejmenné postavy ani drobné nákupy samostatnou stránku nepotřebují.
6. Aktualizuj `content/index.md` a tematické indexy: poslední den, aktuální centrum dění, aktivní cíle a jen skutečně horké stopy. Text indexů udržuj stručný; nekopíruj do nich celý deník.
7. Zkontroluj wikilinky vůči názvům souborů a rekapituluj změny. Neoznamuj změnu souboru, pokud se skutečně nepropsala.

## Úkoly

- Pro nové úkoly a při výslovném sjednocení stávajících použij strukturu z `references/ukol.md`.
- Udržuj aktivní úkol v `content/ukoly/` a doplň jeho `## Stav` o výsledek daného dne.
- Úkol označ jako splněný jen tehdy, když poznámky potvrzují dokončení nebo když zadavatel výsledek přijal. „Získali jsme stopu“ ani „slíbili jsme se vrátit“ splnění neznamená.
- Při splnění vytvoř, pokud chybí, `content/ukoly/splnene/`, přesuň tam soubor, nastav frontmatter `title: <název> (splněno)` a doplň poslední stavový bod s odkazem na den.
- V `content/ukoly/index.md` přesuň položku z „Aktivní“ do „Splněné“ a odkazuj cestou `[[splnene/<název>|<název>]]`. Odkazy v dřívějších denících ponech; Quartz je má po přesunu dál dohledat podle názvu.
- Starší splněné úkoly přesouvej hromadně jen na výslovnou žádost; při běžném zpracování se týká přesun jen nově dokončených úkolů.
- Při běžném zpracování session nepřeváděj automaticky všechny starší úkoly do nového formátu; uprav jen nové nebo výslovně vyžádané úkoly.

## Místní konvence

- Deníky používají soubory `content/denik/<N>. den.md`; první tři a pátý den mají příběhové bloky a souhrny, čtvrtý den používá časové značky. Zvol formu podle podkladů, ne jednotný násilný formát.
- Stránky entit jsou stručné: úvodní identifikace a `## Poznámky` s ověřitelnými body. U věcí připoj `## Související úkoly`, když propojení pomáhá orientaci.
- Stav ve `content/index.md` vyjadřuje právě odehraný den. `content/denik/index.md` dostává jednu chronologickou položku za každý zapsaný den.
- Odkazuj na den jako `[[7. den|7. dni]]`, když to vyžaduje česká věta; pro samostatný název použij `[[7. den]]`.

## NPC profily

- Pro nové NPC a při výslovném sjednocení stávajících použij strukturu z `references/npc-profil.md`.
- Při sjednocení vždy vyhledej portrét v `content/_assets/portraits/npc/`. Pokud existuje, vlož ho jako první obsahový prvek stránky ve formátu `![[soubor.ext|240]]`; pokud neexistuje, portrét nevymýšlej a profil ponech bez něj.
- V horním profilu zobraz portrét vlevo a tabulku „Základní informace“ vpravo; na mobilu je skládej pod sebe. Implementuj to společným Quartz CSS pravidlem omezeným na stránky `content/npc/`, nikoliv inline styly na jednotlivých stránkách.
- Do tabulky zapisuj jen potvrzené informace: rasa, povolání/role, působiště, organizace, životní stav a stav vůči družině. Neznámou hodnotu napiš jako `Neznámé` nebo `—`; nevymýšlej ji.
- Do `## Vazby` udržuj stručné vztahy k entitám a družině. Do `## Poznámky` ukládej ostatní fakta a novinky chronologicky s odkazem na den.
- Při běžném zpracování session nepřeváděj automaticky všechna starší NPC do nového formátu; uprav jen nová nebo výslovně vyžádaná NPC.

## Kontrolní seznam

- [ ] Deník je srozumitelný i bez původních poznámek.
- [ ] Každá důležitá osoba, místo, předmět, frakce a úkol má odpovídající vazbu.
- [ ] U změněných entit je uveden den, kdy informace nastala.
- [ ] `content/index.md`, `denik/index.md` a dotčené tematické indexy odpovídají aktuálnímu stavu.
- [ ] Splněné úkoly jsou správně zařazené, aktivní cíle zůstávají aktivní.

## Referenční materiál

Před první úpravou nebo při nejistotě načti `references/kampanovy-model.md`; obsahuje konkrétní vzory a aktuální pravidla vyčtená z kampaně. Pro tvorbu nebo sjednocení NPC načti také `references/npc-profil.md` a pro úkoly `references/ukol.md`.
