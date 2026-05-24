# lib/stores/

Zustand. Two stores; both are ephemeral (not persisted to storage).

## `chat.ts` — `useChatStore`

Owns streaming state for the chat UI:

- `messages: ChatMessage[]` — both historical (from `useChatQuery`) and in-flight assistant tokens.
- `streaming: boolean` + `abortController?: AbortController` — current SSE stream.
- `sources: RetrievedSource[]` — citations from the most recent assistant turn.
- `error?: StreamErrorPayload` — last SSE error.

API:
- `start(threadId, clientId)` — opens a stream; initializes assistant placeholder.
- `appendToken(text)` — called from `onToken`.
- `setSources(list)` / `setError(payload)` / `finish()` — called from `onSources` / `onError` / `onDone`.
- `abort()` — cancels via the `AbortController` and clears `streaming`.

**Always go through the store while streaming.** Don't manage tokens in component state — switching threads mid-stream needs the store to abort and reset cleanly.

## `register-draft.ts`

Persists the multi-step register wizard's draft so refreshes don't lose entered data. Steps push partial drafts; the final submit step reads the merged draft.

This is ephemeral too — clears on successful submit or explicit reset.
