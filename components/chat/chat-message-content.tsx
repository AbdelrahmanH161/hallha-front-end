"use client"

import * as React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import { useTranslations } from "next-intl"
import remarkGfm from "remark-gfm"

import type { RetrievedSource } from "@/lib/types/retrieved-source"
import { cn } from "@/lib/utils"

/**
 * Build a deep link to the source document. For PDF document sources we append
 * `#page=N` — a de-facto standard fragment honored by Chrome / Edge / Firefox /
 * Safari native PDF viewers, which jumps directly to the cited page. For web
 * sources or sources without a URL, we return whatever we have (or null).
 *
 * Fragments are client-side only, so appending to a presigned S3 URL doesn't
 * break the signature.
 */
function sourceHref(source: RetrievedSource): string | null {
  if (!source.url) return null
  // Web search hits don't have page numbers in the same sense.
  if (source.type === "web") return source.url
  if (!Number.isFinite(source.page) || source.page <= 0) return source.url
  // Don't double-append a fragment if the URL already has one.
  if (source.url.includes("#")) return source.url
  return `${source.url}#page=${source.page}`
}

function sourceTooltip(source: RetrievedSource, pageLabel: string): string {
  const name = source.displayName?.trim() || source.source
  if (source.type === "web") return name
  return `${name} — ${pageLabel}`
}

const SOURCES_HEADING_RE =
  /(?:^|\n)(?:\s*(?:#+\s*)?(?:\*\*)?\s*Sources\s*(?:\*\*)?:?\s*)\n/i

type Part = { kind: "body" | "sources"; text: string }

function splitContent(content: string): Part[] {
  const match = content.match(SOURCES_HEADING_RE)
  if (!match || match.index === undefined) {
    return [{ kind: "body", text: content }]
  }
  const splitAt = match.index
  const body = content.slice(0, splitAt).trimEnd()
  const sources = content.slice(splitAt + match[0].length).trim()
  const parts: Part[] = []
  if (body) parts.push({ kind: "body", text: body })
  if (sources) parts.push({ kind: "sources", text: sources })
  return parts
}

function transformBodyText(
  text: string,
  anchorPrefix: string,
  sourcesById: Map<number, RetrievedSource>,
  pageLabelFor: (page: number) => string
): React.ReactNode[] {
  const tokens = text.split(/(\[\d+\])/g)
  return tokens.map((token, i) => {
    const m = token.match(/^\[(\d+)\]$/)
    if (!m) return token
    const n = m[1]
    const source = sourcesById.get(Number(n))
    const href = source ? sourceHref(source) : null
    const title = source ? sourceTooltip(source, pageLabelFor(source.page)) : undefined
    // If we have a real document URL, open it in a new tab so the user lands on
    // the cited page directly. Otherwise keep the in-page anchor jump fallback
    // (scrolls to the source row in the footer).
    if (href) {
      return (
        <sup key={i} className="px-0.5">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={title}
            className="font-medium text-primary no-underline hover:underline"
            aria-label={title ?? `Source ${n}`}
          >
            [{n}]
          </a>
        </sup>
      )
    }
    return (
      <sup key={i} className="px-0.5">
        <a
          href={`#${anchorPrefix}-${n}`}
          title={title}
          className="font-medium text-primary no-underline hover:underline"
          aria-label={title ?? `Source ${n}`}
        >
          [{n}]
        </a>
      </sup>
    )
  })
}

function walkChildren(
  children: React.ReactNode,
  anchorPrefix: string,
  sourcesById: Map<number, RetrievedSource>,
  pageLabelFor: (page: number) => string
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      return transformBodyText(child, anchorPrefix, sourcesById, pageLabelFor)
    }
    return child
  })
}

function leadingCitationNumber(node: React.ReactNode): string | null {
  let firstString: string | undefined
  React.Children.forEach(node, (child) => {
    if (firstString !== undefined) return
    if (typeof child === "string") firstString = child
    else if (React.isValidElement(child)) {
      const props = child.props as { children?: React.ReactNode }
      const inner = leadingCitationNumber(props.children)
      if (inner) firstString = `[${inner}]`
    }
  })
  if (!firstString) return null
  const m = firstString.match(/^\s*\[(\d+)\]/)
  return m?.[1] ?? null
}

function overflowMarkdownComponents(
  mapCell: (children: React.ReactNode) => React.ReactNode
): Pick<
  Components,
  "table" | "thead" | "tbody" | "tr" | "th" | "td" | "pre" | "code"
> {
  return {
    table: ({ children }) => (
      <div className="my-2 max-w-full overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-0 border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-border last:border-b-0">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="border border-border px-2 py-1.5 text-start font-semibold text-foreground">
        {mapCell(children)}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-border px-2 py-1.5 align-top text-foreground">
        {mapCell(children)}
      </td>
    ),
    pre: ({ children }) => (
      <div className="my-2 max-w-full overflow-x-auto rounded-md border border-border bg-muted/40">
        <pre className="m-0 p-3 text-xs leading-relaxed text-foreground">{children}</pre>
      </div>
    ),
    code: ({
      inline,
      className,
      children,
      ...props
    }: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }) => {
      if (inline) {
        return (
          <code
            className="rounded bg-muted/80 px-1 py-px font-mono text-[0.875em] wrap-break-word text-foreground"
            {...props}
          >
            {children}
          </code>
        )
      }
      return (
        <code
          className={cn("block min-w-0 font-mono text-sm text-foreground", className)}
          {...props}
        >
          {children}
        </code>
      )
    },
  }
}

