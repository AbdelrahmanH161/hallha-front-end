"use client"

import * as React from "react"
import Link from "next/link"
import { useMessages } from "next-intl"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { AccountBasicsStep } from "@/components/auth/onboarding/account-basics-step"
import { AuditorQuestionsStep } from "@/components/auth/onboarding/auditor-questions-step"
import { BusinessQuestionsStep } from "@/components/auth/onboarding/business-questions-step"
import { PersonaPathStep } from "@/components/auth/onboarding/persona-path-step"
import { PlanSelectionStep } from "@/components/auth/onboarding/plan-selection-step"
import { WorkspaceProfileStep } from "@/components/auth/onboarding/workspace-profile-step"
import { WizardShell } from "@/components/auth/onboarding/wizard-shell"
import { Button } from "@/components/ui/button"
import type { CommonCopy } from "@/components/auth/onboarding/onboarding-shared"
import type { DraftUserPath } from "@/lib/stores/register-draft"
import {
  organizationKeys,
  useOrganizationQuery,
  useSkipOnboardingMutation,
} from "@/lib/api/queries/organization"
import { useQueryClient } from "@tanstack/react-query"
import { useRegisterDraft } from "@/lib/stores/register-draft"

/** Business wizard URL steps reach 6 for success splash; Auditor reaches 4. */
const BUSINESS_MAX_STEP = 6
const AUDITOR_MAX_STEP = 4

type StepItem = {
  key: string
  label: string
  description?: string
}

function clamp(value: number, max: number) {
  if (!Number.isFinite(value)) return 1
  return Math.min(Math.max(Math.floor(value), 1), max)
}

