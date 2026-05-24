# app/ — Next.js App Router

Next 16 App Router. Server Components by default; add `"use client"` only when needed (hooks, browser APIs, Zustand stores, react-hook-form).

## Layout chain

`app/layout.tsx` (root) loads fonts (Montserrat + Almarai), sets `metadataBase`, and nests:

```
<NextIntlClientProvider>
  <ThemeProvider>
    <TooltipProvider>
      <Providers>          ← React Query + Sonner Toaster, in providers.tsx
        {children}
      </Providers>
    </TooltipProvider>
  </ThemeProvider>
</NextIntlClientProvider>
```

Don't re-wrap these in child layouts.

## Route groups

| Group | Layout | Routes |
|---|---|---|
| `(landing)` | implicit | `/` — marketing landing |
| `(auth)` | `(auth)/layout.tsx` | `/login`, `/register` (multi-step wizard) |
| `(dashboard)` | `(dashboard)/layout.tsx` — `DirectionProvider` + `SettingsDialog` | `/dashboard` (chat), `/clients`, `/clients/[clientId]`, `/clients/[clientId]/chat` |

`/dashboard` is the main audit chat (`ChatShell`). `/clients/[clientId]/chat` is the same shell scoped to a specific audited client (passes `client_id` to the SSE stream).

## PWA / metadata pieces

- `manifest.ts` — PWA manifest.
- `robots.ts` — disallows `/dashboard` and `/api`.
- `sitemap.ts` — landing pages only.
- `sw.ts` — Serwist service worker. Built to `public/sw.js`. Disabled in dev (`NODE_ENV === "development"`).
- `~offline/page.tsx` — offline fallback.

## Locale

Locale comes from the `locale` cookie via `i18n/request.ts` and defaults to **Arabic (`ar`)**. There is no `[locale]` route segment and no middleware — every layout that needs direction must call `getLocale()` and pass `dir` to `<DirectionProvider>`. The provider is the custom one in `components/ui/direction.tsx`, not the Radix one.

## Server vs client

- Root layout, marketing layouts, page-level data fetching → server.
- Anything using `useTranslations`, `useSession`, `useChatStore`, `useForm`, `usePathname` → client.
- The chat composer / window / sidebar are client because they own streaming state.
