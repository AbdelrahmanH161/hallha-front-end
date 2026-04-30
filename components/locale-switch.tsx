"use client"

import * as React from "react"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

const LOCALE_COOKIE = "locale"

function setLocaleCookie(locale: string) {
  if (typeof document === "undefined") return
  const oneYear = 60 * 60 * 24 * 365
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${oneYear}; samesite=lax`
}

export function LocaleSwitch({
  className,
  variant = "outline",
  size = "sm",
}: {
  className?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
}) {
  const locale = useLocale()
  const router = useRouter()

  const nextLocale = locale === "ar" ? "en" : "ar"
  const label = nextLocale === "ar" ? "العربية" : "English"

  function handleClick() {
    if (nextLocale === locale) return
    setLocaleCookie(nextLocale)
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      {label}
    </Button>
  )
}
