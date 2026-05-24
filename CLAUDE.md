# CLAUDE.md — hallha-front-end

Next.js 16 App Router frontend for the Hallha Sharia auditor. Pairs with the backend in `E:\client-projects\hallha-node` (Express 5, port 8000). Stack: React 19 + Tailwind v4 (CSS-first) + shadcn/ui (radix-nova) + next-intl (AR default) + better-auth + TanStack Query + Zustand + react-hook-form + Zod + Serwist (PWA). Path alias `@/*` resolves from repo root.

For cross-repo API contract, see [`HALLHA_INTEGRATION.md`](./HALLHA_INTEGRATION.md).

## Codebase map

| Path | What it is |
|---|---|
| `app/` | Next App Router (route groups `(landing)` / `(auth)` / `(dashboard)`), root layout, PWA pieces. → [`app/CLAUDE.md`](app/CLAUDE.md) |
| `components/` | Feature-organized UI. Shadcn primitives in `ui/`. → [`components/CLAUDE.md`](components/CLAUDE.md) |
| `components/chat/` | Chat shell + SSE streaming. → [`components/chat/CLAUDE.md`](components/chat/CLAUDE.md) |
| `lib/api/` | `apiFetch`, TanStack Query hooks, SSE client (`streamChatAudit`), upload helpers. → [`lib/api/CLAUDE.md`](lib/api/CLAUDE.md) |
| `lib/stores/` | Zustand (`useChatStore`, `useRegisterDraft`). → [`lib/stores/CLAUDE.md`](lib/stores/CLAUDE.md) |
| `lib/schemas/` | Zod schemas; error messages are i18n keys. → [`lib/schemas/CLAUDE.md`](lib/schemas/CLAUDE.md) |
| `lib/auth/` | `better-auth/react` client. → [`lib/auth/CLAUDE.md`](lib/auth/CLAUDE.md) |
| `lib/types/`, `lib/chat/`, `lib/utils.ts` | Type defs, chat utilities, `cn()`. |
| `messages/` | `ar.json` + `en.json`. → [`messages/CLAUDE.md`](messages/CLAUDE.md) |
| `i18n/request.ts` | Locale resolution (cookie → `ar` default). |
| `hooks/` | Custom hooks (e.g., `use-mobile.ts`). |
| `public/` | Static assets, PWA icons, generated `sw.js`. |
| `scripts/generate-pwa-icons.mjs` | `npm run pwa:icons`. |

## Critical gotchas (read before editing)

1. **Locale defaults to Arabic.** `i18n/request.ts` reads the `locale` cookie; default is `ar`. There is no `[locale]` segment and no middleware. Every layout that needs direction must call `getLocale()` and pass `dir` to the custom `<DirectionProvider>` from `components/ui/direction.tsx` (not the Radix one).
2. **Never hardcode UI strings.** Add the key to **both** `messages/ar.json` and `messages/en.json`, read via `useTranslations` / `getTranslations`. Zod error messages are i18n keys resolved at render.
3. **Theme tokens only.** `bg-background`, `text-foreground`, `border-border`, `bg-primary`, `bg-accent`. Never `slate-*` / `gray-*`.
4. **Logical Tailwind properties.** `ms-`/`me-`/`text-start`/`text-end`/`rtl:rotate-180`. Avoid `ml-`/`mr-`/`text-left`/`text-right`.
5. **Server Components by default.** Add `"use client"` only when a hook or browser API requires it.
6. **Streaming goes through `useChatStore`** (`lib/stores/chat.ts`). Don't manage SSE tokens in component state.
7. **`uploadClientDocument` uses XMLHttpRequest** for upload progress. Don't migrate to `fetch`.
8. **No test runner is configured.** Verify with `npm run typecheck`, `npm run lint`, and manual browser exercise. Don't introduce Jest/Vitest unless asked.
9. **React 19, no `forwardRef`.** All shadcn components are function-based; don't add `forwardRef`.

## Commands

```bash
npm run dev                    # Next dev (webpack flag set in script)
npm run build                  # Production build
npm run start                  # Production server
npm run typecheck              # tsc --noEmit
npm run lint                   # eslint
npm run format                 # prettier --write
npm run pwa:icons              # Regenerate PWA icons
```

Add shadcn components: `npx shadcn@latest add <name>` (style `radix-nova`, see `components.json`).

## Env (`.env.local`)

- `NEXT_PUBLIC_API_URL` — backend origin (e.g. `http://localhost:8000`)
- `NEXT_PUBLIC_AUTH_URL` — Better-Auth origin (same as backend in dev)
- `NEXT_PUBLIC_SITE_URL` — used by `metadataBase`, sitemap, robots
