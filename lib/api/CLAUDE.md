# lib/api/

All HTTP to the hallha-node backend goes through this folder. Don't `fetch` directly from components.

## `client.ts` — `apiFetch<T>(path, opts)`

- Base URL: `process.env.NEXT_PUBLIC_API_URL` (falls back to a hardcoded prod URL — make sure `.env.local` is set in dev).
- Always sends `credentials: "include"` (Better-Auth cookies).
- Auto-sets `Content-Type: application/json` unless body is `FormData`.
- Non-2xx → throws `ApiError(status, detail)`. `detail` comes from the response body's `detail` or `message` field; falls back to `HTTP {status}`.
- 204 → `undefined`.
- `application/json` → parsed; otherwise text.

## Query hooks (`queries/*.ts`)

Hooks per resource, namespaced query-key factories for invalidation:

- `chats.ts` — `useChatsQuery`, `useChatQuery`, `useDeleteChatMutation`. Keys: `chatKeys.all`, `chatKeys.list({clientId})`, `chatKeys.detail(id)`.
- `clients.ts` — `useClientsQuery`, `useClientQuery`, `useCreateClientMutation`, `useUpdateClientMutation`, `useArchiveClientMutation`. Documents: `useClientDocumentsQuery`, `uploadClientDocument` (XHR + progress), `useDeleteClientDocumentMutation`.
- `organization.ts` — `useOrganizationQuery`, `useUpdateCompanyProfileMutation`, `useSetPersonaMutation`, `useSkipOnboardingMutation`, `useSubmitBusinessOnboardingMutation`, `useSubmitAuditorOnboardingMutation`, `useSubmitFirstClientMutation`, `useChoosePlanMutation`.

Reuse the key factories for invalidation — don't pass raw arrays. New endpoints get their own key factory.

## React Query defaults (`app/providers.tsx`)

- `staleTime: 30_000`
- `refetchOnWindowFocus: false`
- Retry skipped for 4xx, otherwise capped at 2.
- Mutations never retry.

## `sse.ts` — `streamChatAudit`

POSTs `FormData { thread_id, client_id?, message?, file? }` to `/chat-audit/stream`. Parses SSE blocks (`\n\n`-separated) into events: `meta`, `token`, `sources`, `done`, `error`. Each event has a callback prop. On non-2xx, throws `ApiError` before reading the stream.

`StreamErrorPayload` (from the `error` event) carries `{ detail, kind?, status?, provider?, retryAfterSeconds? }` for quota/rate-limit UX (matches backend `parseUpstreamLlmError` output).

## `transcribe.ts` — voice transcription

POSTs `FormData { audio }` to `/chat-audit/transcribe`; returns `{ text }`.

## Upload progress

`uploadClientDocument` uses **XMLHttpRequest** specifically for `xhr.upload.onprogress`. The standard `fetch` API doesn't expose upload progress in browsers. Don't migrate this to fetch.

## Errors in the UI

Catch `ApiError` from React Query `error`. `error.status` + `error.detail` are stable; messages may be i18n keys returned by the backend in some flows.
