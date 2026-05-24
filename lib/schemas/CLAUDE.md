# lib/schemas/

Zod schemas for forms. Paired with shadcn `Form` + react-hook-form.

## Files

| File | Schemas |
|---|---|
| `auth.ts` | `loginSchema`, `signupSchema` |
| `onboarding.ts` | Per-step schemas for the register wizard (persona, business, auditor, first-client, plan) |
| `organization.ts` | Org profile / context-summary edits |

## i18n error messages

Error messages in schemas are **i18n keys**, not user-facing strings:

```ts
email: z.string().email("invalidEmail")
```

The form renders the key through `resolveErrorKey` (see `components/auth/login-form.tsx`) which calls `useTranslations` to produce the localized message. Don't return localized strings from the schema — that breaks AR/EN switching.

## Pattern

```tsx
const form = useForm<z.infer<typeof loginSchema>>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: "", password: "" },
});

// In JSX:
<FormField control={form.control} name="email" render={({ field, fieldState }) => (
  <FormItem>
    <FormLabel>{t("email")}</FormLabel>
    <FormControl><Input {...field} /></FormControl>
    <FormMessage>{resolveErrorKey(fieldState.error?.message, t)}</FormMessage>
  </FormItem>
)} />
```

When adding a field with an error message, add the i18n key to **both** `messages/ar.json` and `messages/en.json`.
