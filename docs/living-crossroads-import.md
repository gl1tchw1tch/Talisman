# Living Crossroads Grimoire import plan

Source archive: `the-living-crossroads-grimoire (4)(2).zip` (user-supplied 2026-11-15). This is an **import staging plan**, not a completed import.

## Existing repository
- Default branch: `main`.
- Existing application: `talisman-engine` version `8.0.0`, React 18 + Vite.
- Keep the current application and its deployment untouched.

## Incoming project
- Metadata name: The Living Crossroads Grimoire.
- React 19, Vite 8, TypeScript, Express, @google/genai, jspdf, lucide-react, motion.
- The archive has 38 entries (including directories), with core files `src/App.tsx`, `server.ts`, `src/components/TalismanVectorCanvas.tsx`, `src/components/TalismanCompleteImagePlate.tsx`, `src/components/AffinityDesignerBlueprint.tsx`, `src/data/grimoireData.ts`, `src/data/masterGrimoireDatabase.ts`, `src/data/soiSynthesisEngine.ts`, `src/data/airtableRelationalSchema.ts`, and `src/utils/exportGrimoirePdf.ts`.
- Includes reference research under `public/assets/aistudio/`.
- Package has no declared release version beyond `0.0.0`; do not label it v9 or v10 without a verified versioning decision.

## Safe migration checklist
- [ ] Import all source files from the supplied ZIP under `living-crossroads/` preserving relative paths.
- [ ] Do not import real `.env` files or API keys. Keep only the placeholder `.env.example`.
- [ ] Keep existing Talisman v8 root files and git history intact.
- [ ] Install dependencies inside `living-crossroads/` and run `npm run lint` and `npm run build`.
- [ ] Review server routes and Gemini API key handling before deployment.
- [ ] Verify talisman vector exports, PDF, source data and election behavior.
- [ ] Review differences and merge only after passing checks.

The GitHub connector cannot automatically read local ZIP bytes as repository file payloads. No source code from the archive has been committed at this stage.
