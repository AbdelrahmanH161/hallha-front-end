import { API_URL, ApiError } from "@/lib/api/client"
import type { RetrievedSource } from "@/lib/types/retrieved-source"

export type SseEvent = { event: string; data: unknown }

export type StreamErrorKind =
  | "quota_exhausted"
  | "rate_limited"
  | "invalid_api_key"
  | "model_not_found"
  | "insufficient_credits"
  | "upstream_error"
  | "unknown"

export type StreamErrorPayload = {
  detail: string
  kind?: StreamErrorKind
  status?: number
  provider?: "gemini" | "groq"
  retryAfterSeconds?: number
}

export type StreamChatAuditOptions = {
  threadId: string
  clientId?: string | null
  message?: string
  file?: File | null
  signal?: AbortSignal
  onMeta?: (data: { thread_id: string; client_id?: string | null }) => void
  onToken?: (text: string) => void
  onSources?: (sources: RetrievedSource[]) => void
  onDone?: (data: { thread_id: string; client_id?: string | null }) => void
  onError?: (payload: StreamErrorPayload) => void
}

function parseEventBlock(block: string): SseEvent | null {
  let event = "message"
  const dataLines: string[] = []
  for (const line of block.split("\n")) {
    if (!line || line.startsWith(":")) continue
    if (line.startsWith("event:")) {
      event = line.slice(6).trim()
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart())
    }
  }
  if (dataLines.length === 0) return null
  const raw = dataLines.join("\n")
  try {
    return { event, data: JSON.parse(raw) }
  } catch {
    return { event, data: raw }
  }
}

export async function streamChatAudit({
  threadId,
  clientId,
  message,
  file,
  signal,
  onMeta,
  onToken,
  onSources,
  onDone,
  onError,
}: StreamChatAuditOptions): Promise<void> {
  const form = new FormData()
  form.set("thread_id", threadId)
  if (clientId) form.set("client_id", clientId)
  if (message) form.set("message", message)
  if (file) form.set("file", file, file.name)

  const res = await fetch(`${API_URL}/chat-audit/stream`, {
    method: "POST",
    body: form,
    credentials: "include",
    signal,
  })

  if (!res.ok || !res.body) {
    let detail = `HTTP ${res.status}`
    try {
      const data = (await res.json()) as { detail?: string }
      if (data.detail) detail = data.detail
    } catch {
      // ignore parse failure
    }
    throw new ApiError(res.status, detail)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let separatorIndex: number
      while ((separatorIndex = buffer.indexOf("\n\n")) >= 0) {
        const block = buffer.slice(0, separatorIndex)
        buffer = buffer.slice(separatorIndex + 2)
        const evt = parseEventBlock(block)
        if (!evt) continue
        switch (evt.event) {
          case "meta":
            onMeta?.(evt.data as { thread_id: string })
            break
          case "token":
            onToken?.((evt.data as { text?: string }).text ?? "")
            break
          case "sources": {
            const raw = evt.data as { sources?: unknown }
            const list = Array.isArray(raw.sources) ? raw.sources : []
            onSources?.(list as RetrievedSource[])
            break
          }
          case "done":
            onDone?.(evt.data as { thread_id: string })
            break
          case "error": {
            const raw = (evt.data ?? {}) as Partial<StreamErrorPayload>
            onError?.({
              detail: raw.detail ?? "stream error",
              kind: raw.kind,
              status: raw.status,
              provider: raw.provider,
              retryAfterSeconds: raw.retryAfterSeconds,
            })
            break
          }
        }
      }
    }
  } finally {
    reader.releaseLock?.()
  }
}
