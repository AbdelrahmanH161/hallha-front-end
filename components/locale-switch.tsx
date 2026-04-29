"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { isLocale, type Locale } from "@/lib/i18n"

function swapLocale(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length === 0) {
    return `/${nextLocale}`
  }

  if (isLocale(parts[0])) {
    parts[0] = nextLocale
    return `/${parts.join("/")}`
  }

  // Fallback: if the path isn't prefixed, just prefix it.
  return `/${nextLocale}${pathname.startsWith("/") ? "" : "/"}${pathname}`
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
  const pathname = usePathname()

  const currentLocale = React.useMemo<Locale>(() => {
    const first = pathname.split("/").filter(Boolean)[0]
    return isLocale(first) ? first : "ar"
  }, [pathname])

  const nextLocale: Locale = currentLocale === "ar" ? "en" : "ar"
  const label = nextLocale === "ar" ? "العربية" : "English"

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={swapLocale(pathname, nextLocale)}>{label}</Link>
    </Button>
  )
}

