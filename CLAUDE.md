# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev         # Next 16 + Turbopack
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (next/core-web-vitals + next/typescript)
npm run format      # prettier --write **/*.{ts,tsx}
```

There is no test runner configured — do not invent one. Verify changes with `typecheck` + `lint` and by exercising routes in `dev`.

Add shadcn components via `npx shadcn@latest add <component>` (style is `radix-nova`, see `components.json`). All shadcn components are already function-based for React 19 — do not introduce `forwardRef`.

Required env vars (see `.env.local`):
- `NEXT_PUBLIC_API_URL` — backend API for `apiFetch` (`lib/api/client.ts`)
- `NEXT_PUBLIC_AUTH_URL` — better-auth server (`lib/auth/client.ts`)
- `NEXT_PUBLIC_SITE_URL` — used by `metadataBase`, sitemap, robots

## Architecture

**Stack.** Next.js 16 App Router + React 19 + Tailwind v4 (CSS-first, no `tailwind.config`) + shadcn/ui (radix-nova) + next-intl + better-auth + TanStack Query + Zustand + react-hook-form + Zod. Path alias `@/*` resolves from repo root.

**Route groups.** `app/(landing)`, `app/(auth)`, `app/(dashboard)` — each owns its layout. Root `app/layout.tsx` only sets fonts (Montserrat + Almarai), `metadataBase`, and wraps `NextIntlClientProvider` → `ThemeProvider` → `TooltipProvider` → `Providers` (React Query + Sonner). Marketing chrome lives in `components/layout/site-header.tsx` + `site-footer.tsx`; dashboard chrome in `app-header.tsx` + `app-breadcrumbs.tsx` + `user-menu.tsx`. Do not re-inline headers into pages.

**Bilingual / RTL is load-bearing.** Locale is read from a `locale` cookie in `i18n/request.ts` and **defaults to Arabic (`ar`)** — there is no `[locale]` route segment, no middleware. Every layout calls `getLocale()` and passes `dir` to `<DirectionProvider>` (custom, in `components/ui/direction.tsx`). All user-facing copy is keyed in `messages/ar.json` + `messages/en.json` and read via `getTranslations` (server) or `useTranslations` (client). When adding a string, add it to **both** locale files; never hardcode UI text. For RTL-sensitive layout, prefer logical properties (`ms-`/`me-`, `text-start`/`text-end`, `rtl:rotate-180` for direction-aware icons).

**Theming.** Use theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card/50`, `border-border`, `bg-primary`, `bg-accent`) so dark mode and brand changes propagate. Avoid raw `slate-*`/`gray-*` — they fight the theme. The `cn()` helper lives in `lib/utils.ts`.

**Data layer.**
- `lib/api/client.ts` exports `apiFetch<T>(path, opts)` and `ApiError`. It sends `credentials: "include"`, handles JSON/FormData bodies, and throws `ApiError` on non-2xx. All HTTP must go through it.
- React Query hooks live under `lib/api/queries/*.ts` and use namespaced query keys (e.g. `chatKeys.list()`, `chatKeys.detail(id)`). Reuse those key factories for invalidation.
- `lib/api/sse.ts` (`streamChatAudit`) handles the SSE chat stream and is wired through the Zustand `useChatStore` (`lib/stores/chat.ts`) for streaming token state. Don't bypass the store when streaming.
- Query client config in `app/providers.tsx`: 30 s `staleTime`, no `refetchOnWindowFocus`, retry skipped for 4xx; mutations never retry.

**Auth.** `lib/auth/client.ts` exports `authClient`, `useSession`, `signIn`, `signUp`, `signOut` from `better-auth/react` with the `organizationClient` plugin. Use these instead of fetching `/api/auth` manually. The user menu (`components/layout/user-menu.tsx`) is the canonical sign-out site.

**Forms.** All forms use shadcn `Form` + `react-hook-form` + Zod. Schemas live in `lib/schemas/{auth,organization}.ts`; error messages are stored as **i18n keys** (e.g. `"invalidEmail"`) and resolved at render time via the `resolveErrorKey` pattern in `components/auth/login-form.tsx`. The multi-step register flow (`components/auth/onboarding/`) persists draft state through `lib/stores/register-draft.ts` and uses `WizardShell` + `Stepper` — keep that wizard intact rather than rebuilding it.

**Dashboard IA.** `/dashboard` is the chat (chat threads sidebar + window). `/dashboard/overview` is the placeholder Sharia Meter / Alerts. `/dashboard/transactions` is the queue. Sidebar nav order and labels are driven by `app.nav.*` keys in `components/dashboard/app-sidebar.tsx`. The dashboard layout's inner card uses `flex min-h-0 flex-1` so chat fills full height — preserve that when editing the layout.

**SEO.** Landing page exposes `generateMetadata` (locale-aware, hreflang via `alternates.languages`). `app/sitemap.ts` and `app/robots.ts` are static; `/dashboard` and `/api` are disallowed in robots.

## Conventions

- Prettier: no semicolons, double quotes, 2-space, ES5 trailing commas, `prettier-plugin-tailwindcss` sorts class lists (recognises `cn` and `cva`).
- Components are server components by default; add `"use client"` only when a hook or browser API is needed (e.g. `usePathname`, `useTranslations` in client context, Zustand stores, react-hook-form).
- The custom `DirectionProvider` in `components/ui/direction.tsx` is **not** the Radix one — keep using it so RTL state propagates consistently.
