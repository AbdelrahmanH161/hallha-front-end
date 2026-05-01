import { apiFetch } from "./client"

export async function transcribeChatAudio(
  blob: Blob,
  opts?: { signal?: AbortSignal; filename?: string },
): Promise<string> {
  const filename =
    opts?.filename ??
    (blob.type.includes("mp4") ? "recording.mp4" : "recording.webm")
  const form = new FormData()
  form.set("audio", blob, filename)
  const data = await apiFetch<{ text: string }>("/chat-audit/transcribe", {
    method: "POST",
    body: form,
    signal: opts?.signal,
  })
  return data.text
}
