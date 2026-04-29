"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Building2,
  CreditCard,
  Globe,
  KeyRound,
  Landmark,
  Lock,
  Mail,
  Search,
} from "lucide-react"

import { WizardShell, type WizardShellCopy } from "@/components/auth/onboarding/wizard-shell"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type RegisterWizardCopy = {
  shell: WizardShellCopy
  steps: {
    accountBasics: string
    companyProfile: string
    bankConnection: string
    planSelection: string
  }
  buttons: {
    back: string
    continue: string
    next: string
  }
  step1: {
    title: string
    description: string
    emailLabel: string
    emailPlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    confirmPasswordLabel: string
    confirmPasswordPlaceholder: string
  }
  step2: {
    title: string
    description: string
    legalNameLabel: string
    legalNamePlaceholder: string
    registrationNumberLabel: string
    registrationNumberPlaceholder: string
    incorporationCountryLabel: string
    incorporationCountryPlaceholder: string
    countries: readonly { value: string; label: string }[]
    industryLabel: string
    industries: readonly { value: string; label: string }[]
  }
  step3: {
    title: string
    description: string
    searchPlaceholder: string
    popularInstitutionsLabel: string
    institutions: readonly string[]
    viewAll: string
    sandboxCta: string
    plaidNote: string
  }
  step4: {
    title: string
    description: string
    billingMonthly: string
    billingYearly: string
    yearlyDiscount: string
    plans: {
      startup: {
        title: string
        description: string
        price: string
        period: string
        features: readonly { text: string; included: boolean }[]
        cta: string
      }
      growth: {
        title: string
        description: string
        price: string
        period: string
        popularLabel: string
        features: readonly { text: string; included: boolean; accent?: boolean }[]
        cta: string
      }
      enterprise: {
        title: string
        description: string
        price: string
        period: string
        features: readonly { text: string; included: boolean }[]
        cta: string
      }
    }
    backToCompanyProfile: string
  }
}

const TOTAL_STEPS = 4

function clampStep(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.min(Math.max(Math.floor(value), 1), TOTAL_STEPS)
}

export function RegisterWizard({ t }: { t: RegisterWizardCopy }) {
  const router = useRouter()
  const params = useSearchParams()
  const stepParam = params.get("step")
  const activeStep = clampStep(stepParam ? Number(stepParam) : 1)
  const activeIndex = activeStep - 1

  const steps = React.useMemo(
    () => [
      { key: "account", label: t.steps.accountBasics },
      { key: "company", label: t.steps.companyProfile, description: t.step2.description },
      { key: "bank", label: t.steps.bankConnection, description: t.step3.description },
      { key: "plan", label: t.steps.planSelection },
    ],
    [t]
  )

  function goTo(step: number) {
    const next = clampStep(step)
    const sp = new URLSearchParams(params)
    sp.set("step", String(next))
    router.push(`?${sp.toString()}`)
  }

  return (
    <WizardShell copy={t.shell} steps={steps} activeIndex={activeIndex}>
      {activeStep === 1 ? (
        <AccountBasicsStep t={t.step1} onNext={() => goTo(2)} nextLabel={t.buttons.continue} />
      ) : null}
      {activeStep === 2 ? (
        <CompanyProfileStep
          t={t.step2}
          onBack={() => goTo(1)}
          onNext={() => goTo(3)}
          backLabel={t.buttons.back}
          nextLabel={t.buttons.continue}
        />
      ) : null}
      {activeStep === 3 ? (
        <BankConnectionStep t={t.step3} onBack={() => goTo(2)} onNext={() => goTo(4)} backLabel={t.buttons.back} nextLabel={t.buttons.next} />
      ) : null}
      {activeStep === 4 ? (
        <PlanSelectionStep t={t.step4} onBackToCompany={() => goTo(2)} />
      ) : null}
    </WizardShell>
  )
}

function Header({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function FooterNav({
  backLabel,
  nextLabel,
  onBack,
  onNext,
}: {
  backLabel: string
  nextLabel: string
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
      <Button type="button" variant="ghost" onClick={onBack}>
        {backLabel}
      </Button>
      <Button type="button" onClick={onNext} className="font-semibold">
        {nextLabel}
      </Button>
    </div>
  )
}

function AccountBasicsStep({
  t,
  onNext,
  nextLabel,
}: {
  t: RegisterWizardCopy["step1"]
  onNext: () => void
  nextLabel: string
}) {
  return (
    <div>
      <Header title={t.title} description={t.description} />

      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t.emailLabel}</Label>
          <InputGroup>
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                <Mail className="size-4" aria-hidden />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput id="email" name="email" type="email" placeholder={t.emailPlaceholder} required autoComplete="email" />
          </InputGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t.passwordLabel}</Label>
          <InputGroup>
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                <KeyRound className="size-4" aria-hidden />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput id="password" name="password" type="password" placeholder={t.passwordPlaceholder} required autoComplete="new-password" />
          </InputGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
          <InputGroup>
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                <Lock className="size-4" aria-hidden />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput id="confirmPassword" name="confirmPassword" type="password" placeholder={t.confirmPasswordPlaceholder} required autoComplete="new-password" />
          </InputGroup>
        </div>

        <Button type="button" className="mt-2 w-full font-semibold" onClick={onNext}>
          {nextLabel}
        </Button>
      </form>
    </div>
  )
}

