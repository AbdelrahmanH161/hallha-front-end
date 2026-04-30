import { getTranslations } from "next-intl/server"

import { ChatThreadsSidebar } from "@/components/chat/chat-threads-sidebar"
import { ChatWindow } from "@/components/chat/chat-window"

export default async function DashboardChatPage() {
  const t = await getTranslations("app.chat")

  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold">{t("pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("pageDescription")}</p>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_1fr]">
        <ChatThreadsSidebar />
        <ChatWindow />
      </div>
    </section>
  )
}
