"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { ChatHeader } from "@/components/chat/chat-header"
import { ChatSidebar, ChatSidebarPanel } from "@/components/chat/chat-sidebar"
import { ChatWindow } from "@/components/chat/chat-window"
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner"
import { IslamicPattern } from "@/components/landing/islamic-pattern"
import { useDirection } from "@/components/ui/direction"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function ChatShell() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = React.useState(false)
  const dir = useDirection()
  const sheetSide = dir === "rtl" ? "right" : "left"
  const tHeader = useTranslations("app.chat.header")

  return (
    <div className="relative flex h-svh w-full overflow-hidden bg-background">
      {/* Background mesh + Islamic pattern + floating blobs */}
      <div className="mesh-bg pointer-events-none absolute inset-0" />
      <IslamicPattern opacity={0.028} className="z-0 text-primary" />
      <div className="animate-pulse-glow blob pointer-events-none absolute -top-20 -left-20 size-[400px] bg-[radial-gradient(circle,rgba(6,78,59,0.14)_0%,transparent_70%)]" />
      <div className="blob pointer-events-none absolute -right-16 -bottom-16 size-[360px] bg-[radial-gradient(circle,rgba(212,175,55,0.10)_0%,transparent_70%)]" />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side={sheetSide}
          className={cn(
            "glass-strong h-full w-[min(100vw,268px)] max-w-[268px] gap-0 border-0 border-[var(--glass-border)] p-0"
          )}
        >
          <SheetTitle className="sr-only">{tHeader("openSidebar")}</SheetTitle>
          <ChatSidebarPanel onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <ChatSidebar collapsed={desktopCollapsed} />

      <main className="relative z-[1] flex min-w-0 flex-1 flex-col overflow-hidden">
        <ChatHeader
          onOpenMobileSidebar={() => setMobileOpen(true)}
          desktopCollapsed={desktopCollapsed}
          onToggleDesktopCollapse={() =>
            setDesktopCollapsed((collapsed) => !collapsed)
          }
        />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="px-4 pt-2 sm:px-6 sm:pt-4">
            <OnboardingBanner />
          </div>
          <ChatWindow />
        </div>
      </main>
    </div>
  )
}
