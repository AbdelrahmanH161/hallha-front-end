# lib/auth/

Thin wrapper around `better-auth/react`. Backend owns auth — this client just consumes it.

## `client.ts`

```ts
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL, // backend origin
  plugins: [organizationClient()],
});
export const { useSession, signIn, signUp, signOut } = authClient;
```

- **All HTTP carries `credentials: "include"`** (set by `apiFetch` and `streamChatAudit` automatically). Sessions are cookie-based.
- Use `useSession()` in client components to read the current user / org. For SSR/server components, the cookie is forwarded automatically when fetching backend endpoints with `credentials: "include"`.
- `organizationClient()` exposes `authClient.organization.list()`, `setActive()`, etc.

## Where things happen

- **Sign-in form** → `components/auth/login-form.tsx`. Submits via `signIn.email(...)`.
- **Register wizard** → `components/auth/onboarding/register-wizard.tsx`. Calls `signUp.email(...)` then the org-onboarding mutations from `lib/api/queries/organization.ts`.
- **Sign-out** → `components/layout/user-menu.tsx` calls `signOut()`. This is the canonical sign-out site; don't add buttons elsewhere.

## What the backend expects

- Session cookie from Better-Auth (set on login).
- Frontend origin in backend `CORS_ORIGIN` (or `ADMIN_ORIGIN` for the admin SPA).
- `req.user` + `req.activeOrgId` are populated server-side from the cookie; the client doesn't pass user ids manually.

## Roles

`user` / `admin` / `superadmin`. The main frontend is for `user`; admin/superadmin use the separate admin SPA in `hallha-node/admin/`. Don't gate UI by role in this app.
