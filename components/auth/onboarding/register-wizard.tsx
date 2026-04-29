"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Building2,
  CreditCard,
  Globe,
  KeyRound,
  Landmark,
  Loader2,
  Lock,
  Mail,
  Search,
} from "lucide-react"
import { toast } from "sonner"

import { WizardShell, type WizardShellCopy } from "@/components/auth/onboarding/wizard-shell"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api/client"
import {
  useChoosePlanMutation,
  useLinkBankMutation,
  useUpdateCompanyProfileMutation,
} from "@/lib/api/queries/organization"
import { signUp } from "@/lib/auth/client"
import { dictionary, type Locale } from "@/lib/i18n"
import { signUpSchema, type SignUpInput } from "@/lib/schemas/auth"
import {
  bankLinkSchema,
  companyProfileSchema,
  planSchema,
  type BankLinkInput,
  type CompanyProfileInput,
  type PlanInput,
} from "@/lib/schemas/organization"
import { useRegisterDraft } from "@/lib/stores/register-draft"
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
type CommonCopy = (typeof dictionary)[Locale]["common"]

function clampStep(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.min(Math.max(Math.floor(value), 1), TOTAL_STEPS)
}

function resolveErrorKey(key: string | undefined, common: CommonCopy): string | undefined {
  if (!key) return undefined
  const errors = common.errors as Record<string, string>
  return errors[key] ?? key
}

function describeError(err: unknown, common: CommonCopy): string {
  if (err instanceof ApiError) return err.detail
  if (err instanceof Error) return err.message
  return common.errors.unknown
}

export function RegisterWizard({ locale, t }: { locale: Locale; t: RegisterWizardCopy }) {
  const router = useRouter()
  const params = useSearchParams()
  const stepParam = params.get("step")
  const activeStep = clampStep(stepParam ? Number(stepParam) : 1)
  const activeIndex = activeStep - 1
  const common = dictionary[locale].common

  const steps = React.useMemo(
    () => [
      { key: "account", label: t.steps.accountBasics },
      { key: "company", label: t.steps.companyProfile, description: t.step2.description },
      { key: "bank", label: t.steps.bankConnection, description: t.step3.description },
      { key: "plan", label: t.steps.planSelection },
    ],
    [t]
  )

  const goTo = React.useCallback(
    (step: number) => {
      const next = clampStep(step)
      const sp = new URLSearchParams(params)
      sp.set("step", String(next))
      router.push(`?${sp.toString()}`)
    },
    [params, router]
  )

  const finish = React.useCallback(() => {
    router.push(`/${locale}/dashboard`)
  }, [router, locale])

  return (
    <WizardShell copy={t.shell} steps={steps} activeIndex={activeIndex}>
      {activeStep === 1 ? (
        <AccountBasicsStep
          t={t.step1}
          common={common}
          nextLabel={t.buttons.continue}
          onSuccess={() => goTo(2)}
        />
      ) : null}
      {activeStep === 2 ? (
        <CompanyProfileStep
          t={t.step2}
          common={common}
          backLabel={t.buttons.back}
          nextLabel={t.buttons.continue}
          onBack={() => goTo(1)}
          onSuccess={() => goTo(3)}
        />
      ) : null}
      {activeStep === 3 ? (
        <BankConnectionStep
          t={t.step3}
          common={common}
          backLabel={t.buttons.back}
          nextLabel={t.buttons.next}
          onBack={() => goTo(2)}
          onSuccess={() => goTo(4)}
        />
      ) : null}
      {activeStep === 4 ? (
        <PlanSelectionStep
          t={t.step4}
          common={common}
          onBackToCompany={() => goTo(2)}
          onComplete={finish}
        />
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
  isSubmitting,
}: {
  backLabel: string
  nextLabel: string
  onBack: () => void
  isSubmitting: boolean
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
      <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting}>
        {backLabel}
      </Button>
      <Button type="submit" className="font-semibold" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {nextLabel}
      </Button>
    </div>
  )
}

function AccountBasicsStep({
  t,
  common,
  nextLabel,
  onSuccess,
}: {
  t: RegisterWizardCopy["step1"]
  common: CommonCopy
  nextLabel: string
  onSuccess: () => void
}) {
  const setEmail = useRegisterDraft((s) => s.setEmail)
  const draftEmail = useRegisterDraft((s) => s.email)

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: draftEmail ?? "", password: "", confirmPassword: "" },
    mode: "onTouched",
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: SignUpInput) {
    try {
      const localPart = values.email.split("@")[0] ?? "user"
      const result = await signUp.email({
        email: values.email,
        password: values.password,
        name: localPart,
      })
      if (result.error) {
        toast.error(common.toast.signupFailed, {
          description: result.error.message ?? undefined,
        })
        return
      }
      setEmail(values.email)
      toast.success(common.toast.signupSuccess)
      onSuccess()
    } catch (err) {
      toast.error(common.toast.signupFailed, { description: describeError(err, common) })
    }
  }

  return (
    <div>
      <Header title={t.title} description={t.description} />

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t.emailLabel}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>
                        <Mail className="size-4" aria-hidden />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      type="email"
                      placeholder={t.emailPlaceholder}
                      autoComplete="email"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage>{resolveErrorKey(fieldState.error?.message, common)}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t.passwordLabel}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>
                        <KeyRound className="size-4" aria-hidden />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      type="password"
                      placeholder={t.passwordPlaceholder}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage>{resolveErrorKey(fieldState.error?.message, common)}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t.confirmPasswordLabel}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>
                        <Lock className="size-4" aria-hidden />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      type="password"
                      placeholder={t.confirmPasswordPlaceholder}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage>{resolveErrorKey(fieldState.error?.message, common)}</FormMessage>
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-2 w-full font-semibold" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {nextLabel}
          </Button>
        </form>
      </Form>
    </div>
  )
}

