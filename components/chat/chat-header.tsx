"use client"

import * as React from "react"
import { Moon, PanelLeft, PanelLeftClose, Settings, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { useSettingsDialog } from "@/lib/stores/settings-dialog"

function useIsClient() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export type ChatHeaderProps = {
  onOpenMobileSidebar: () => void
  desktopCollapsed: boolean
  onToggleDesktopCollapse: () => void
}

export function ChatHeader({
  onOpenMobileSidebar,
  desktopCollapsed,
  onToggleDesktopCollapse,
}: ChatHeaderProps) {
  const t = useTranslations("app.chat")
  const tHeader = useTranslations("app.chat.header")
  const openSettings = useSettingsDialog((s) => s.openAt)
  const { resolvedTheme, setTheme } = useTheme()
  const isClient = useIsClient()
  const isDark = resolvedTheme === "dark"

  return (
    <header className="glass-nav relative z-[5] flex flex-shrink-0 items-center justify-between gap-3 border-b px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={tHeader("openSidebar")}
          onClick={onOpenMobileSidebar}
          className="size-8 shrink-0 rounded-md border border-[var(--glass-border-card)] bg-[var(--glass-bg)] backdrop-blur lg:hidden"
        >
          <PanelLeft className="size-4 rtl:rotate-180" aria-hidden />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            desktopCollapsed
              ? tHeader("expandSidebar")
              : tHeader("collapseSidebar")
          }
          onClick={onToggleDesktopCollapse}
          className="hidden size-8 shrink-0 rounded-md border border-[var(--glass-border-card)] bg-[var(--glass-bg)] backdrop-blur lg:inline-flex"
        >
          {desktopCollapsed ? (
            <PanelLeft className="size-4 rtl:rotate-180" aria-hidden />
          ) : (
            <PanelLeftClose className="size-4" aria-hidden />
          )}
        </Button>

        <div className="flex min-w-0 items-center gap-2.5">
          <div className="min-w-0 leading-tight">
            <div className="font-heading text-sm font-bold">
              <span className="ms-1.5 font-arabic font-normal text-muted-foreground">
                {t("brandArabic")}
              </span>
            </div>
            <div className="flex min-w-0 items-start gap-1.5 text-[10px] font-medium text-emerald-500">
              <span className="animate-pulse-glow mt-0.5 inline-block size-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span className="min-w-0 leading-snug text-muted-foreground line-clamp-2">
                {t("tagline")}
                <span className="max-sm:hidden"> · </span>{" "}
                <span className="text-emerald-500">{t("statusOnline")}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={tHeader("settings")}
          onClick={() => openSettings("profile")}
          className="size-8 rounded-md border border-[var(--glass-border-card)] bg-[var(--glass-bg)] backdrop-blur"
        >
          <Settings className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={tHeader("toggleTheme")}
          disabled={!isClient}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="size-8 rounded-md border border-[var(--glass-border-card)] bg-[var(--glass-bg)] backdrop-blur"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <div className="ms-1 hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary sm:inline-flex">
          <span className="animate-pulse-glow inline-block size-1.5 rounded-full bg-primary" />
          {t("aaoiAligned")}
        </div>
      </div>
    </header>
  )
}
