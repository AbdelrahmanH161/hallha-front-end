"use client"

import Image from "next/image"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Stepper, type OnboardingStep } from "@/components/auth/onboarding/stepper"

export type WizardShellCopy = {
  brand: string
  title: string
  secureBadge: string
  stepCounterTemplate: string
}

export function WizardShell({
  copy,
  steps,
  activeIndex,
  children,
  className,
}: {
  copy: WizardShellCopy
  steps: readonly OnboardingStep[]
  activeIndex: number
  children: React.ReactNode
  className?: string
}) {
  const total = steps.length
  const current = Math.min(Math.max(activeIndex + 1, 1), total)
  const stepCounterLabel = copy.stepCounterTemplate
    .replace("{current}", String(current))
    .replace("{total}", String(total))

  return (
    <main
      className={cn(
        "min-h-svh bg-background text-foreground",
        "flex flex-col md:flex-row",
        className
      )}
    >
      <aside className="relative hidden w-[360px] shrink-0 border-r bg-muted/20 p-8 md:flex md:flex-col">
        <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden>
          <div className="absolute -left-10 -top-10 size-[300px] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 size-[260px] rounded-full bg-accent/15 blur-3xl" />
        </div>

        <div className="relative z-10 mb-10 flex items-center gap-3">
          <Image
            src="/auth/login-logo.png"
            alt={copy.brand}
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg bg-card p-1"
          />
          <div className="text-lg font-semibold">{copy.brand}</div>
        </div>

        <div className="relative z-10 flex-1">
          <h2 className="text-xl font-semibold">{copy.title}</h2>
          <div className="mt-6">
            <Stepper steps={steps} activeIndex={activeIndex} />
          </div>
        </div>

        <div className="relative z-10 mt-8">
          <Badge variant="secondary">{copy.secureBadge}</Badge>
        </div>
      </aside>

      <section className="relative flex-1 overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.05]">
          <Image src="/auth/login-pattern.png" alt="" fill className="object-cover" priority />
        </div>
        <div className="pointer-events-none absolute -left-24 -top-24 size-[420px] rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-[420px] rounded-full bg-accent/15 blur-3xl" />

        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-background/70 px-6 py-4 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <Image
              src="/auth/login-logo.png"
              alt={copy.brand}
              width={32}
              height={32}
              className="h-8 w-8 rounded"
            />
            <div className="text-sm font-semibold">{copy.brand}</div>
          </div>
          <div className="text-xs text-muted-foreground">{stepCounterLabel}</div>
        </div>

        <div className="relative mx-auto flex w-full max-w-2xl flex-col justify-center px-6 py-10 md:min-h-svh">
          <Card className="border bg-card/60 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            {children}
          </Card>
        </div>
      </section>
    </main>
  )
}

