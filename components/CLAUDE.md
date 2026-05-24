# components/

Feature folders own their components. `ui/` holds shadcn primitives + a small set of custom UI bits.

## Folders

| Folder | What's in it |
|---|---|
| `ui/` | shadcn/ui primitives (button, card, dialog, form, input, sheet, table, tooltip, ...). Plus custom `direction.tsx` (RTL provider — not Radix's) and `sonner.tsx` (toast wrapper). |
| `chat/` | Chat shell, sidebar, window, composer, message, suggestion chips, voice-recording pill, Halim avatar. SSE streaming + Zustand. → [`chat/CLAUDE.md`](chat/CLAUDE.md) |
| `auth/` | `login-form.tsx` + `onboarding/` wizard (Persona → Account → Onboarding → Plan → FirstClient). Don't rebuild the wizard — extend `WizardShell` / `Stepper`. |
| `dashboard/` | `onboarding-banner.tsx` (upsell/progress). |
| `landing/` | `mobile-nav.tsx`, `theme-toggle.tsx`, `islamic-pattern.tsx`. |
| `layout/` | Site chrome (`site-header`, `site-footer`) and dashboard chrome (`app-sidebar`, `app-header`, `app-breadcrumbs`, `user-menu`). Pages should not re-inline these. |
| `settings/` | `settings-dialog.tsx` + tabs (profile/organization/preferences). |
| `billing/` | Placeholder. |

## Adding shadcn components

```bash
npx shadcn@latest add <component>
```

Style is `radix-nova` (`components.json`). Generated components are React 19 function components — **don't introduce `forwardRef`**. `cn()` lives in `lib/utils.ts`.

## Theming

Always use theme tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card/50`, `border-border`, `bg-primary`, `bg-accent`. Never raw `slate-*` / `gray-*` — they fight dark mode and brand changes.

## RTL

Prefer logical Tailwind properties: `ms-`/`me-` over `ml-`/`mr-`, `text-start`/`text-end` over `text-left`/`text-right`, `rtl:rotate-180` for direction-aware icons (chevrons etc.).
