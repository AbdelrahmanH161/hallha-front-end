import Image from "next/image"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { LocaleSwitch } from "@/components/locale-switch"
import { ThemeToggle } from "@/components/landing/theme-toggle"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/landing/mobile-nav"

export async function SiteHeader() {
  const t = await getTranslations("landing.nav")

  const navLinks = [
    { href: "#home",     label: t("home") },
    { href: "#about",    label: t("about") },
    { href: "#features", label: t("features") },
    { href: "#pricing",  label: t("pricing") },
    { href: "#contact",  label: t("contact") },
    { href: "#faq",      label: t("faq") },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 glass-nav">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Image
                src="/logo.png"
                alt={t("brandAlt")}
                width={28}
                height={28}
                className="h-7 w-7 rounded-lg"
                priority
              />
            </div>
            <span className="text-xl font-black tracking-tight gradient-text-gold">
              {t("brand")}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-primary/8 hover:text-primary"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <LocaleSwitch className="hidden sm:inline-flex" />
          <ThemeToggle />

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href="/login">{t("login")}</Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex bg-primary shadow-sm shadow-primary/25 hover:bg-primary/90"
          >
            <Link href="/register">{t("register")}</Link>
          </Button>

          {/* Mobile hamburger */}
          <MobileNav
            links={navLinks}
            loginLabel={t("login")}
            loginHref="/login"
            registerLabel={t("register")}
          />
        </div>
      </div>
    </header>
  )
}
