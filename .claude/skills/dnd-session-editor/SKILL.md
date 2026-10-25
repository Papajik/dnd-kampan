---
name: dnd-session-editor
description: Zpracovávej ruční poznámky z DnD session do propojené Quartz/Obsidian kampaně. Použij při psaní či revizi deníku dne, aktualizaci postav, NPC, bestiáře, lokací, předmětů, majetku družiny, světa a úkolů, při přesunu splněných úkolů nebo při obnově aktuálního stavu v `content/index.md`.
---

# DnD Session Editor

Udržuj `content/` jako spolehlivou kroniku: deník vypráví, stránky entit uchovávají současný stav a indexy dávají stručný přehled.

## Pracovní postup

1. Urči cílový den a přečti jeho ruční poznámky spolu s předchozím dnem, `content/index.md` a všemi dotčenými stránkami. Nehádej chybějící fakta; nejasnost zachovej jako nejistotu nebo polož krátký dotaz.
2. Přepiš poznámky do `content/denik/<N>. den.md` v dosavadním českém, chronologickém a minulém čase v první osobě množného čísla („šli jsme“). Zachovej význam, oprav jen zjevné překlepy. Rozděl delší den podle scén, času nebo bitev a zakonči jej stručnými „Důležitými stopami“, pokud se hodí.
3. Pro každou podstatnou změnu přidej odkaz na existující stránku pomocí `[[Název]]` nebo `[[Soubor|správný tvar]]`. Nejprve vyhledej existující název přes `rg --files content` a `rg -n "aliases" -A4 content`; nevytvářej duplicitní stránky pro překlep ani jiné skloňování.
4. Aktualizuj pouze dotčené stránky v `postavy/`, `npc/`, `bestiar/`, `lokace/`, `predmety/`, `svet/` a `ukoly/`. Přidej jeden konkrétní, datovaný bod s odkazem na den; nepřepisuj starší fakta, pokud jim nová informace přímo neodporuje. Když nová informace zneplatní úvodní větu stránky (např. „nosí ji družina“), uprav i ji.
5. Pro novou důležitou entitu vytvoř krátkou samostatnou stránku v odpovídající složce s frontmatterem `title` a `typ` (viz tabulka níže) a přidej ji do indexu složky. Jednorázové bezejmenné postavy ani drobné nákupy samostatnou stránku nepotřebují.
6. Pokud se změnily peníze, odměny nebo kdo nosí důležitý předmět, aktualizuj `content/postavy/Majetek družiny.md`.
7. Aktualizuj `content/index.md` a tematické indexy: poslední den, aktuální centrum dění, aktivní cíle a jen skutečně horké stopy. Text indexů udržuj stručný; nekopíruj do nich celý deník. Do `content/denik/index.md` přidej jednu chronologickou položku. Sekci `## Minule jste…` v `content/index.md` neměň ručně; po zapsání nového dne ji obnov podle skillu `dnd-recap`.
8. Doplň `journey.summary` a `journey.location` do frontmatteru právě upraveného dne. Zastávky na mapě cesty řeší samostatný skill `dnd-journey-map`; polohu nikdy neodhaduj.
9. Spusť `npm run check:content` a oprav všechny chyby. Projdi varování o nepropojených zmínkách a osiřelých stránkách a doplň odkazy tam, kde dávají smysl. Pak rekapituluj změny; neoznamuj změnu souboru, pokud se skutečně nepropsala.

## Frontmatter

Každý soubor začíná `---` na **úplně prvním řádku** – prázdný řádek před ním způsobí, že Quartz frontmatter ignoruje a vypíše ho jako text.

| Složka          | `typ`     | Další pole                                             |
| --------------- | --------- | ------------------------------------------------------ |
| `denik/`        | `den`     | `journey.summary`, `journey.location`                  |
| `postavy/`      | `postava` | `aliases` pro přezdívky                                |
| `npc/`          | `npc`     | `stav`, `vztah`; volitelně `marker` pro mapu Glensdale |
| `bestiar/`      | `bestiář` |                                                        |
| `lokace/`       | `lokace`  | volitelně `marker` pro mapu okolí                      |
| `predmety/`     | `předmět` |                                                        |
| `svet/`         | `svět`    |                                                        |
| `svet/bozstvo/` | `božstvo` |                                                        |
| `svet/frakce/`  | `frakce`  |                                                        |
| `ukoly/`        | `úkol`    | `stav`, viz [úkol](references/ukol.md)                 |

Když se postava v poznámkách objevuje pod přezdívkou nebo jiným tvarem jména, přidej ho do `aliases` její stránky místo zakládání nové.

