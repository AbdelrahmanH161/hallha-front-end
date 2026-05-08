"use client"

import * as React from "react"
import { Briefcase, Scale } from "lucide-react"
import { toast } from "sonner"

import { OnboardingHeader } from "@/components/auth/onboarding/onboarding-shared"
import type { CommonCopy } from "@/components/auth/onboarding/onboarding-shared"
import { LiquidGlassCard } from "@/components/landing/liquid-glass-card"
import { useSetPersonaMutation } from "@/lib/api/queries/organization"
import { cn } from "@/lib/utils"
import { useRegisterDraft } from "@/lib/stores/register-draft"

type Props = {
  common: CommonCopy
  messages: Record<string, unknown>
  /** After server sets persona; parent advances URL step. */
  onPathSaved: (path: "business" | "auditor") => void
}

export function PersonaPathStep({ common, messages, onPathSaved }: Props) {
  const persona = (messages.auth as Record<string, unknown>).register as Record<
    string,
    unknown
  >
  const t = (persona.personaStep as Record<string, unknown>) ?? {}
  const setUserPath = useRegisterDraft((s) => s.setUserPath)
  const mutation = useSetPersonaMutation()
  const [pending, setPending] = React.useState<"business" | "auditor" | null>(null)

  async function select(path: "business" | "auditor") {
    if (mutation.isPending) return
    setPending(path)
    try {
      await mutation.mutateAsync({ userType: path })
      setUserPath(path)
      window.setTimeout(() => onPathSaved(path), 200)
    } catch (err) {
      toast.error(common.errors.unknown, {
        description: err instanceof Error ? err.message : undefined,
      })
      setPending(null)
    }
  }

  return (
    <div>
      <OnboardingHeader
        title={String(t.title ?? "")}
        description={String(t.description ?? "")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <button type="button" className="text-start" onClick={() => void select("business")} disabled={mutation.isPending}>
          <LiquidGlassCard
            goldBorder={pending === "business"}
            className={cn(
              "h-full p-6 transition-colors",
              pending === "business" ? "border-primary/50 bg-primary/[0.08]" : "hover:bg-muted/40"
            )}
          >
            <Briefcase className="mb-3 size-8 text-muted-foreground" aria-hidden />
            <div className="text-base font-semibold">{String(t.businessTitle ?? "")}</div>
            <p className="mt-2 text-sm text-muted-foreground">{String(t.businessSubtitle ?? "")}</p>
          </LiquidGlassCard>
        </button>
        <button type="button" className="text-start" onClick={() => void select("auditor")} disabled={mutation.isPending}>
          <LiquidGlassCard
            goldBorder={pending === "auditor"}
            className={cn(
              "h-full p-6 transition-colors",
              pending === "auditor" ? "border-primary/50 bg-primary/[0.08]" : "hover:bg-muted/40"
            )}
          >
            <Scale className="mb-3 size-8 text-muted-foreground" aria-hidden />
            <div className="text-base font-semibold">{String(t.auditorTitle ?? "")}</div>
            <p className="mt-2 text-sm text-muted-foreground">{String(t.auditorSubtitle ?? "")}</p>
          </LiquidGlassCard>
        </button>
      </div>
    </div>
  )
}