export function ChatMessageContent({
  content,
  anchorPrefix,
  structuredSources,
}: {
  content: string
  anchorPrefix: string
  structuredSources?: RetrievedSource[]
}) {
  const t = useTranslations("app.chat")
  const parts = React.useMemo(() => {
    const raw = splitContent(content)
    if (structuredSources?.length) {
      return raw.filter((p) => p.kind === "body")
    }
    return raw
  }, [content, structuredSources])

  // Lookup map for inline `[n]` citation markers → source row. We pass it into
  // the markdown text walker so each marker can deep-link to the cited PDF page.
  const sourcesById = React.useMemo(() => {
    const m = new Map<number, RetrievedSource>()
    for (const s of structuredSources ?? []) m.set(s.id, s)
    return m
  }, [structuredSources])

  const pageLabelFor = React.useCallback(
    (page: number) => t("sourcePage", { page }),
    [t]
  )

  const bodyComponents: Components = React.useMemo(
    () => ({
      p: ({ children }) => (
        <p>{walkChildren(children, anchorPrefix, sourcesById, pageLabelFor)}</p>
      ),
      li: ({ children }) => (
        <li>{walkChildren(children, anchorPrefix, sourcesById, pageLabelFor)}</li>
      ),
      ...overflowMarkdownComponents((ch) =>
        walkChildren(ch, anchorPrefix, sourcesById, pageLabelFor)
      ),
    }),
    [anchorPrefix, sourcesById, pageLabelFor]
  )

  const sourcesComponents: Components = React.useMemo(
    () => ({
      li: ({ children }) => {
        const n = leadingCitationNumber(children)
        return (
          <li id={n ? `${anchorPrefix}-${n}` : undefined} className="scroll-mt-24">
            {children}
          </li>
        )
      },
      p: ({ children }) => {
        const n = leadingCitationNumber(children)
        return (
          <p id={n ? `${anchorPrefix}-${n}` : undefined} className="scroll-mt-24">
            {children}
          </p>
        )
      },
      ...overflowMarkdownComponents((ch) => ch),
    }),
    [anchorPrefix]
  )

  return (
    <div className="markdown-content min-w-0 space-y-2 wrap-break-word [&_h1]:mt-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:my-1.5 [&_ol]:ms-5 [&_ol]:list-decimal [&_p]:my-1.5 [&_strong]:font-semibold [&_ul]:my-1.5 [&_ul]:ms-5 [&_ul]:list-disc">
      {parts.map((part, i) =>
        part.kind === "body" ? (
          <ReactMarkdown
            key={`body-${i}`}
            remarkPlugins={[remarkGfm]}
            components={bodyComponents}
          >
            {part.text}
          </ReactMarkdown>
        ) : (
          <div
            key={`sources-${i}`}
            className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground"
          >
            <div className="mb-1 font-semibold uppercase tracking-wide text-foreground/70">
              {t("sourcesHeading")}
            </div>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={sourcesComponents}
            >
              {part.text}
            </ReactMarkdown>
          </div>
        )
      )}
      {structuredSources && structuredSources.length > 0 ? (
        <div className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground">
          <div className="mb-1 font-semibold uppercase tracking-wide text-foreground/70">
            {t("sourcesHeading")}
          </div>
          <ol className="my-1.5 ms-5 list-decimal space-y-1 [&_a]:text-primary">
            {structuredSources.map((s) => {
              const deepHref = sourceHref(s)
              return (
              <li
                key={s.id}
                id={`${anchorPrefix}-${s.id}`}
                className="scroll-mt-24 marker:text-muted-foreground"
              >
                <span className="inline-flex flex-wrap items-center gap-2">
                  {deepHref ? (
                    <a
                      href={deepHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={
                        s.type === "web"
                          ? undefined
                          : t("openDocument") + " — " + t("sourcePage", { page: s.page })
                      }
                      className="font-medium text-primary no-underline hover:underline"
                    >
                      {s.displayName?.trim()?.length ? s.displayName : s.source}
                    </a>
                  ) : (
                    <span className="font-medium text-foreground">
                      {s.displayName?.trim()?.length ? s.displayName : s.source}
                    </span>
                  )}
                  {s.type === "web" ? (
                    <span className="rounded-md border border-border bg-muted px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("webBadge")}
                    </span>
                  ) : s.scope === "client" ? (
                    <span className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Client document
                    </span>
                  ) : s.scope === "global" ? (
                    <span className="rounded-md border border-accent/40 bg-accent/10 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                      AAOIFI
                    </span>
                  ) : null}
                </span>
                {s.type !== "web" ? (
                  <span className="text-muted-foreground">
                    {" "}
                    — {t("sourcePage", { page: s.page })}
                  </span>
                ) : null}
                {s.url ? (
                  <span className="sr-only"> ({t("openDocument")})</span>
                ) : null}
              </li>
              )
            })}
          </ol>
        </div>
      ) : null}
    </div>
  )
}
