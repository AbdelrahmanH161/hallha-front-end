"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export type OnboardingStep = {
  key: string
  label: string
  description?: string
}

export function Stepper({
  steps,
  activeIndex,
  className,
}: {
  steps: readonly OnboardingStep[]
  activeIndex: number
  className?: string
}) {
  return (
    <ol className={cn("relative space-y-6", className)}>
      <div className="absolute inset-y-4 right-[11px] w-px bg-border" aria-hidden />
      {steps.map((step, index) => {
        const isComplete = index < activeIndex
        const isActive = index === activeIndex

        return (
          <li key={step.key} className="relative flex items-start gap-4">
            <div
              className={cn(
                "mt-1 grid size-6 shrink-0 place-items-center rounded-full ring-4 ring-background",
                isComplete && "bg-emerald-500 text-black",
                isActive && "bg-primary text-primary-foreground shadow-sm",
                !isComplete && !isActive && "bg-muted text-muted-foreground"
              )}
            >
              {isComplete ? <Check className="size-3.5" /> : <span className="size-2 rounded-full bg-current" />}
            </div>

            <div className="min-w-0">
              <div
                className={cn(
                  "text-sm",
                  isActive ? "font-medium text-primary" : "text-foreground",
                  !isComplete && !isActive && "text-muted-foreground"
                )}
              >
                {step.label}
              </div>
              {step.description ? (
                <div className={cn("mt-1 text-xs leading-relaxed", isActive ? "text-muted-foreground" : "text-muted-foreground")}>
                  {step.description}
                </div>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