function CompanyProfileStep({
  t,
  onBack,
  onNext,
  backLabel,
  nextLabel,
}: {
  t: RegisterWizardCopy["step2"]
  onBack: () => void
  onNext: () => void
  backLabel: string
  nextLabel: string
}) {
  return (
    <div>
      <Header title={t.title} description={t.description} />

      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="legalName">{t.legalNameLabel}</Label>
          <InputGroup>
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                <Building2 className="size-4" aria-hidden />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput id="legalName" name="legalName" placeholder={t.legalNamePlaceholder} />
          </InputGroup>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">{t.registrationNumberLabel}</Label>
            <InputGroup>
              <InputGroupAddon align="inline-end">
                <InputGroupText>
                  <CreditCard className="size-4" aria-hidden />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput id="registrationNumber" name="registrationNumber" placeholder={t.registrationNumberPlaceholder} />
            </InputGroup>
          </div>
          <div className="space-y-2">
            <Label>{t.incorporationCountryLabel}</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t.incorporationCountryPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {t.countries.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className="flex items-center gap-2">
                      <Globe className="size-4" aria-hidden />
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Field>
          <FieldLabel>
            <FieldContent>
              <div className="flex items-center gap-2">
                <Landmark className="size-4 text-muted-foreground" aria-hidden />
                <span>{t.industryLabel}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                {t.industries.map((industry) => (
                  <label key={industry.value} className="cursor-pointer">
                    <input className="peer sr-only" type="radio" name="industry" value={industry.value} />
                    <div className="rounded-lg border bg-background/40 px-3 py-3 text-center text-sm transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary">
                      {industry.label}
                    </div>
                  </label>
                ))}
              </div>
            </FieldContent>
          </FieldLabel>
        </Field>
      </form>

      <FooterNav backLabel={backLabel} nextLabel={nextLabel} onBack={onBack} onNext={onNext} />
    </div>
  )
}

function BankConnectionStep({
  t,
  onBack,
  onNext,
  backLabel,
  nextLabel,
}: {
  t: RegisterWizardCopy["step3"]
  onBack: () => void
  onNext: () => void
  backLabel: string
  nextLabel: string
}) {
  return (
    <div>
      <Header title={t.title} description={t.description} />

      <div className="space-y-6">
        <InputGroup className="h-10">
          <InputGroupAddon align="inline-end">
            <InputGroupText>
              <Search className="size-4" aria-hidden />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder={t.searchPlaceholder} />
        </InputGroup>

        <div>
          <div className="mb-3 text-xs font-medium tracking-wide text-muted-foreground">
            {t.popularInstitutionsLabel}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {t.institutions.map((name) => (
              <button
                key={name}
                type="button"
                className="group rounded-lg border bg-background/40 p-4 text-center transition-colors hover:bg-muted/30 hover:border-primary/40"
              >
                <div className="mx-auto grid size-10 place-items-center rounded-full bg-card shadow-sm">
                  <Landmark className="size-5 text-muted-foreground group-hover:text-primary" aria-hidden />
                </div>
                <div className="mt-3 text-xs font-medium">{name}</div>
              </button>
            ))}
            <button
              type="button"
              className="group rounded-lg border bg-background/40 p-4 text-center transition-colors hover:bg-muted/30 hover:border-primary/40"
            >
              <div className="mx-auto grid size-10 place-items-center rounded-full bg-card shadow-sm">
                <span className="text-xs text-muted-foreground">⋯</span>
              </div>
              <div className="mt-3 text-xs font-medium">{t.viewAll}</div>
            </button>
          </div>
        </div>

        <div className="border-t pt-6">
          <Button type="button" className="w-full font-semibold" onClick={onNext}>
            {t.sandboxCta}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden />
            {t.plaidNote}
          </p>
        </div>
      </div>

      <FooterNav backLabel={backLabel} nextLabel={nextLabel} onBack={onBack} onNext={onNext} />
    </div>
  )
}

function PlanSelectionStep({
  t,
  onBackToCompany,
}: {
  t: RegisterWizardCopy["step4"]
  onBackToCompany: () => void
}) {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("monthly")

  return (
    <div>
      <Header title={t.title} description={t.description} />

      <div className="mt-6 flex items-center justify-center">
        <div className="inline-flex rounded-lg border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={cn(
              "rounded-md px-4 py-2 text-sm transition-colors",
              billing === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.billingMonthly}
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={cn(
              "rounded-md px-4 py-2 text-sm transition-colors",
              billing === "yearly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.billingYearly} <span className="text-primary">{t.yearlyDiscount}</span>
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PlanCard plan={t.plans.startup} />
        <PlanCard plan={t.plans.growth} highlighted />
        <PlanCard plan={t.plans.enterprise} />
      </div>

      <div className="mt-10 text-center">
        <Button type="button" variant="ghost" onClick={onBackToCompany}>
          {t.backToCompanyProfile}
        </Button>
      </div>
    </div>
  )
}

function PlanCard({
  plan,
  highlighted = false,
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
}) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-background/40 p-6 backdrop-blur",
        highlighted && "border-primary/40 shadow-xl md:-translate-y-2"
      )}
    >
      {highlighted && plan.popularLabel ? (
        <div className="absolute left-4 top-4 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
          {plan.popularLabel}
        </div>
      ) : null}

      <div className={cn("mb-5", highlighted && plan.popularLabel ? "mt-6" : "")}>
        <div className={cn("text-lg font-semibold", highlighted ? "text-primary" : "text-foreground")}>
          {plan.title}
        </div>
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
            <span className={cn("mt-0.5 inline-flex size-5 items-center justify-center rounded-full", feature.included ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
              {feature.included ? "✓" : "–"}
            </span>
            <span className={cn(feature.accent && "text-accent")}>{feature.text}</span>
          </li>
        ))}
      </ul>

      <Button className="mt-6 w-full" variant={highlighted ? "default" : "outline"}>
        {plan.cta}
      </Button>
    </div>
  )
}

