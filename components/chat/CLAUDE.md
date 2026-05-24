# components/chat — Chat shell + SSE streaming

## Architecture

```
ChatShell
├── ChatSidebar      ← thread list (useChatsQuery), collapse toggle, user popover
├── ChatHeader       ← thread title, menu
└── ChatWindow
    ├── ChatMessage[] ← rendered from useChatStore (streaming + history)
    └── ChatComposer ← text input, file upload, voice recording
```

`/dashboard` mounts `ChatShell` firm-wide. `/clients/[clientId]/chat` mounts it scoped to a client (passes `client_id` into the SSE stream).

## Streaming flow

1. Composer collects text + optional `file` + optional voice recording.
2. On submit, the composer calls `streamChatAudit({ threadId, clientId, message, file, onMeta, onToken, onSources, onDone, onError })` from `lib/api/sse.ts`.
3. Each SSE event mutates `useChatStore` (`lib/stores/chat.ts`): `meta` initializes the assistant message, `token` appends to it, `sources` attaches citations, `done` finalizes, `error` records `StreamErrorPayload`.
4. The window re-renders from the store; messages and tokens are rendered via `ChatMessageContent` (react-markdown + remark-gfm).

**Don't bypass the store while streaming.** State must flow through `useChatStore` so the UI stays consistent across mount/unmount.

## File upload

Inside the chat composer, files go through the SSE form (`streamChatAudit` adds them to the `FormData`). The backend extracts PDF text and threads it into the LangGraph state.

For **client documents** (not chat attachments), use `uploadClientDocument` from `lib/api/queries/clients.ts` — it uses **XMLHttpRequest** instead of fetch so `xhr.upload.onprogress` gives byte-level progress. Don't switch this to fetch unless `fetch` gains upload progress support and you've removed the XHR-only callsites.

## Voice recording

`voice-recording-pill.tsx` records audio via `MediaRecorder`, POSTs to `/chat-audit/transcribe`, and inserts the returned `text` into the composer input. The user then submits as normal text.

## Client-scoped chat

When mounted under `/clients/[clientId]/chat`, the composer reads `clientId` from the route params and includes it in every SSE call. The backend uses it to:
- merge `client_tenant_:{clientId}` Pinecone namespace into retrieval,
- namespace the thread id as `{orgId}:{clientId}:{userThreadId}`,
- store the client id in `chat_threads` metadata.
