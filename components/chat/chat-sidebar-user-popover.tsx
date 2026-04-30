"use client"

import * as React from "react"
import {
  ChevronUp,
  LifeBuoy,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { signOut, useSession } from "@/lib/auth/client"
import { useSettingsDialog } from "@/lib/stores/settings-dialog"
import { cn } from "@/lib/utils"

function useIsClient() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

function userInitials(name?: string | null, email?: string | null) {
  const source = name || email || ""
  const first = source.trim().charAt(0).toUpperCase()
  return first || "U"
}

export function ChatSidebarUserPopover() {
  const t = useTranslations("app.userMenu")
  const [open, setOpen] = React.useState(false)
  const { data: session } = useSession()
  const openSettings = useSettingsDialog((s) => s.openAt)
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const isClient = useIsClient()
  const isDark = resolvedTheme === "dark"

  const user = session?.user
  const displayName = user?.name || user?.email || t("guest")
  const role = t("rolePro")

  function handle(action: () => void) {
    setOpen(false)
    setTimeout(action, 0)
  }

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg p-2 text-start transition-colors",
            "hover:bg-primary/[0.06]",
            open && "bg-primary/[0.08]"
          )}
        >
          <Avatar className="size-8 border border-border/60 bg-secondary text-secondary-foreground">
            <AvatarFallback className="bg-secondary text-xs font-semibold">
              {userInitials(user?.name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-xs font-semibold">{displayName}</div>
            <div className="truncate text-[10px] text-muted-foreground">{role}</div>
          </div>
          <ChevronUp
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              !open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="glass-card animate-pop-in w-[--radix-popover-trigger-width] min-w-64 border-[var(--glass-border-card)] bg-[var(--glass-bg-card)] p-1.5"
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--glass-border-card)] px-2.5 pb-2.5 pt-1.5">
          <Avatar className="size-9 border border-border/60 bg-secondary">
            <AvatarFallback className="bg-secondary text-sm font-semibold">
              {userInitials(user?.name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold">{displayName}</div>
            <div className="truncate text-[10px] text-muted-foreground">{role}</div>
          </div>
        </div>

        <PopoverItem
          icon={<User className="size-4" />}
          label={t("profile")}
          onClick={() => handle(() => openSettings("profile"))}
        />
        <PopoverItem
          icon={<Settings className="size-4" />}
          label={t("settings")}
          onClick={() => handle(() => openSettings("preferences"))}
        />
        <PopoverItem
          icon={<LifeBuoy className="size-4" />}
          label={t("helpFeedback")}
          onClick={() => setOpen(false)}
        />

        <div className="my-1 border-t border-[var(--glass-border-card)]" />

        <PopoverItem
          icon={isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          label={isDark ? t("themeLight") : t("themeDark")}
          onClick={() =>
            handle(() => {
              if (!isClient) return
              setTheme(isDark ? "light" : "dark")
            })
          }
        />

        <PopoverItem
          icon={<LogOut className="size-4" />}
          label={t("signOut")}
          onClick={() => void handleSignOut()}
          destructive
        />
      </PopoverContent>
    </Popover>
  )
}

function PopoverItem({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-start text-sm transition-colors",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "hover:bg-primary/[0.06]"
      )}
    >
      <span className={cn("text-muted-foreground", destructive && "text-destructive")}>
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
    </button>
  )
}
