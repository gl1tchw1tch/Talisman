# Living Crossroads import validation and security review — 2026-11-15

## Source provenance
- Input: `the-living-crossroads-grimoire (4)(2).zip` (user-provided).
- SHA-256: `17df2745637950971472d0c7f3c1180d9b5fc9796366649e2670dd1489a6cd63`.
- Archive: 38 ZIP records including directories; 31 files, 622,774 uncompressed file bytes.
- Existing root project remains Talisman v8 (React 18 / Vite); proposed new project is an independent React 19 / Express / Vite application.

## Checks performed
| Check | Result | Details |
| --- | --- | --- |
| Extract ZIP | PASS | No extraction errors |
| Relative TS/TSX import-path scan | PASS | No missing relative or alias import target detected; static regex only |
| Known token-pattern scan | PASS (limited) | No matches for common Google/GitHub/OpenAI key patterns in extracted text; **not a full secrets audit** |
| `npm run lint` | BLOCKED | TS2688: Cannot find type definition file `vite/client` because node dependencies not installed |
| `npm run build` | BLOCKED | `vite: not found` because dependencies not installed |
| `npm ci --offline` | BLOCKED | No `package-lock.json`; archive includes `bun.lock` |
| Runtime / AI requests | NOT RUN | No real `GEMINI_API_KEY` supplied; no external service calls |
| Deployment | NOT RUN | No server or VPS changes |

## Source review findings
1. **High: Unauthenticated AI routes.** `POST /api/tts` and `POST /api/analyze-intent` call paid AI endpoints without authentication, authorization, or rate limiting. A public deployment could incur unauthorized costs.
2. **High: No request-length constraints for model prompts.** `server.ts` accepts up to 10 MB JSON bodies, but the two endpoints do not cap `text`, `statement`, or voice/style strings. Enforce smaller input sizes and per-user quotas.
3. **Medium: Errors reveal backend details.** The server returns `error.message` from provider exceptions to callers, potentially exposing internal diagnostics. Replace with generic public errors and log redacted details.
4. **Medium: Separate deploy surface.** New server uses port `3000`, binds `0.0.0.0`, and serves `dist` in production. Do not overlay it with the root Vite application without explicit routing and container separation.
5. **Medium: Dependency verification incomplete.** `vite@^8.3.0`, `typescript@^7.0.2` and `@google/genai@^2.32.0` cannot be resolved/verified in the offline execution environment. Validate using lockfile-aware install and check actual registry versions.
6. **Medium: Hard-coded natal chart.** `/api/analyze-intent` contains fixed natal positions; make profile selection explicit if other users will access the endpoint.
7. **Low: Default README is AI Studio boilerplate.** Replace with accurate standalone instructions and a privacy/deployment warning.

## Import status
The *source ZIP is not committed to this branch yet*. The GitHub connector accepts UTF-8 content supplied in tool calls but not the locally mounted ZIP or filesystem paths; the container runtime cannot resolve `github.com` to push a Git commit. Do not mistake this documentation-only PR for a completed source import.

## Safe next steps
1. Upload the extracted source tree to `living-crossroads/` on this branch using a Git-enabled environment (avoid root collisions and preserve the `.env.example` placeholder).
2. Run `bun install --frozen-lockfile` with a compatible Bun version; or generate an npm lockfile with network access and run `npm ci`.
3. Run `npm run lint` and `npm run build`; verify production startup and basic route validation with the AI endpoints mocked.
4. Add auth, rate limits, input size limits and sanitized errors before enabling external AI calls.
5. Audit the resulting file diff and complete code review; keep PR as draft until blockers resolve.
