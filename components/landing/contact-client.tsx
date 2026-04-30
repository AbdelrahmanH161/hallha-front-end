"use client"

import { useState } from "react"
import { Send, CheckCircle, Loader2, Mail, User, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LiquidGlassCard } from "@/components/landing/liquid-glass-card"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

interface ContactSectionClientProps {
  sectionLabel: string
  title: string
  titleAccent: string
  subtitle: string
  namePlaceholder: string
  emailPlaceholder: string
  messagePlaceholder: string
  submitLabel: string
  successMessage: string
  nameLabel: string
  emailLabel: string
  messageLabel: string
}

export function ContactSectionClient({
  sectionLabel,
  title,
  titleAccent,
  subtitle,
  namePlaceholder,
  emailPlaceholder,
  messagePlaceholder,
  submitLabel,
  successMessage,
  nameLabel,
  emailLabel,
  messageLabel,
}: ContactSectionClientProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState("loading")
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1500))
    setState("success")
  }

  return (
    <>
      <ScrollReveal className="mb-14 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest glass">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {sectionLabel}
        </div>
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          {title}{" "}
          <span className="gradient-text">{titleAccent}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">{subtitle}</p>
      </ScrollReveal>

      <ScrollReveal delay={120} className="mx-auto max-w-2xl">
        <LiquidGlassCard goldBorder className="p-8">
          {state === "success" ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-lg font-semibold">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {nameLabel}
                </label>
                <input
                  required
                  type="text"
                  placeholder={namePlaceholder}
                  className="w-full rounded-xl px-4 py-3 text-sm glass-input outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {emailLabel}
                </label>
                <input
                  required
                  type="email"
                  placeholder={emailPlaceholder}
                  className="w-full rounded-xl px-4 py-3 text-sm glass-input outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  {messageLabel}
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder={messagePlaceholder}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm glass-input outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={state === "loading"}
                className="w-full gap-2 bg-primary font-semibold shadow-lg shadow-primary/25"
              >
                {state === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitLabel}
              </Button>
            </form>
          )}
        </LiquidGlassCard>
      </ScrollReveal>
    </>
  )
}