export function RegisterWizard() {
  const router = useRouter()
  const params = useSearchParams()
  const pathname = usePathname()
  const messages = useMessages()
  const common = messages.common as CommonCopy
  const qc = useQueryClient()
  const { data: org, isFetched } = useOrganizationQuery()
  const draftPath = useRegisterDraft((s) => s.userPath)
  const reset = useRegisterDraft((s) => s.reset)

  const branch: DraftUserPath = (org?.userType as DraftUserPath) ?? draftPath
  const isAuditorBranch = branch === "auditor"
  const maxStep = branch === null ? BUSINESS_MAX_STEP : isAuditorBranch ? AUDITOR_MAX_STEP : BUSINESS_MAX_STEP

  const stepFromUrl = clamp(Number(params.get("step") ?? 1), maxStep)
  const [successMode, setSuccessMode] = React.useState<"auditor" | "business" | null>(null)

  React.useEffect(() => {
    if (!pathname?.startsWith("/register")) return
    if (!isFetched) return
    if (successMode) return
    if (org?.onboardingCompleted) router.replace("/dashboard")
  }, [pathname, isFetched, org?.onboardingCompleted, router, successMode])

  const register = messages.auth.register as Record<string, unknown>
  const tButtons =
    typeof register.buttons === "object" && register.buttons ?
      (register.buttons as Record<string, string>)
    : {}

  const steps = React.useMemo((): StepItem[] => {
    const baseSteps = typeof register.steps === "object" && register.steps ? (register.steps as Record<string, string>) : {}
    if (branch === null) {
      return [
        { key: "account", label: baseSteps.accountBasics ?? "" },
        { key: "persona", label: baseSteps.personaPath ?? "" },
        { key: "personaQ", label: baseSteps.personaQuestions ?? "" },
      ]
    }
    if (isAuditorBranch) {
      return [
        { key: "account", label: baseSteps.accountBasics ?? "" },
        { key: "persona", label: baseSteps.personaPath ?? "" },
        { key: "auditorQ", label: baseSteps.auditorQuestions ?? "" },
      ]
    }
    return [
      { key: "account", label: baseSteps.accountBasics ?? "" },
      { key: "persona", label: baseSteps.personaPath ?? "" },
      { key: "businessQ", label: baseSteps.businessQuestions ?? "" },
      { key: "workspace", label: baseSteps.workspaceProfile ?? "" },
      { key: "plan", label: baseSteps.planSelection ?? "" },
    ]
  }, [branch, isAuditorBranch, register.steps])

  const activeIndex = Math.min(stepFromUrl - 1, steps.length - 1)

  const goTo = React.useCallback(
    (step: number) => {
      const next = clamp(step, maxStep)
      const sp = new URLSearchParams(params.toString())
      sp.set("step", String(next))
      router.push(`?${sp.toString()}`)
    },
    [maxStep, params, router]
  )

  React.useEffect(() => {
    if (stepFromUrl > maxStep) goTo(maxStep)
  }, [goTo, maxStep, stepFromUrl])

  /** Deep-link guard: persona questions without a saved path can't render */
  React.useEffect(() => {
    if (!isFetched) return
    if (stepFromUrl >= 3 && draftPath === null && !org?.userType && stepFromUrl < 900) goTo(2)
  }, [draftPath, goTo, isFetched, org?.userType, stepFromUrl])

  const finish = React.useCallback(() => {
    router.push("/dashboard")
  }, [router])

  React.useEffect(() => {
    if (!successMode) return undefined
    const timer = window.setTimeout(() => {
      qc.invalidateQueries({ queryKey: organizationKeys.me }).catch(() => {})
      finish()
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [finish, qc, successMode])

  const skipMutation = useSkipOnboardingMutation()
  const skipFromStep = React.useCallback(
    async (fromStep: number) => {
      try {
        await skipMutation.mutateAsync({ fromStep })
        reset()
        finish()
      } catch (err) {
        toast.error(common.errors.unknown, { description: err instanceof Error ? err.message : common.errors.unknown })
      }
    },
    [skipMutation, reset, finish, common.errors]
  )

  const wide = stepFromUrl === 5 && branch === "business"

  if (successMode) {
    const copy =
      successMode === "auditor" ? (register.auditorSuccess as Record<string, string>) : (register.businessSuccess as Record<string, string>)
    return (
      <WizardShell steps={steps} activeIndex={steps.length - 1} wide={false}>
        <div className="mx-auto max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-semibold">{String(copy?.title ?? "")}</h1>
          <p className="text-sm text-muted-foreground">{String(copy?.subtitle ?? "")}</p>
          <Button className="w-full font-semibold" onClick={finish}>
            {String(copy?.cta ?? "")}
          </Button>
          <p className="text-xs text-muted-foreground">
            <Link href="/dashboard" className="text-primary underline">
              {String(copy?.skipLink ?? "")}
            </Link>
          </p>
        </div>
      </WizardShell>
    )
  }

  const loadingGuard =
    stepFromUrl >= 3 && branch === null && isFetched && !draftPath && !org?.userType ? (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="size-10 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-center text-sm text-muted-foreground">{String((register.loadingBranch as string) ?? "")}</p>
      </div>
    ) : null

  return (
    <WizardShell steps={steps} activeIndex={activeIndex >= 0 ? activeIndex : 0} wide={wide}>
      {stepFromUrl === 1 ?
        <AccountBasicsStep
          common={common}
          messages={messages as unknown as Record<string, unknown>}
          nextLabel={tButtons.continue ?? "Continue"}
          onSuccess={() => goTo(2)}
        />
      : null}

      {stepFromUrl === 2 ?
        <PersonaPathStep
          common={common}
          messages={messages as unknown as Record<string, unknown>}
          onPathSaved={() => goTo(3)}
        />
      : null}

      {stepFromUrl === 3 && branch === "business" ?
        <BusinessQuestionsStep
          common={common}
          messages={messages as unknown as Record<string, unknown>}
          backLabel={tButtons.back ?? "Back"}
          continueLabel={tButtons.continue ?? "Continue"}
          onBack={() => goTo(2)}
          onSuccess={() => {
            qc.setQueryData(organizationKeys.me, (prev) =>
              prev && typeof prev === "object" ? { ...prev, userType: "business", onboardingStep: 3 } : prev
            )
            goTo(4)
          }}
        />
      : null}

      {stepFromUrl === 3 && branch === "auditor" ?
        <AuditorQuestionsStep
          common={common}
          messages={messages as unknown as Record<string, unknown>}
          backLabel={tButtons.back ?? "Back"}
          continueLabel={tButtons.continue ?? "Continue"}
          onBack={() => goTo(2)}
          onSuccess={() => {
            setSuccessMode("auditor")
          }}
        />
      : null}

      {stepFromUrl === 4 && branch === "business" ?
        <WorkspaceProfileStep
          t={messages.auth.register.step2 as React.ComponentProps<typeof WorkspaceProfileStep>["t"]}
          common={common}
          backLabel={tButtons.back ?? "Back"}
          nextLabel={tButtons.continue ?? "Continue"}
          skipLabel={tButtons.skip ?? "Skip"}
          onBack={() => goTo(3)}
          onSuccess={() => goTo(5)}
          onSkip={() => void skipFromStep(4)}
          isSkipping={skipMutation.isPending}
        />
      : null}

      {stepFromUrl === 5 && branch === "business" ?
        <PlanSelectionStep
          common={common}
          messages={messages as unknown as Record<string, unknown>}
          skipLabel={tButtons.finishLater ?? "Later"}
          onBackToProfile={() => goTo(4)}
          onCompleteChoice={() => setSuccessMode("business")}
          onSkip={() => void skipFromStep(5)}
          isSkipping={skipMutation.isPending}
        />
      : null}

      {loadingGuard}
    </WizardShell>
  )
}
