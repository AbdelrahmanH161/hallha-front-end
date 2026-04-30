"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ApiError } from "@/lib/api/client"
import {
  useChoosePlanMutation,
  useLinkBankMutation,
  useOrganizationQuery,
  useUpdateCompanyProfileMutation,
} from "@/lib/api/queries/organization"
import {
  bankLinkSchema,
  companyProfileSchema,
  planSchema,
  type BankLinkInput,
  type CompanyProfileInput,
  type PlanInput,
} from "@/lib/schemas/organization"
import { cn } from "@/lib/utils"

type LabelValue = { value: string; label: string }

function describeError(err: unknown): string | undefined {
  if (err instanceof ApiError) return err.detail
  if (err instanceof Error) return err.message
  return undefined
}

export function OrganizationTab() {
  const t = useTranslations("app.organization")
  const { data: org, isPending } = useOrganizationQuery()

  if (isPending && !org) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
      </div>
    )
  }

  return (
    <div className="space-y-6 py-2">
      <p className="text-sm text-muted-foreground">{t("intro")}</p>

      <CompanySection />
      <Separator />
      <BankSection />
      <Separator />
      <PlanSection />
    </div>
  )
}

function CompanySection() {
  const t = useTranslations("app.organization")
  const tStep = useTranslations("auth.register.step2")
  const tCommon = useTranslations("common")
  const { data: org } = useOrganizationQuery()
  const mutation = useUpdateCompanyProfileMutation()

  const countries = (tStep.raw("countries") as LabelValue[]) ?? []
  const industries = (tStep.raw("industries") as LabelValue[]) ?? []

  const form = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      legalName: org?.legalName ?? "",
      registrationNumber: org?.registrationNumber ?? "",
      country: org?.country ?? "",
      industry: org?.industry ?? "",
    },
    mode: "onTouched",
  })

  React.useEffect(() => {
    if (!org) return
    form.reset({
      legalName: org.legalName ?? "",
      registrationNumber: org.registrationNumber ?? "",
      country: org.country ?? "",
      industry: org.industry ?? "",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.legalName, org?.registrationNumber, org?.country, org?.industry])

  function resolveError(message?: string) {
    if (!message) return undefined
    if (message === "required") return tCommon("errors.required")
    return message
  }

  async function onSubmit(values: CompanyProfileInput) {
    try {
      await mutation.mutateAsync(values)
      toast.success(t("savedToast"))
    } catch (err) {
      toast.error(t("saveFailed"), { description: describeError(err) })
    }
  }

  const isSubmitting = mutation.isPending || form.formState.isSubmitting

  return (
    <section className="space-y-3">
      <SectionHeading
        title={t("sections.company")}
        description={t("sections.companyDescription")}
      />

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="legalName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("fields.legalName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("fields.legalNamePlaceholder")}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage>{resolveError(fieldState.error?.message)}</FormMessage>
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("fields.registrationNumber")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.registrationNumberPlaceholder")}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{resolveError(fieldState.error?.message)}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("fields.country")}</FormLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("fields.countryPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage>{resolveError(fieldState.error?.message)}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="industry"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("fields.industry")}</FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("fields.industryPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {industries.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage>{resolveError(fieldState.error?.message)}</FormMessage>
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {t("saveCompany")}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

function BankSection() {
  const { data: org } = useOrganizationQuery()
  return (
    <BankSectionInner
      key={org?.bankInstitutionId ?? ""}
      initialInstitutionId={org?.bankInstitutionId ?? ""}
    />
  )
}

function BankSectionInner({
  initialInstitutionId,
}: {
  initialInstitutionId: string
}) {
  const t = useTranslations("app.organization")
  const tStep = useTranslations("auth.register.step3")
  const mutation = useLinkBankMutation()

  const institutions: string[] = (tStep.raw("institutions") as string[]) ?? []
  const options: LabelValue[] = institutions.map((label) => ({
    value: label.toLowerCase().replace(/\s+/g, "-"),
    label,
  }))

  const [institutionId, setInstitutionId] = React.useState<string>(
    initialInstitutionId
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!institutionId) return
    try {
      const payload: BankLinkInput = bankLinkSchema.parse({
        institutionId,
        sandbox: true,
      })
      await mutation.mutateAsync(payload)
      toast.success(t("savedToast"))
    } catch (err) {
      toast.error(t("saveFailed"), { description: describeError(err) })
    }
  }

  const isSubmitting = mutation.isPending

  return (
    <section className="space-y-3">
      <SectionHeading
        title={t("sections.bank")}
        description={t("sections.bankDescription")}
      />

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("fields.institution")}</Label>
          <Select
            value={institutionId || undefined}
            onValueChange={setInstitutionId}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("fields.institutionPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {options.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !institutionId}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {t("saveBank")}
          </Button>
        </div>
      </form>
    </section>
  )
}

function PlanSection() {
  const t = useTranslations("app.organization")
  const { data: org } = useOrganizationQuery()
  const mutation = useChoosePlanMutation()

  const form = useForm<PlanInput>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      plan: (org?.plan as PlanInput["plan"]) ?? "starter",
      billing: org?.billingCycle ?? "monthly",
    },
    mode: "onTouched",
  })

  React.useEffect(() => {
    if (!org) return
    form.reset({
      plan: (org.plan as PlanInput["plan"]) ?? "starter",
      billing: org.billingCycle ?? "monthly",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.plan, org?.billingCycle])

  async function onSubmit(values: PlanInput) {
    try {
      await mutation.mutateAsync(values)
      toast.success(t("savedToast"))
    } catch (err) {
      toast.error(t("saveFailed"), { description: describeError(err) })
    }
  }

  const isSubmitting = mutation.isPending || form.formState.isSubmitting
  const billing = form.watch("billing")
  const plan = form.watch("plan")

  const plans: { id: PlanInput["plan"]; title: string; description: string }[] = [
    {
      id: "starter",
      title: t("plans.starter"),
      description: t("plans.starterDescription"),
    },
    {
      id: "business",
      title: t("plans.business"),
      description: t("plans.businessDescription"),
    },
    {
      id: "enterprise",
      title: t("plans.enterprise"),
      description: t("plans.enterpriseDescription"),
    },
  ]

  return (
    <section className="space-y-3">
      <SectionHeading
        title={t("sections.plan")}
        description={t("sections.planDescription")}
      />

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div>
            <div className="text-xs font-medium text-muted-foreground">
              {t("fields.billing")}
            </div>
            <div className="mt-1.5 inline-flex rounded-lg border bg-muted p-0.5">
              {(["monthly", "yearly"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => form.setValue("billing", opt)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                    billing === opt
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt === "monthly"
                    ? t("fields.billingMonthly")
                    : t("fields.billingYearly")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground">
              {t("fields.plan")}
            </div>
            <div className="mt-1.5 grid gap-3 md:grid-cols-3">
              {plans.map((p) => {
                const checked = plan === p.id
                return (
                  <label
                    key={p.id}
                    className={cn(
                      "cursor-pointer rounded-xl border bg-background/40 p-3 text-start transition-all",
                      checked
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "hover:border-primary/40"
                    )}
                  >
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="plan"
                      value={p.id}
                      checked={checked}
                      onChange={() => form.setValue("plan", p.id)}
                      disabled={isSubmitting}
                    />
                    <div className="text-sm font-semibold">{p.title}</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {t("savePlan")}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

function SectionHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
