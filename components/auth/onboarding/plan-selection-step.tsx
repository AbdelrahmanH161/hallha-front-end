"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { OnboardingHeader, describeError, type CommonCopy } from "@/components/auth/onboarding/onboarding-shared"
import { Button } from "@/components/ui/button"
import { planSchema, type PlanInput } from "@/lib/schemas/organization"
import { useChoosePlanMutation } from "@/lib/api/queries/organization"
import { useRegisterDraft } from "@/lib/stores/register-draft"
import { cn } from "@/lib/utils"

type Props = {
  common: CommonCopy
  messages: Record<string, unknown>
  skipLabel: string
  /** Back targets workspace profile — step number from parent router */
  onBackToProfile: () => void
  /** After plan POST success (before navigating away) */
  onCompleteChoice: () => void
  onSkip: () => void
  isSkipping: boolean
}

export function PlanSelectionStep({
  common,
  messages,
  skipLabel,
  onBackToProfile,
  onCompleteChoice,
  onSkip,
  isSkipping,
}: Props) {
  const tRaw = ((messages as Record<string, unknown>).auth as Record<string, unknown>).register as Record<
    string,
    unknown
  >
  const t =
    tRaw.step4 && typeof tRaw.step4 === "object" ? (tRaw.step4 as Record<string, unknown>) : {}
  const plans = typeof t.plans === "object" && t.plans !== null ? (t.plans as Record<string, unknown>) : {}

  const draft = useRegisterDraft((s) => s.planSelection)
  const setPlanSelection = useRegisterDraft((s) => s.setPlanSelection)
  const reset = useRegisterDraft((s) => s.reset)

  const mutation = useChoosePlanMutation()
  const [billing, setBilling] = React.useState<"monthly" | "yearly">(draft.billing)

  async function submit(plan: PlanInput["plan"]) {
    try {
      const payload: PlanInput = planSchema.parse({
        plan,
        billing: plan === "free" ? "monthly" : billing,
      })
      await mutation.mutateAsync(payload)
      setPlanSelection({ plan, billing })
      toast.success(common.toast.saved)
      reset()
      onCompleteChoice()
    } catch (err) {
      toast.error(common.errors.unknown, { description: describeError(err, common) })
    }
  }

  const isSubmitting = mutation.isPending

  return (
    <div>
      <OnboardingHeader title={String(t.title ?? "")} description={String(t.description ?? "")} />

      <div className="mt-6 flex flex-col items-center gap-2">
        <div className="inline-flex rounded-lg border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={cn(
              "rounded-md px-4 py-2 text-sm transition-colors",
              billing === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {String(t.billingMonthly ?? "")}
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={cn(
              "rounded-md px-4 py-2 text-sm transition-colors",
              billing === "yearly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {String(t.billingYearly ?? "")} <span className="text-primary">{String(t.yearlyDiscount ?? "")}</span>
          </button>
        </div>
        <p className="max-w-md px-2 text-center text-xs text-muted-foreground">{String(t.billingPaidPlansNote ?? "")}</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <PlanCard
          plan={plans.free as Parameters<typeof PlanCard>[0]["plan"]}
          onChoose={() => void submit("free")}
          disabled={isSubmitting || isSkipping}
        />
        <PlanCard plan={plans.starter as never} onChoose={() => void submit("starter")} disabled={isSubmitting || isSkipping} />
        <PlanCard
          plan={plans.business as never}
          highlighted
          onChoose={() => void submit("business")}
          disabled={isSubmitting || isSkipping}
        />
        <PlanCard plan={plans.enterprise as never} onChoose={() => void submit("enterprise")} disabled={isSubmitting || isSkipping} />
      </div>

      <div className="mt-10 flex items-center justify-center gap-2">
        <Button type="button" variant="ghost" onClick={onBackToProfile} disabled={isSubmitting || isSkipping}>
          {String(t.backToProfile ?? "")}
        </Button>
        <Button type="button" variant="ghost" onClick={onSkip} disabled={isSubmitting || isSkipping}>
          {isSkipping ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {skipLabel}
        </Button>
      </div>
    </div>
  )
}

function PlanCard({
  plan,
  highlighted = false,
  disabled = false,
  onChoose,
}: {
  plan: {
    title: string
    description: string
    price: string
    period: string
    popularLabel?: string
    features: readonly { text: string; included: boolean; accent?: boolean }[]
    cta: string
  }
  highlighted?: boolean
  disabled?: boolean
  onChoose: () => void
}) {
  return (
    <div
      className={cn(
        "relative flex h-full min-w-0 flex-col rounded-2xl border bg-background/40 p-6 backdrop-blur sm:p-7",
        highlighted && "border-primary/40 shadow-xl md:-translate-y-2"
      )}
    >
      {highlighted && plan.popularLabel ?
        <div className="absolute start-4 top-4 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
          {plan.popularLabel}
        </div>
      : null}

      <div className={cn("mb-5", highlighted && plan.popularLabel ? "mt-6" : "")}>
        <div className={cn("text-lg font-semibold", highlighted ? "text-primary" : "text-foreground")}>{plan.title}</div>
        <div className="mt-2 text-sm text-muted-foreground">{plan.description}</div>

        <div className="mt-5 flex items-baseline gap-2">
          <div className="text-4xl font-semibold tracking-tight">{plan.price}</div>
          {plan.period ? <div className="text-sm text-muted-foreground">{plan.period}</div> : null}
        </div>
      </div>

      <div className="my-4 h-px w-full bg-border" />

      <ul className="flex-1 space-y-3 text-sm">
        {plan.features.map((feature) => (
          <li
            key={feature.text}
            className={cn(
              "flex items-start gap-2",
              feature.included ? "text-muted-foreground" : "text-muted-foreground/60 line-through"
            )}
          >
            <span
              className={cn(
                "mt-0.5 inline-flex size-5 items-center justify-center rounded-full",
                feature.included ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              {feature.included ? "✓" : "–"}
            </span>
            <span className={cn(feature.accent && "text-accent")}>{feature.text}</span>
          </li>
        ))}
      </ul>

      <Button className="mt-6 w-full" variant={highlighted ? "default" : "outline"} onClick={onChoose} disabled={disabled}>
        {plan.cta}
      </Button>
    </div>
  )
}
