---
title: Cesta družiny
journeyMap:
  image: map.jpeg
  width: 1600
  height: 1200
  fog:
    home: [995, 1080]
  stops:
    - id: obrana-glensdale
      order: 1
      day: 1
      label: Obrana Glensdale
      coordinates: [995, 1080]
      icon: journey-icons/01_obrana_glensdale.svg
    - id: tharm
      order: 2
      day: 2
      label: Tharm
      coordinates: [840, 1145]
      icon: journey-icons/02_tharm.svg
    - id: anabelin-parez
      order: 3
      day: 3
      label: Anabelin pařez
      coordinates: [885, 1040]
      icon: journey-icons/03_anabelin_parez.svg
    - id: vexlin
      order: 4
      day: 3
      label: Vexlin
      coordinates: [790, 1010]
      icon: journey-icons/04_vexlin.svg
    - id: wisp
      order: 5
      day: 4
      label: Wisp
      coordinates: [695, 1135]
      icon: journey-icons/05_wisp.svg
    - id: pozar-rose-stopy
      order: 6
      day: 4
      label: Požár Rose a stopy
      coordinates: [680, 1080]
      icon: journey-icons/06_pozar_rose_stopy.svg
    - id: krypta-milencu
      order: 7
      day: 4
      label: Krypta milenců
      coordinates: [565, 990]
      icon: journey-icons/07_krypta_milencu.svg
    - id: pixie
      order: 8
      day: 5
      label: Pixie
      coordinates: [517, 976]
      icon: journey-icons/08_pixie.svg
    - id: svatyne-selhary-tabor-black-skulls
      order: 9
      day: 5
      label: Svatyně Selháry a tábor Black Skulls
      coordinates: [470, 985]
      icon: journey-icons/09_svatyne_selhary_tabor_blackskulls.svg
    - id: wendiga-a-leshy
      order: 10
      day: 5
      label: Wendigo a lešij
      coordinates: [545, 1040]
      icon: journey-icons/10_wendiga_a_leshy.svg
    - id: uz-jsme-tu-byli
      order: 11
      day: 5
      label: Tady už jsme byli
      coordinates: [630, 1040]
      icon: journey-icons/11_tady_uz_jsme_byli.svg
    - id: utek-u-lesa
      order: 12
      day: 5
      label: Útěk u lesa
      coordinates: [835, 990]
      icon: journey-icons/12_utek_u_lesa.svg
    - id: doly-zakazana-stola
      order: 13
      day: 6
      label: Doly a zakázaná štola
      coordinates: [1085, 1060]
      icon: journey-icons/13_doly_zakazana_stola.svg
    - id: pripravy-na-sulthuru
      order: 14
      day: 7
      label: Přípravy na Sulthuru
      coordinates: [960, 1110]
      icon: journey-icons/14_pripravy_na_sulthuru.svg
    - id: jeskyne-ankhegu
      order: 15
      day: 8
      label: Jeskyně ankhegů
      coordinates: [1110, 965]
      icon: journey-icons/15_jeskyne_ankhegu.svg
    - id: trhlina-v-sulthure
      order: 16
      day: 9
      label: Zhelxara a trhlina v Sulthuře
      coordinates: [1170, 905]
      icon: journey-icons/16_trhlina_v_sulthure.svg
  segments:
    - day: 2
      points: [[995, 1080], [970, 1088], [940, 1102], [905, 1120], [870, 1138], [840, 1145]]
    - day: 2
      travel: return
      points: [[840, 1145], [874, 1147], [910, 1129], [944, 1111], [974, 1097], [995, 1080]]
    - day: 3
      points:
        [
          [995, 1080],
          [970, 1070],
          [945, 1058],
          [920, 1050],
          [900, 1045],
          [885, 1040],
          [860, 1028],
          [830, 1017],
          [790, 1010],
        ]
    - day: 3
      travel: return
      points:
        [
          [790, 1010],
          [828, 1027],
          [856, 1037],
          [881, 1049],
          [897, 1055],
          [917, 1060],
          [941, 1067],
          [966, 1079],
          [995, 1080],
        ]
    - day: 4
      points:
        [
          [995, 1080],
          [962, 1084],
          [925, 1084],
          [890, 1080],
          [855, 1074],
          [820, 1066],
          [790, 1060],
          [760, 1055],
          [740, 1078],
          [718, 1106],
          [695, 1135],
          [688, 1108],
          [680, 1080],
          [655, 1058],
          [630, 1040],
          [598, 1014],
          [565, 990],
        ]
    - day: 5
      points:
        [
          [565, 990],
          [540, 980],
          [510, 975],
          [485, 978],
          [470, 985],
          [478, 997],
          [495, 1012],
          [518, 1028],
          [545, 1040],
        ]
    - day: 5
      points:
        [
          [545, 1040],
          [575, 1042],
          [605, 1040],
          [630, 1040],
          [660, 1028],
          [695, 1020],
          [730, 1012],
          [765, 1003],
          [800, 995],
          [835, 990],
          [860, 995],
          [885, 1010],
          [910, 1025],
          [930, 1035],
          [950, 1050],
          [973, 1068],
          [995, 1080],
        ]
    - day: 6
      points: [[995, 1080], [1020, 1074], [1050, 1067], [1085, 1060]]
    - day: 6
      travel: return
      points: [[1085, 1060], [1048, 1057], [1018, 1064], [995, 1080]]
    - day: 7
      points: [[995, 1080], [980, 1092], [960, 1110]]
    - day: 7
      travel: return
      points: [[960, 1110], [987, 1100], [995, 1080]]
    - day: 8
      points:
        [
          [995, 1080],
          [992, 1060],
          [990, 1040],
          [1010, 1020],
          [1035, 1003],
          [1060, 990],
          [1085, 978],
          [1110, 965],
        ]
    - day: 9
      points: [[1110, 965], [1125, 950], [1140, 935], [1155, 920], [1170, 905]]
    - day: 9
      travel: portal
      points:
        [
          [1170, 905],
          [1142, 914],
          [1116, 927],
          [1091, 944],
          [1069, 964],
          [1048, 987],
          [1028, 1015],
          [1011, 1046],
          [995, 1080],
        ]
---

Přehled odehraných dní, důležitých zastávek a postupně doplňované trasy družiny.

Zastávky a segmenty cesty se přidávají do `journeyMap` ve frontmatteru této stránky. Souřadnice jsou vždy dvojice `[x, y]` vzhledem k originálním rozměrům mapy.