function CompanyProfileStep({
  t,
  common,
  backLabel,
  nextLabel,
  onBack,
  onSuccess,
}: {
  t: RegisterWizardCopy["step2"]
  common: CommonCopy
  backLabel: string
  nextLabel: string
  onBack: () => void
  onSuccess: () => void
}) {
  const draft = useRegisterDraft((s) => s.company)
  const setCompany = useRegisterDraft((s) => s.setCompany)
  const mutation = useUpdateCompanyProfileMutation()

  const form = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: draft,
    mode: "onTouched",
  })

  async function onSubmit(values: CompanyProfileInput) {
    try {
      await mutation.mutateAsync(values)
      setCompany(values)
      toast.success(common.toast.saved)
      onSuccess()
    } catch (err) {
      toast.error(common.errors.unknown, { description: describeError(err, common) })
    }
  }

  const isSubmitting = mutation.isPending || form.formState.isSubmitting

  return (
    <div>
      <Header title={t.title} description={t.description} />

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="legalName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t.legalNameLabel}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>
                        <Building2 className="size-4" aria-hidden />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder={t.legalNamePlaceholder}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage>{resolveErrorKey(fieldState.error?.message, common)}</FormMessage>
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t.registrationNumberLabel}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>
                          <CreditCard className="size-4" aria-hidden />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder={t.registrationNumberPlaceholder}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage>{resolveErrorKey(fieldState.error?.message, common)}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t.incorporationCountryLabel}</FormLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t.incorporationCountryPlaceholder} />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage>{resolveErrorKey(fieldState.error?.message, common)}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="industry"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field>
                  <FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-2">
                        <Landmark className="size-4 text-muted-foreground" aria-hidden />
                        <span>{t.industryLabel}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                        {t.industries.map((industry) => {
                          const checked = field.value === industry.value
                          return (
                            <label key={industry.value} className="cursor-pointer">
                              <input
                                className="peer sr-only"
                                type="radio"
                                name={field.name}
                                value={industry.value}
                                checked={checked}
                                onChange={() => field.onChange(industry.value)}
                                disabled={isSubmitting}
                              />
                              <div className="rounded-lg border bg-background/40 px-3 py-3 text-center text-sm transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary">
                                {industry.label}
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </FieldContent>
                  </FieldLabel>
                </Field>
                <FormMessage>{resolveErrorKey(fieldState.error?.message, common)}</FormMessage>
              </FormItem>
            )}
          />

          <FooterNav
            backLabel={backLabel}
            nextLabel={nextLabel}
            onBack={onBack}
            isSubmitting={isSubmitting}
          />
        </form>
      </Form>
    </div>
  )
}

