import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { LocaleSwitch } from "@/components/locale-switch"
import { ThemeToggle } from "@/components/landing/theme-toggle"
import { Button } from "@/components/ui/button"
import { DirectionProvider } from "@/components/ui/direction"

export default async function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  const locale = await getLocale()
  const direction = locale === "ar" ? "rtl" : "ltr"
  const t = await getTranslations("auth.shell")

  return (
    <DirectionProvider dir={direction} direction={direction}>
      <div dir={direction} className="relative min-h-svh">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <div className="pointer-events-auto">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" className="gap-1.5">
                <ArrowLeftIcon className="size-4 rtl:rotate-180" aria-hidden />
                {t("back")}
              </Link>
            </Button>
          </div>
          <div className="pointer-events-auto flex items-center gap-1.5">
            <LocaleSwitch variant="ghost" />
            <ThemeToggle />
          </div>
        </div>

        {children}
      </div>
    </DirectionProvider>
  )
}
