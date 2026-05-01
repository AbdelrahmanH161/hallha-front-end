"use client"

import * as React from "react"
import Image from "next/image"
import {
  Loader2,
  MessageSquarePlus,
  MoreVertical,
  Search,
  Trash2,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { ChatSidebarUserPopover } from "@/components/chat/chat-sidebar-user-popover"
import { IslamicPattern } from "@/components/landing/islamic-pattern"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useChatsQuery,
  useDeleteChatMutation,
  type ChatThreadSummary,
} from "@/lib/api/queries/chats"
import { useChatStore } from "@/lib/stores/chat"
import { cn } from "@/lib/utils"

type GroupKey = "today" | "yesterday" | "lastWeek" | "older"

function bucketFor(iso?: string | null): GroupKey {
  if (!iso) return "older"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "older"
  const now = new Date()
  const start = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const today = start(now)
  const itemDay = start(d)
  const dayMs = 24 * 60 * 60 * 1000
  const diff = today - itemDay
  if (diff <= 0) return "today"
  if (diff === dayMs) return "yesterday"
  if (diff < 7 * dayMs) return "lastWeek"
  return "older"
}

function groupThreads(threads: ChatThreadSummary[]) {
  const groups: Record<GroupKey, ChatThreadSummary[]> = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  }
  for (const thread of threads) {
    groups[bucketFor(thread.lastMessageAt)].push(thread)
  }
  return groups
}

export type ChatSidebarPanelProps = {
  onNavigate?: () => void
}

export function ChatSidebarPanel({ onNavigate }: ChatSidebarPanelProps) {
  const t = useTranslations("app.chat")
  const [query, setQuery] = React.useState("")
  const { data: threads = [], isLoading, isError } = useChatsQuery()
  const activeThreadId = useChatStore((s) => s.activeThreadId)
  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const abortStreaming = useChatStore((s) => s.abortStreaming)
  const deleteMutation = useDeleteChatMutation()

  function newChat() {
    if (isStreaming) abortStreaming()
    setActiveThreadId(null)
    onNavigate?.()
  }

  function selectThread(id: string) {
    if (isStreaming) abortStreaming()
    setActiveThreadId(id)
    onNavigate?.()
  }

  async function deleteThread(id: string) {
    await deleteMutation.mutateAsync(id)
    if (activeThreadId === id) setActiveThreadId(null)
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return threads
    return threads.filter((th) => (th.title ?? "").toLowerCase().includes(q))
  }, [threads, query])

  const groups = React.useMemo(() => groupThreads(filtered), [filtered])

  const groupOrder: GroupKey[] = ["today", "yesterday", "lastWeek", "older"]

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <IslamicPattern opacity={0.035} />

      {/* Logo */}
      <div className="relative mx-auto flex items-center gap-2.5 px-4 pt-5 pb-3">
        <Image
          src="/logo.png"
          alt={t("brand")}
          width={48}
          height={48}
          className="size-12 object-contain"
        />
      </div>

      {/* New conversation CTA */}
      <div className="relative px-3 pb-3">
        <button
          type="button"
          onClick={newChat}
          className={cn(
            "shimmer flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-foreground",
            "bg-[linear-gradient(135deg,#064e3b_0%,#0a6652_100%)] shadow-[0_4px_16px_rgba(6,78,59,0.25)]",
            "transition-transform hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(6,78,59,0.35)]"
          )}
        >
          <MessageSquarePlus className="size-4" aria-hidden />
          {t("newConversation")}
        </button>
      </div>

      {/* Search */}
      <div className="relative px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={cn(
              "w-full rounded-lg border border-[var(--glass-border-card)] bg-primary/5 py-2 ps-9 pe-3 text-xs text-foreground outline-none",
              "placeholder:text-muted-foreground focus:border-accent/40"
            )}
          />
        </div>
      </div>

      {/* Thread list */}
      <div className="relative min-h-0 flex-1 overflow-y-auto px-2.5 pb-2">
        {isLoading ? (
          <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            {t("loading")}
          </div>
        ) : isError ? (
          <div className="px-2 py-3 text-xs text-destructive">
            {t("loadFailed")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-2 py-3 text-xs text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          groupOrder.map((key) => {
            const items = groups[key]
            if (items.length === 0) return null
            return (
              <div key={key} className="mb-2">
                <div className="px-1 pt-1.5 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {t(`groups.${key}`)}
                </div>
                <ul className="space-y-0.5">
                  {items.map((thread) => {
                    const isActive = thread.thread_id === activeThreadId
                    return (
                      <li key={thread.thread_id}>
                        <div
                          className={cn(
                            "group/thread flex items-center gap-1 rounded-lg border border-transparent px-2 py-2 text-sm transition-colors",
                            "hover:bg-primary/[0.05]",
                            isActive &&
                              "border-primary/20 bg-primary/[0.10] text-primary"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => selectThread(thread.thread_id)}
                            className="flex-1 truncate text-start"
                            title={thread.title ?? thread.thread_id}
                          >
                            <div
                              className={cn(
                                "truncate text-[13px] font-medium",
                                isActive ? "text-primary" : "text-foreground"
                              )}
                            >
                              {thread.title?.trim() || t("untitled")}
                            </div>
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-6 opacity-0 transition-opacity group-hover/thread:opacity-100 data-[state=open]:opacity-100"
                                aria-label={t("threadActions")}
                              >
                                <MoreVertical className="size-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={(e) => {
                                  e.preventDefault()
                                  void deleteThread(thread.thread_id)
                                }}
                              >
                                <Trash2 className="size-4" aria-hidden />
                                {t("deleteThread")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })
        )}
      </div>

      {/* Bottom user popover */}
      <div className="relative shrink-0 border-t border-[var(--glass-border)] px-2.5 py-2">
        <ChatSidebarUserPopover />
      </div>
    </div>
  )
}

export type ChatSidebarProps = {
  collapsed: boolean
}

export function ChatSidebar({ collapsed }: ChatSidebarProps) {
  return (
    <aside
      className={cn(
        "glass-strong relative z-10 hidden h-full shrink-0 flex-col border-e transition-[width,opacity] duration-200 ease-out lg:flex",
        collapsed
          ? "pointer-events-none w-0 overflow-hidden border-transparent opacity-0"
          : "w-[268px] opacity-100"
      )}
      aria-hidden={collapsed || undefined}
    >
      <ChatSidebarPanel />
    </aside>
  )
}
