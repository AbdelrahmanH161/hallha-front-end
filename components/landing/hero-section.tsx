import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ArrowRight, Play, TrendingUp, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IslamicPattern } from "@/components/landing/islamic-pattern"
import { LiquidGlassCard } from "@/components/landing/liquid-glass-card"

export async function HeroSection() {
  const t = await getTranslations("landing")

  return (
    <section
      id="home"
      className="relative min-h-svh overflow-hidden pt-5 pb-0 flex items-center"
    >
      {/* Mesh gradient background */}
      <div className="mesh-bg pointer-events-none absolute inset-0" />

      {/* Islamic geometric pattern */}
      <IslamicPattern opacity={0.055} />

      {/* Floating blobs */}
      <div
        className="blob pointer-events-none absolute -top-24 -left-24 h-[500px] w-[500px] animate-pulse-glow"
        style={{ background: "radial-gradient(circle, rgba(6,78,59,0.22) 0%, transparent 70%)" }}
      />
      <div
        className="blob pointer-events-none absolute -bottom-16 -right-16 h-[420px] w-[420px] animate-float-slow"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)" }}
      />
      <div
        className="blob pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px]"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        {/* Left: Text */}
        <div className="space-y-8 text-center lg:text-start">
          {/* Pill badge */}
          <div className="mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium glass lg:mx-0">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            <span className="text-primary dark:text-accent">{t("hero.pill")}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-black tracking-tight text-balance sm:text-5xl lg:text-6xl leading-[1.1]">
            {t("hero.title")}{" "}
            <span className="gradient-text-gold">{t("hero.titleAccent")}</span>
          </h1>

          {/* Description */}
          <p className="mx-auto max-w-xl text-base leading-relaxed text-pretty text-muted-foreground lg:mx-0 lg:text-lg">
            {t("hero.description")}
          </p>

          {/* Trusted badges */}
          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            <Badge variant="secondary" className="gap-1.5 text-xs font-medium py-1 px-3">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              {t("nav.kyc")}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 text-xs font-medium py-1 px-3">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              {t("hero.pill")}
            </Badge>
          </div>

          {/* CTAs */}
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
            <Button
              asChild
              size="lg"
              className="group gap-2 bg-primary font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <Link href="/register">
                {t("hero.primaryCta")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group gap-2 glass border-0 font-medium"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-accent">
                <Play className="h-3.5 w-3.5 fill-accent" />
              </span>
              {t("hero.secondaryCta")}
            </Button>
          </div>
        </div>

        {/* Right: Dashboard widget */}
        <div className="relative flex items-center justify-center">
          {/* Spinning Islamic ring */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="animate-spin-slow">
              <svg width="420" height="420" viewBox="0 0 420 420" className="opacity-10 dark:opacity-[0.07]">
                <g fill="none" stroke="currentColor" className="text-accent">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <line
                      key={i}
                      x1="210" y1="30"
                      x2="210" y2="390"
                      strokeWidth="0.75"
                      transform={`rotate(${i * 15} 210 210)`}
                    />
                  ))}
                  <circle cx="210" cy="210" r="178" strokeWidth="0.75" />
                  <circle cx="210" cy="210" r="140" strokeWidth="0.75" />
                  <circle cx="210" cy="210" r="100" strokeWidth="0.75" />
                </g>
              </svg>
            </div>
          </div>

          {/* Main compliance card — float wrapper keeps animate-float on
              a parent so the tilt JS can freely mutate the child's transform */}
          <div className="relative z-10 w-full max-w-sm animate-float">
            <LiquidGlassCard
              tilt
              goldBorder
              className="p-6"
            >
              {/* Card header */}
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("metrics.title")}</p>
                  <p className="text-xs text-muted-foreground/70">{t("metrics.subtitle")}</p>
                </div>
                <div className="text-3xl font-black text-primary">{t("metrics.score")}</div>
              </div>

              {/* Circular indicator */}
              <div className="mx-auto mb-5 flex h-44 w-44 flex-col items-center justify-center rounded-full glass-strong relative">
                {/* Ring glow */}
                <div className="pointer-events-none absolute inset-2 rounded-full border-2 border-accent/30 animate-pulse-glow" />
                <div className="text-4xl font-black gradient-text">{t("metrics.status")}</div>
                <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-emerald-500">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {t("metrics.trend")}
                </div>
              </div>

              {/* Status items */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-xl p-3 glass">
                  <span className="text-sm font-medium">{t("metrics.item1Title")}</span>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {t("metrics.item1Status")}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl p-3 glass">
                  <span className="text-sm font-medium">{t("metrics.item2Title")}</span>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {t("metrics.item2Status")}
                  </span>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Floating mini badges with tilt */}
          <div className="absolute -top-4 -left-4 hidden md:block animate-float" style={{ animationDelay: "1s" }}>
            <LiquidGlassCard tilt className="flex items-center gap-2 px-3 py-2">
              <span className="text-lg">🕌</span>
              <span className="text-xs font-semibold text-primary">Sharia-First</span>
            </LiquidGlassCard>
          </div>

          <div className="absolute -bottom-4 -right-4 hidden md:block animate-float" style={{ animationDelay: "2s" }}>
            <LiquidGlassCard tilt className="flex items-center gap-2 px-3 py-2">
              <span className="text-lg">✓</span>
              <span className="text-xs font-semibold text-accent">Certified</span>
            </LiquidGlassCard>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