## Jména družiny

| Stránka                   | Používané tvary v textu             |
| ------------------------- | ----------------------------------- |
| `Rose Klamzila`           | Rosa, Rose, Klamzila                |
| `Jovani Giuseppe Solidus` | Giuseppe                            |
| `Feldon Lastfeast`        | Feldon                              |
| `Omarson`                 | Omarson                             |
| `Ash`                     | Ash (nezaměňovat s NPC `Bratr Ash`) |

Ručně psané poznámky obsahují překlepy jmen („Gueseppe“, „Omerson“); v deníku vždy použij správný tvar.

## Úkoly

- Pro nové úkoly a při výslovném sjednocení stávajících použij strukturu z `references/ukol.md`.
- U aktivního úkolu aktualizuj horní blok `> [!todo] Aktuální stav` a do `## Historie` přidej bod s odkazem na den.
- Úkol označ jako splněný jen tehdy, když poznámky potvrzují dokončení nebo když zadavatel výsledek přijal. „Získali jsme stopu“ ani „slíbili jsme se vrátit“ splnění neznamená.
- Při splnění přesuň soubor do `content/ukoly/splnene/` (název souboru zachovej), nastav `stav: splněný`, `title: <název> (splněno)` a horní blok `> [!success] Splněno`.
- V `content/ukoly/index.md` přesuň položku ze sekce „Aktivní“ do „Splněné“ a odkazuj cestou `[[splnene/<název>|<název>]]`. Odkazy v dřívějších denících ponech; Quartz je dohledá podle názvu.
- `npm run check:content` hlídá, že `stav` odpovídá složce i sekci v indexu.
- Při běžném zpracování session nepřeváděj automaticky starší úkoly do nového formátu; uprav jen nové nebo výslovně vyžádané.

## Místní konvence

- Deníky používají soubory `content/denik/<N>. den.md`. Formu zvol podle podkladů – příběhové scény s nadpisy, časové značky (jako 4. den) nebo seznamy lootu a iniciativy (jako 5. den) –, ne jednotný násilný formát.
- Stránky entit jsou stručné: úvodní identifikace a `## Poznámky` s ověřitelnými body. U věcí připoj `## Související úkoly`, když propojení pomáhá orientaci.
- Stav ve `content/index.md` vyjadřuje právě odehraný den; řádek „Poslední zapsaný den“ musí ukazovat na nejnovější den.
- Odkazuj na den jako `[[7. den|7. dni]]`, když to vyžaduje česká věta; pro samostatný název použij `[[7. den]]`.

## NPC profily

- Pro nové NPC a při výslovném sjednocení stávajících použij strukturu z `references/npc-profil.md`.
- Při sjednocení vždy vyhledej portrét v `content/_assets/portraits/npc/`. Pokud existuje, vlož ho jako první obsahový prvek stránky ve formátu `![[soubor.ext|240]]`; pokud neexistuje, portrét nevymýšlej a profil ponech bez něj.
- Rozvržení portrétu a tabulky zajišťuje společné CSS pro `.npc-profile` v `quartz/styles/custom.scss`; nepřidávej inline styly ani HTML obaly.
- Životní stav a vztah vůči družině zapisuj pouze do frontmatteru `stav` a `vztah` podle `references/npc-profil.md`, ne do tabulky.
- Do tabulky zapisuj jen potvrzené informace. Neznámou hodnotu napiš jako `Neznámé` nebo `—`; nevymýšlej ji.
- Do `## Vazby` udržuj stručné vztahy k entitám a družině. Do `## Poznámky` ukládej ostatní fakta a novinky chronologicky s odkazem na den.

## Kontrolní seznam

- [ ] Deník je srozumitelný i bez původních poznámek.
- [ ] Každá důležitá osoba, místo, předmět, frakce a úkol má odpovídající vazbu.
- [ ] U změněných entit je uveden den, kdy informace nastala.
- [ ] `content/index.md`, `denik/index.md` a dotčené tematické indexy odpovídají aktuálnímu stavu.
- [ ] Splněné úkoly jsou správně zařazené, aktivní cíle zůstávají aktivní.
- [ ] `Majetek družiny` odpovídá novým příjmům, výdajům a předmětům.
- [ ] `npm run check:content` nehlásí chyby.

## Referenční materiál

Před první úpravou nebo při nejistotě načti `references/kampanovy-model.md`; obsahuje konkrétní vzory a pravidla vyčtená z kampaně. Pro tvorbu nebo sjednocení NPC načti také `references/npc-profil.md`, pro hráčské postavy `references/postava-profil.md` a pro úkoly `references/ukol.md`.
