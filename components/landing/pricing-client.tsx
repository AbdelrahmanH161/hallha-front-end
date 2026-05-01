"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LiquidGlassCard } from "@/components/landing/liquid-glass-card"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

interface PricingTierData {
  title: string
  price: string
  yearlyPrice?: string
  period: string
  features: string[]
  cta: string
  highlightLabel?: string
  variant: "outline" | "primary"
}

interface PricingSectionClientProps {
  tiers: PricingTierData[]
  sectionLabel: string
  title: string
  yearlyToggle: string
  monthlyToggle: string
  savingsLabel: string
}

export function PricingSectionClient({
  tiers,
  sectionLabel,
  title,
  yearlyToggle,
  monthlyToggle,
  savingsLabel,
}: PricingSectionClientProps) {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <>
      {/* Header */}
      <ScrollReveal className="mb-5 text-center">
        <div className="glass mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {sectionLabel}
        </div>
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      </ScrollReveal>

      {/* Toggle */}
      <ScrollReveal
        delay={100}
        className="mb-12 flex items-center justify-center gap-3"
      >
        <span
          className={`text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
        >
          {monthlyToggle}
        </span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className={`relative h-7 w-12 rounded-full transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
            isYearly ? "bg-primary" : "bg-muted"
          }`}
          aria-label="Toggle billing period"
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${
              isYearly ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
        >
          {yearlyToggle}
          {isYearly && (
            <span className="ms-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {savingsLabel}
            </span>
          )}
        </span>
      </ScrollReveal>

      {/* Tier cards */}
      <div className="mx-auto grid max-w-6xl items-start gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 xl:gap-8">
        {tiers.map((tier, i) => (
          <ScrollReveal
            key={tier.title}
            delay={i * 120}
            className={tier.variant === "primary" ? "md:-translate-y-4" : ""}
          >
            <LiquidGlassCard
              tilt
              goldBorder={tier.variant === "primary"}
              className={`relative flex flex-col gap-0 overflow-hidden ${
                tier.variant === "primary"
                  ? "bg-primary/5 shadow-2xl shadow-primary/15 dark:bg-primary/10"
                  : ""
              }`}
            >
              {/* Popular label */}
              {tier.highlightLabel && (
                <div className="flex items-center gap-1.5 border-b border-accent/20 bg-accent/10 px-5 py-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-bold tracking-widest text-accent uppercase">
                    {tier.highlightLabel}
                  </span>
                </div>
              )}

              <div className="p-6 pb-0">
                <h3
                  className={`mb-1 text-lg font-bold ${
                    tier.variant === "primary"
                      ? "text-primary dark:text-accent"
                      : ""
                  }`}
                >
                  {tier.title}
                </h3>
                <div className="mt-3 flex items-end gap-1.5">
                  <span className="text-4xl font-black tracking-tight">
                    {isYearly && tier.yearlyPrice
                      ? tier.yearlyPrice
                      : tier.price}
                  </span>
                  {tier.period && (
                    <span className="mb-1 text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  )}
                </div>
              </div>

              <ul className="flex-1 space-y-2.5 p-6">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    <span className="text-foreground/85">{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="p-6 pt-0">
                <Button
                  asChild
                  className="w-full"
                  variant={tier.variant === "primary" ? "default" : "outline"}
                  size="lg"
                >
                  <Link href="/register">{tier.cta}</Link>
                </Button>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        ))}
      </div>
    </>
  )
}
