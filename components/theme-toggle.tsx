"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { MonitorIcon, MoonIcon, SunIcon, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const OPTIONS: Array<{ value: "light" | "dark" | "system"; icon: LucideIcon }> = [
  { value: "light", icon: SunIcon },
  { value: "dark", icon: MoonIcon },
  { value: "system", icon: MonitorIcon },
]

/**
 * Compact theme switcher for the sidebar footer.
 *
 * Trigger button shows the current resolved theme (sun/moon/monitor) and opens a small
 * menu with Light/Dark/System radio options. Uses next-themes' `useTheme` so it integrates
 * with the existing ThemeProvider — no provider changes needed.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("app.theme")
  const { theme, setTheme, resolvedTheme } = useTheme()
  // `resolvedTheme` is undefined on the first render (next-themes hydrates client-side).
  // Default to the sun icon to match SSR output; switch on next render when value arrives.
  const current = (theme as "light" | "dark" | "system" | undefined) ?? "system"
  const TriggerIcon = resolvedTheme === "dark" ? MoonIcon : SunIcon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-8", className)}
          aria-label={t("toggle")}
        >
          <TriggerIcon className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        <DropdownMenuRadioGroup
          value={current}
          onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}
        >
          {OPTIONS.map(({ value, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value} className="gap-2">
              <Icon className="size-4 text-muted-foreground" aria-hidden />
              {t(value)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Standalone trio of buttons (Light/Dark/System) for use inside a preferences screen
 * or another dropdown menu. Renders as `DropdownMenuItem` rows; designed to be embedded
 * inside an existing DropdownMenu rather than rendered alone.
 */
export function ThemeMenuItems() {
  const t = useTranslations("app.theme")
  const { setTheme, theme } = useTheme()
  const current = (theme as "light" | "dark" | "system" | undefined) ?? "system"
  return (
    <>
      {OPTIONS.map(({ value, icon: Icon }) => (
        <DropdownMenuItem
          key={value}
          onSelect={() => setTheme(value)}
          className={cn("gap-2", current === value && "font-medium")}
        >
          <Icon className="size-4 text-muted-foreground" aria-hidden />
          {t(value)}
        </DropdownMenuItem>
      ))}
    </>
  )
}
