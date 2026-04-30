"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

import { LiquidGlassCard } from "@/components/landing/liquid-glass-card"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

interface FaqItem {
  q: string
  a: string
}

interface FaqClientProps {
  sectionLabel: string
  title: string
  titleAccent: string
  items: FaqItem[]
}

export function FaqClient({ sectionLabel, title, titleAccent, items }: FaqClientProps) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <>
      <ScrollReveal className="mb-14 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest glass">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {sectionLabel}
        </div>
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          {title}{" "}
          <span className="gradient-text-gold">{titleAccent}</span>
        </h2>
      </ScrollReveal>

      <div className="space-y-3">
        {items.map((item, i) => (
          <ScrollReveal key={i} delay={i * 60}>
          <LiquidGlassCard
              className={`overflow-hidden transition-all duration-300 glass-card ${
                open === i ? "glass-strong" : ""
              }`}
            >
              {/* Question */}
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-start"
                aria-expanded={open === i}
              >
                <span className="font-semibold leading-snug">{item.q}</span>
                <span
                  className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                    open === i
                      ? "bg-accent/20 text-accent rotate-0"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {open === i ? (
                    <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  )}
                </span>
              </button>

              {/* Answer */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        ))}
      </div>
    </>
  )
}
