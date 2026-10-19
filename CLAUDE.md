# DnD Kampaň u Pompa

Česká kronika DnD kampaně publikovaná přes Quartz 4 na dnd.papajik.cz. Obsah je v `content/` (Obsidian vault), struktura a konvence jsou v `README.md`.

- Zpracování poznámek ze session: skill `dnd-session-editor`; bestiář `dnd-bestiary`; mapy `dnd-journey-map`; shrnutí před hrou `dnd-recap`.
- Po každé úpravě obsahu spusť `npm run check:content` (běží i v CI před buildem a při chybě nasazení zastaví).
- Úpravy Quartzu pro kampaň: `quartz/components/CampaignJourney.tsx` + `campaignJourneyModel.ts` (mapa cesty), `LeafletBanner.tsx` a `quartz/styles/custom.scss` (vzhled map a NPC profilů). Testy: `npm test`, typy: `npx tsc --noEmit`.
- Commit message piš jako běžnou krátkou zprávu, bez přidávání spoluautorství AI.
