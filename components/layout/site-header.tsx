import Image from "next/image"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { LocaleSwitch } from "@/components/locale-switch"
import { ThemeToggle } from "@/components/landing/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export async function SiteHeader() {
  const t = await getTranslations("landing.nav")

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt={t("brandAlt")}
              width={32}
              height={32}
              className="h-8 w-8 rounded"
              priority
            />
            <span className="text-xl font-black tracking-tight text-accent">
              {t("brand")}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#home"
              className="border-b-2 border-primary pb-1 text-sm font-medium text-primary"
            >
              {t("home")}
            </a>
            <a
              href="#features"
              className="rounded px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t("features")}
            </a>
            <a
              href="#pricing"
              className="rounded px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t("pricing")}
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {t("kyc")}
          </Badge>

          <LocaleSwitch className="hidden sm:inline-flex" />

          <ThemeToggle />

          <Button asChild size="sm">
            <Link href="/login">{t("login")}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
