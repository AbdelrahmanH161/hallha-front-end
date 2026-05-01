import type { RetrievedSource } from "@/lib/types/retrieved-source"

/** Inline citation markers like [1], [12] used by Halim for documents and web pages. */
export function citationIdsFromContent(content: string): Set<number> {
  const ids = new Set<number>()
  const re = /\[(\d+)\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    const n = Number(m[1])
    if (Number.isFinite(n)) ids.add(n)
  }
  return ids
}

function isWebSource(s: RetrievedSource): boolean {
  return s.type === "web"
}

/**
 * Footer list: only document/RAG rows actually cited in the message body; keep every web row
 * so Tavily URLs stay visible even when the model cites documents loosely.
 */
export function sourcesForAssistantFooter(
  content: string,
  sources: RetrievedSource[],
): RetrievedSource[] {
  if (!sources.length) return []

  const cited = citationIdsFromContent(content)
  const docs = sources.filter((s) => !isWebSource(s))
  const webs = sources.filter(isWebSource)

  const citedDocs = docs.filter((d) => cited.has(d.id))
  const merged = [...citedDocs, ...webs]
  merged.sort((a, b) => a.id - b.id)
  return merged
}
