"use client"

import * as React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import { useTranslations } from "next-intl"
import remarkGfm from "remark-gfm"

import type { RetrievedSource } from "@/lib/types/retrieved-source"

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

function transformBodyText(text: string, anchorPrefix: string): React.ReactNode[] {
  const tokens = text.split(/(\[\d+\])/g)
  return tokens.map((token, i) => {
    const m = token.match(/^\[(\d+)\]$/)
    if (!m) return token
    const n = m[1]
    return (
      <sup key={i} className="px-0.5">
        <a
          href={`#${anchorPrefix}-${n}`}
          className="font-medium text-primary no-underline hover:underline"
          aria-label={`Source ${n}`}
        >
          [{n}]
        </a>
      </sup>
    )
  })
}

function walkChildren(
  children: React.ReactNode,
  anchorPrefix: string
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      return transformBodyText(child, anchorPrefix)
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

  const bodyComponents: Components = React.useMemo(
    () => ({
      p: ({ children }) => <p>{walkChildren(children, anchorPrefix)}</p>,
      li: ({ children }) => <li>{walkChildren(children, anchorPrefix)}</li>,
      td: ({ children }) => <td>{walkChildren(children, anchorPrefix)}</td>,
    }),
    [anchorPrefix]
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
    }),
    [anchorPrefix]
  )

  return (
    <div className="markdown-content min-w-0 space-y-2 break-words [&_h1]:mt-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:my-1.5 [&_ol]:ms-5 [&_ol]:list-decimal [&_p]:my-1.5 [&_strong]:font-semibold [&_ul]:my-1.5 [&_ul]:ms-5 [&_ul]:list-disc">
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
            {structuredSources.map((s) => (
              <li
                key={s.id}
                id={`${anchorPrefix}-${s.id}`}
                className="scroll-mt-24 marker:text-muted-foreground"
              >
                <span className="inline-flex flex-wrap items-center gap-2">
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
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
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  )
}
