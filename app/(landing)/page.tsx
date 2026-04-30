import Image from "next/image"
import { getTranslations } from "next-intl/server"

import { ThemeToggle } from "@/components/landing/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { cn } from "@/lib/utils"

type PageProps = {
  params: Promise<{ locale: string }>
}

type PricingTier = {
  title: string
  price: string
  features: string[]
  cta: string
  highlightLabel?: string
}

export default async function LandingPage({ params }: PageProps) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "landing" })
  const direction = locale === "ar" ? "rtl" : "ltr"
  const nextLocale = locale === "ar" ? "en" : "ar"

  const tiersRaw = t.raw("pricing.tiers") as Record<string, PricingTier>

  return (
    <div dir={direction} className="min-h-svh bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt={t("nav.brandAlt")}
                width={32}
                height={32}
                className="h-8 w-8 rounded"
                priority
              />
              <span className="text-xl font-black tracking-tight text-accent">
                {t("nav.brand")}
              </span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <a
                href="#home"
                className="border-b-2 border-primary pb-1 text-sm font-medium text-primary"
              >
                {t("nav.home")}
              </a>
              <a
                href="#features"
                className="rounded px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t("nav.auditor")}
              </a>
              <a
                href="#pricing"
                className="rounded px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t("nav.compliance")}
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {t("nav.kyc")}
            </Badge>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link href="/" locale={nextLocale}>
                {t("nav.switchLocaleLabel")}
              </Link>
            </Button>

            <ThemeToggle />

            <Button asChild size="sm">
              <Link href="/login">{t("nav.login")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="home" className="relative overflow-hidden pt-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.35) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pt-12 pb-16 lg:grid-cols-2 lg:pt-20 lg:pb-20">
          <div className="space-y-8 text-center lg:text-start">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs text-primary backdrop-blur lg:mx-0">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="font-medium">{t("hero.pill")}</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {t("hero.title")}{" "}
              <span className="text-accent">{t("hero.titleAccent")}</span>
            </h1>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-pretty text-muted-foreground lg:mx-0">
              {t("hero.description")}
            </p>

            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
              <Button size="lg" className="font-semibold">
                {t("hero.primaryCta")}
              </Button>
              <Button size="lg" variant="outline" className="font-medium">
                {t("hero.secondaryCta")}
              </Button>
            </div>
          </div>

          <div className="relative">
            <Card
              className={cn(
                "relative rounded-2xl border bg-card/50 shadow-2xl backdrop-blur",
                "ring-1 ring-foreground/10"
              )}
            >
              <CardHeader className="border-b">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      {t("metrics.title")}
                    </CardTitle>
                    <CardDescription>{t("metrics.subtitle")}</CardDescription>
                  </div>
                  <div className="text-start text-3xl font-semibold text-primary">
                    {t("metrics.score")}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="mx-auto flex size-48 flex-col items-center justify-center rounded-full border bg-muted/30">
                  <div className="text-3xl font-semibold">
                    {t("metrics.status")}
                  </div>
                  <div className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {t("metrics.trend")}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg border bg-background/50 p-3">
                    <span className="text-sm">{t("metrics.item1Title")}</span>
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90 dark:bg-emerald-500 dark:text-black">
                      {t("metrics.item1Status")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg border bg-background/50 p-3">
                    <span className="text-sm">{t("metrics.item2Title")}</span>
                    <Badge
                      variant="secondary"
                      className="text-amber-700 dark:text-amber-300"
                    >
                      {t("metrics.item2Status")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="pointer-events-none absolute -top-4 -left-4 hidden size-12 place-items-center rounded-xl border bg-card/50 text-accent shadow-xl backdrop-blur md:grid">
              <span aria-hidden className="text-xl font-semibold">
                ₿
              </span>
            </div>
            <div className="pointer-events-none absolute -right-4 -bottom-4 hidden size-12 place-items-center rounded-xl border bg-card/50 text-primary shadow-xl backdrop-blur md:grid">
              <span aria-hidden className="text-xl font-semibold">
                ✓
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <section id="features" className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("features.title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {t("features.description")}
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              title={t("features.items.auditor.title")}
              description={t("features.items.auditor.description")}
            />
            <FeatureCard
              title={t("features.items.purification.title")}
              description={t("features.items.purification.description")}
              highlighted
            />
            <FeatureCard
              title={t("features.items.contracts.title")}
              description={t("features.items.contracts.description")}
            />
            <FeatureCard
              title={t("features.items.zakat.title")}
              description={t("features.items.zakat.description")}
            />
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-6 pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("pricing.title")}
            </h2>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3 md:gap-8">
            <PricingCard
              title={tiersRaw.startup!.title}
              price={tiersRaw.startup!.price}
              period={t("pricing.period")}
              features={tiersRaw.startup!.features}
              cta={tiersRaw.startup!.cta}
              variant="outline"
            />
            <PricingCard
              title={tiersRaw.growth!.title}
              price={tiersRaw.growth!.price}
              period={t("pricing.period")}
              features={tiersRaw.growth!.features}
              cta={tiersRaw.growth!.cta}
              highlightLabel={tiersRaw.growth!.highlightLabel}
              variant="primary"
            />
            <PricingCard
              title={tiersRaw.enterprise!.title}
              price={tiersRaw.enterprise!.price}
              period=""
              features={tiersRaw.enterprise!.features}
              cta={tiersRaw.enterprise!.cta}
              variant="outline"
            />
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          {t("footer")}
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  highlighted = false,
}: {
  title: string
  description: string
  highlighted?: boolean
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border bg-card/50 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-1",
        highlighted && "border-accent/60"
      )}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function PricingCard({
  title,
  price,
  period,
  features,
  cta,
  highlightLabel,
  variant,
}: {
  title: string
  price: string
  period: string
  features: readonly string[]
  cta: string
  highlightLabel?: string
  variant: "outline" | "primary"
}) {
  return (
    <Card
      className={cn(
        "relative rounded-2xl border bg-card/50 backdrop-blur",
        variant === "primary" && "border-accent/60 shadow-2xl md:-translate-y-4"
      )}
    >
      {highlightLabel ? (
        <div className="absolute top-0 left-0 rounded-tl-xl rounded-br-lg bg-accent px-3 py-1 text-[10px] font-bold text-accent-foreground uppercase">
          {highlightLabel}
        </div>
      ) : null}

      <CardHeader className={cn(variant === "primary" && "pt-10")}>
        <CardTitle className={cn(variant === "primary" && "text-accent")}>
          {title}
        </CardTitle>
        <div className="mt-2 flex items-end gap-2">
          <div className="text-4xl font-semibold tracking-tight">{price}</div>
          {period ? (
            <div className="pb-1 text-sm text-muted-foreground">{period}</div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {features.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                ✓
              </span>
              <span className="text-foreground/90">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={variant === "primary" ? "default" : "outline"}
        >
          {cta}
        </Button>
      </CardFooter>
    </Card>
  )
}
