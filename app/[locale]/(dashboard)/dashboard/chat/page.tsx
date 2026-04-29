import { ChatThreadsSidebar } from "@/components/chat/chat-threads-sidebar"
import { ChatWindow } from "@/components/chat/chat-window"

export default function DashboardChatPage() {
  return (
    <section className="flex h-[calc(100vh-12rem)] flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold">AI Auditor Chat</h1>
        <p className="text-sm text-muted-foreground">
          Ask compliance questions and review AI-generated audit explanations.
        </p>
      </header>

      <div className="grid flex-1 min-h-0 gap-4 lg:grid-cols-[280px_1fr]">
        <ChatThreadsSidebar />
        <ChatWindow />
      </div>
    </section>
  )
}
