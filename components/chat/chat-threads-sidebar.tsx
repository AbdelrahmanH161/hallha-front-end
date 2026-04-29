"use client"

import { Loader2, MessageSquarePlus, MoreVertical, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  useChatsQuery,
  useDeleteChatMutation,
} from "@/lib/api/queries/chats"
import { useChatStore } from "@/lib/stores/chat"
import { cn } from "@/lib/utils"

export function ChatThreadsSidebar() {
  const { data: threads = [], isLoading, isError } = useChatsQuery()
  const activeThreadId = useChatStore((s) => s.activeThreadId)
  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId)
  const abortStreaming = useChatStore((s) => s.abortStreaming)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const deleteMutation = useDeleteChatMutation()

  function newChat() {
    if (isStreaming) abortStreaming()
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setActiveThreadId(id)
  }

  function selectThread(id: string) {
    if (isStreaming) abortStreaming()
    setActiveThreadId(id)
  }

  async function deleteThread(id: string) {
    await deleteMutation.mutateAsync(id)
    if (activeThreadId === id) setActiveThreadId(null)
  }

  return (
    <aside className="flex h-full flex-col gap-3 rounded-xl border bg-card/50 p-3">
      <Button onClick={newChat} className="w-full justify-start gap-2">
        <MessageSquarePlus className="size-4" aria-hidden />
        New chat
      </Button>

      <ScrollArea className="-mx-1 h-[calc(100vh-22rem)] px-1">
        {isLoading ? (
          <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : isError ? (
          <div className="px-2 py-3 text-xs text-destructive">Failed to load threads</div>
        ) : threads.length === 0 ? (
          <div className="px-2 py-3 text-xs text-muted-foreground">
            No conversations yet.
          </div>
        ) : (
          <ul className="space-y-1">
            {threads.map((thread) => {
              const isActive = thread.thread_id === activeThreadId
              return (
                <li key={thread.thread_id}>
                  <div
                    className={cn(
                      "group flex items-center gap-1 rounded-md border border-transparent px-2 py-1.5 text-sm hover:bg-muted/40",
                      isActive && "border-border bg-muted/60"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => selectThread(thread.thread_id)}
                      className="flex-1 truncate text-start"
                      title={thread.title ?? thread.thread_id}
                    >
                      {thread.title?.trim() || "Untitled chat"}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-7 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                          aria-label="Thread actions"
                        >
                          <MoreVertical className="size-4" />
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
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </ScrollArea>
    </aside>
  )
}
