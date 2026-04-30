"use client"

import * as React from "react"
import { useLocale } from "next-intl"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
  const locale = useLocale()

  const nextLocale = locale === "ar" ? "en" : "ar"
  const label = nextLocale === "ar" ? "العربية" : "English"

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={pathname} locale={nextLocale}>
        {label}
      </Link>
    </Button>
  )
}
