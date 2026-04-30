"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Stepper, type OnboardingStep } from "@/components/auth/onboarding/stepper"
import { IslamicPattern } from "@/components/landing/islamic-pattern"
import { LiquidGlassCard } from "@/components/landing/liquid-glass-card"

export function WizardShell({
  steps,
  activeIndex,
  children,
  className,
}: {
  steps: readonly OnboardingStep[]
  activeIndex: number
  children: React.ReactNode
  className?: string
}) {
  const t = useTranslations("auth.register.shell")

  const total = steps.length
  const current = Math.min(Math.max(activeIndex + 1, 1), total)
  const stepCounterLabel = t("stepCounterTemplate", { current, total })

  return (
    <main
      className={cn(
        "h-svh max-h-svh overflow-hidden bg-background text-foreground",
        "flex flex-col md:flex-row",
        className
      )}
    >
      <aside className="relative hidden min-h-0 min-w-0 w-[360px] shrink-0 overflow-hidden border-r glass p-8 md:flex md:flex-col">
        <IslamicPattern opacity={0.05} />

        {/* Floating blobs */}
        <div
          className="blob pointer-events-none absolute -left-20 -top-20 h-[420px] w-[420px] animate-pulse-glow"
          style={{
            background:
              "radial-gradient(circle, rgba(6,78,59,0.22) 0%, transparent 70%)",
          }}
          aria-hidden
        />
        <div
          className="blob pointer-events-none absolute -bottom-20 -right-20 h-[360px] w-[360px] animate-float-slow"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <div className="relative z-10 mb-10 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt={t("brand")}
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg glass p-1"
          />
          <div className="text-lg font-semibold gradient-text-gold">{t("brand")}</div>
        </div>

        <div className="relative z-10 flex-1">
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <div className="mt-6">
            <Stepper steps={steps} activeIndex={activeIndex} />
          </div>
        </div>

        <div className="relative z-10 mt-8">
          <LiquidGlassCard className="inline-flex">
            <Badge variant="secondary">{t("secureBadge")}</Badge>
          </LiquidGlassCard>
        </div>
      </aside>

      <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Floating blobs */}
        <div
          className="blob pointer-events-none absolute -top-24 -left-24 h-[500px] w-[500px] animate-pulse-glow"
          style={{
            background:
              "radial-gradient(circle, rgba(6,78,59,0.22) 0%, transparent 70%)",
          }}
          aria-hidden
        />
        <div
          className="blob pointer-events-none absolute -bottom-16 -right-16 h-[420px] w-[420px] animate-float-slow"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <div className="sticky top-0 z-20 flex min-w-0 shrink-0 items-center justify-between gap-3 border-b bg-background/70 px-6 py-4 backdrop-blur md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <Image
              src="/logo.png"
              alt={t("brand")}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded"
            />
            <div className="min-w-0 truncate text-sm font-semibold">{t("brand")}</div>
          </div>
          <div className="shrink-0 text-xs text-muted-foreground">{stepCounterLabel}</div>
        </div>

        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="relative mx-auto flex min-h-0 w-full min-w-0 max-w-2xl flex-1 flex-col justify-center px-6 py-10">
            <LiquidGlassCard goldBorder className="max-h-full min-h-0 overflow-x-hidden overflow-y-auto p-6 shadow-2xl md:p-8">
              {children}
            </LiquidGlassCard>
          </div>
        </div>
      </section>
    </main>
  )
}