function BankConnectionStep({
  t,
  common,
  backLabel,
  nextLabel,
  onBack,
  onSuccess,
}: {
  t: RegisterWizardCopy["step3"]
  common: CommonCopy
  backLabel: string
  nextLabel: string
  onBack: () => void
  onSuccess: () => void
}) {
  const draft = useRegisterDraft((s) => s.bank)
  const setBank = useRegisterDraft((s) => s.setBank)
  const mutation = useLinkBankMutation()

  const [selected, setSelected] = React.useState<string | null>(draft.institutionId)
  const [search, setSearch] = React.useState("")

  const filtered = React.useMemo(
    () => t.institutions.filter((name) => name.toLowerCase().includes(search.toLowerCase())),
    [t.institutions, search]
  )

  async function submit(institutionId: string) {
    try {
      const payload: BankLinkInput = bankLinkSchema.parse({
        institutionId,
        sandbox: true,
      })
      await mutation.mutateAsync(payload)
      setBank({ institutionId })
      toast.success(common.toast.saved)
      onSuccess()
    } catch (err) {
      toast.error(common.errors.unknown, { description: describeError(err, common) })
    }
  }

  const isSubmitting = mutation.isPending

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
          <InputGroupInput
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <div>
          <div className="mb-3 text-xs font-medium tracking-wide text-muted-foreground">
            {t.popularInstitutionsLabel}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((name) => {
              const isActive = selected === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelected(name)}
                  disabled={isSubmitting}
                  className={cn(
                    "group rounded-lg border bg-background/40 p-4 text-center transition-colors hover:bg-muted/30 hover:border-primary/40",
                    isActive && "border-primary bg-primary/10"
                  )}
                >
                  <div className="mx-auto grid size-10 place-items-center rounded-full bg-card shadow-sm">
                    <Landmark className="size-5 text-muted-foreground group-hover:text-primary" aria-hidden />
                  </div>
                  <div className="mt-3 text-xs font-medium">{name}</div>
                </button>
              )
            })}
            <button
              type="button"
              className="group rounded-lg border bg-background/40 p-4 text-center transition-colors hover:bg-muted/30 hover:border-primary/40"
              disabled
            >
              <div className="mx-auto grid size-10 place-items-center rounded-full bg-card shadow-sm">
                <span className="text-xs text-muted-foreground">⋯</span>
              </div>
              <div className="mt-3 text-xs font-medium">{t.viewAll}</div>
            </button>
          </div>
        </div>

        <div className="border-t pt-6">
          <Button
            type="button"
            className="w-full font-semibold"
            disabled={!selected || isSubmitting}
            onClick={() => selected && submit(selected)}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {t.sandboxCta}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden />
            {t.plaidNote}
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
        <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting}>
          {backLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  )
}

function PlanSelectionStep({
  t,
  common,
  onBackToCompany,
  onComplete,
}: {
  t: RegisterWizardCopy["step4"]
  common: CommonCopy
  onBackToCompany: () => void
  onComplete: () => void
}) {
  const draft = useRegisterDraft((s) => s.planSelection)
  const setPlanSelection = useRegisterDraft((s) => s.setPlanSelection)
  const reset = useRegisterDraft((s) => s.reset)
  const mutation = useChoosePlanMutation()

  const [billing, setBilling] = React.useState<"monthly" | "yearly">(draft.billing)

  async function submit(plan: PlanInput["plan"]) {
    try {
      const payload: PlanInput = planSchema.parse({ plan, billing })
      await mutation.mutateAsync(payload)
      setPlanSelection({ plan, billing })
      toast.success(common.toast.saved)
      reset()
      onComplete()
    } catch (err) {
      toast.error(common.errors.unknown, { description: describeError(err, common) })
    }
  }

  const isSubmitting = mutation.isPending

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
        <PlanCard plan={t.plans.startup} onChoose={() => submit("startup")} disabled={isSubmitting} />
        <PlanCard plan={t.plans.growth} highlighted onChoose={() => submit("growth")} disabled={isSubmitting} />
        <PlanCard plan={t.plans.enterprise} onChoose={() => submit("enterprise")} disabled={isSubmitting} />
      </div>

      <div className="mt-10 text-center">
        <Button type="button" variant="ghost" onClick={onBackToCompany} disabled={isSubmitting}>
          {t.backToCompanyProfile}
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

      <Button
        className="mt-6 w-full"
        variant={highlighted ? "default" : "outline"}
        onClick={onChoose}
        disabled={disabled}
      >
        {plan.cta}
      </Button>
    </div>
  )
}
