"use client"

import * as React from "react"
import { Languages, Monitor, Moon, Sun } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const LOCALE_COOKIE = "locale"

function setLocaleCookie(locale: string) {
  if (typeof document === "undefined") return
  const oneYear = 60 * 60 * 24 * 365
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${oneYear}; samesite=lax`
}

function useIsClient() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function PreferencesTab() {
  const t = useTranslations("app.preferences")
  const locale = useLocale()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isClient = useIsClient()

  const themeOptions = [
    { value: "light", label: t("themeLight"), Icon: Sun },
    { value: "dark", label: t("themeDark"), Icon: Moon },
    { value: "system", label: t("themeSystem"), Icon: Monitor },
  ] as const

  const localeOptions = [
    { value: "en", label: t("languageEnglish") },
    { value: "ar", label: t("languageArabic") },
  ] as const

  function handleLocaleChange(next: string) {
    if (next === locale) return
    setLocaleCookie(next)
    router.refresh()
  }

  return (
    <div className="space-y-8 py-2">
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">{t("appearance")}</h3>
          <p className="text-xs text-muted-foreground">{t("appearanceDescription")}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{t("theme")}</Label>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(({ value, label, Icon }) => {
              const checked = isClient && theme === value
              return (
                <button
                  key={value}
                  type="button"
                  disabled={!isClient}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border bg-background/40 p-3 text-xs transition-all",
                    checked
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "hover:border-primary/40"
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">{t("language")}</h3>
          <p className="text-xs text-muted-foreground">{t("languageDescription")}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {localeOptions.map((opt) => {
            const checked = locale === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleLocaleChange(opt.value)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border bg-background/40 px-3 py-2 text-sm transition-all",
                  checked
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "hover:border-primary/40"
                )}
              >
                <Languages className="size-4" aria-hidden />
                {opt.label}
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">{t("languageHint")}</p>
      </section>
    </div>
  )
}
