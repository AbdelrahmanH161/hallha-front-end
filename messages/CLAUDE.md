# messages/ — i18n

Two locale files: `ar.json` (Arabic, default) and `en.json` (English). Loaded by next-intl via `i18n/request.ts`.

## Hard rules

1. **Never hardcode user-facing text.** Always add a key here and read it via `getTranslations` (server) or `useTranslations` (client).
2. **Add to both locales.** A key that only exists in one file breaks the other locale at render. CI doesn't catch this — typecheck doesn't validate keys.
3. **AR is the default.** Author Arabic first when possible; translate to English second. The product is Arabic-first; rough English is preferable to rough Arabic.

## Key naming

- Namespace by feature: `auth.email`, `auth.signIn`, `chat.placeholder`, `clients.create`, `dashboard.title`, `errors.invalidEmail`.
- Use camelCase within the leaf segment (`invalidEmail`, not `invalid_email` or `invalid-email`) to match how schemas reference them.
- Zod error keys go under a namespace like `errors.*` or live in the same namespace as their field; pick one and be consistent within a schema.

## Testing RTL

There is no test runner. Toggle locale via the locale switcher (`components/locale-switch.tsx`) in dev and visually verify:
- Text reads correctly in both directions.
- Logical Tailwind properties (`ms-`/`me-`, `text-start/end`) flip as expected.
- Direction-aware icons (`rtl:rotate-180`) flip for chevrons / back arrows.

If you find layout that uses physical properties (`ml-`/`mr-`/`text-left`), prefer fixing it to using `rtl:` overrides.
