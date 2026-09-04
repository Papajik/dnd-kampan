---
title: Cesta družiny
journeyMap:
  image: map.jpeg
  width: 1600
  height: 1200
  stops:
    - id: anabelin-parez
      order: 1
      day: 3
      label: Anabelin pařez
      coordinates: [885, 1040]
      icon: journey-icons/01_anabelin_parez.svg
    - id: vexlin
      order: 2
      day: 3
      label: Vexlin
      coordinates: [790, 1010]
      icon: journey-icons/02_vexlin.svg
    - id: tharm
      order: 3
      day: 2
      label: Tharm
      coordinates: [840, 1145]
      icon: journey-icons/03_tharm.svg
    - id: wisp
      order: 4
      day: 4
      label: Wisp
      coordinates: [695, 1135]
      icon: journey-icons/04_wisp.svg
    - id: pixie-rose-stopy
      order: 5
      day: 5
      label: Pixie, požár Rose a stopy
      coordinates: [680, 1080]
      icon: journey-icons/05_pixie_rose_stopy.svg
    - id: uz-jsme-tu-byli
      order: 6
      day: 5
      label: Tady už jsme byli
      coordinates: [630, 1040]
      icon: journey-icons/06_tady_uz_jsme_byli.svg
    - id: krypta-milencu
      order: 7
      day: 4
      label: Krypta milenců
      coordinates: [565, 990]
      icon: journey-icons/07_krypta_milencu.svg
    - id: svatyne-selhary-tabor-black-skulls
      order: 8
      day: 5
      label: Svatyně Selháry a tábor Black Skulls
      coordinates: [470, 985]
      icon: journey-icons/08_svatyne_selhary_tabor_blackskulls.svg
    - id: wendiga-a-leshy
      order: 9
      day: 5
      label: Wendigo a lešij
      coordinates: [545, 1040]
      icon: journey-icons/09_wendiga_a_leshy.svg
    - id: utek-u-lesa
      order: 10
      day: 5
      label: Útěk u lesa
      coordinates: [835, 990]
      icon: journey-icons/10_utek_u_lesa.svg
  segments:
    - day: 2
      points: [[995, 1080], [925, 1110], [840, 1145]]
    - day: 3
      points: [[995, 1080], [940, 1055], [885, 1040], [840, 1015], [790, 1010]]
    - day: 4
      points: [[790, 1010], [745, 1065], [695, 1135], [630, 1080], [565, 990]]
    - day: 5
      points: [[565, 990], [510, 975], [470, 985], [510, 1020], [545, 1040]]
    - day: 5
      points:
        [[545, 1040], [630, 1040], [680, 1080], [755, 1030], [835, 990], [930, 1035], [995, 1080]]
---

Přehled odehraných dní, důležitých zastávek a postupně doplňované trasy družiny.

Zastávky a segmenty cesty se přidávají do `journeyMap` ve frontmatteru této stránky. Souřadnice jsou vždy dvojice `[x, y]` vzhledem k originálním rozměrům mapy.
