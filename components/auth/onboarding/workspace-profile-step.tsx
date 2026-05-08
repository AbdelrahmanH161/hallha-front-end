"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import {
  FooterNav,
  OnboardingHeader,
  describeError,
  resolveErrorKey,
  type CommonCopy,
} from "@/components/auth/onboarding/onboarding-shared"
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
import { workspaceProfileSchema, type WorkspaceProfileInput } from "@/lib/schemas/organization"
import { inferCountryCodeFromLocale } from "@/lib/infer-country"
import { useRegisterDraft } from "@/lib/stores/register-draft"
import { useUpdateCompanyProfileMutation } from "@/lib/api/queries/organization"
import { Building2, CreditCard, Globe, Landmark, User } from "lucide-react"

type Step2 = {
  title: string
  description: string
  workspaceKindQuestion: string
  workspaceIndividualTitle: string
  workspaceBusinessTitle: string
  legalNameLabelIndividual: string
  legalNamePlaceholderIndividual: string
  legalNameLabelBusiness: string
  legalNamePlaceholderBusiness: string
  registrationNumberLabel: string
  registrationNumberPlaceholder: string
  countryLabelIndividual: string
  countryLabelBusiness: string
  incorporationCountryPlaceholder: string
  countries: readonly { value: string; label: string }[]
  industryLabel: string
  industries: readonly { value: string; label: string }[]
}

type Props = {
  t: Step2
  common: CommonCopy
  backLabel: string
  nextLabel: string
  skipLabel: string
  onBack: () => void
  onSuccess: () => void
  onSkip: () => void
  isSkipping: boolean
}

export function WorkspaceProfileStep({
  t,
  common,
  backLabel,
  nextLabel,
  skipLabel,
  onBack,
  onSuccess,
  onSkip,
  isSkipping,
}: Props) {
  const draft = useRegisterDraft((s) => s.company)
  const setCompany = useRegisterDraft((s) => s.setCompany)
  const mutation = useUpdateCompanyProfileMutation()

  const form = useForm<WorkspaceProfileInput>({
    resolver: zodResolver(workspaceProfileSchema),
    defaultValues: draft,
    mode: "onTouched",
  })

  const hinted = React.useRef(false)
  React.useEffect(() => {
    if (hinted.current) return
    const hint = inferCountryCodeFromLocale()
    const has = draft.country.trim().length > 0
    if (!has && hint) {
      form.setValue("country", hint)
      hinted.current = true
    }
  }, [draft.country, form])

  const workspaceKind =
    useWatch({ control: form.control, name: "workspaceKind" }) ?? draft.workspaceKind

  React.useEffect(() => {
    if (workspaceKind === "individual") {
      form.setValue("registrationNumber", "")
      form.clearErrors("registrationNumber")
    }
  }, [workspaceKind, form])

  async function onSubmit(values: WorkspaceProfileInput) {
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
      <OnboardingHeader title={t.title} description={t.description} />
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="workspaceKind"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field>
                  <FieldLabel>
                    <FieldContent>
                      <div className="mb-2 text-sm font-medium">{t.workspaceKindQuestion}</div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(
                          [
                            { value: "individual" as const, title: t.workspaceIndividualTitle, Icon: User },
                            { value: "business" as const, title: t.workspaceBusinessTitle, Icon: Building2 },
                          ] as const
                        ).map(({ value, title, Icon: IconCmp }) => {
                          const checked = field.value === value
                          return (
                            <label key={value} className="cursor-pointer">
                              <input
                                className="peer sr-only"
                                type="radio"
                                name={field.name}
                                value={value}
                                checked={checked}
                                onChange={() => field.onChange(value)}
                                disabled={isSubmitting}
                              />
                              <div className="flex h-full flex-col gap-2 rounded-lg border bg-background/40 p-4 text-start text-sm transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary">
                                <IconCmp className="size-5 text-muted-foreground peer-checked:text-primary" aria-hidden />
                                <span className="font-medium">{title}</span>
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

          <FormField
            control={form.control}
            name="legalName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  {workspaceKind === "individual" ? t.legalNameLabelIndividual : t.legalNameLabelBusiness}
                </FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>
                        {workspaceKind === "individual" ? (
                          <User className="size-4" aria-hidden />
                        ) : (
                          <Building2 className="size-4" aria-hidden />
                        )}
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder={
                        workspaceKind === "individual" ?
                          t.legalNamePlaceholderIndividual
                        : t.legalNamePlaceholderBusiness
                      }
                      disabled={isSubmitting}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage>{resolveErrorKey(fieldState.error?.message, common)}</FormMessage>
              </FormItem>
            )}
          />

          {workspaceKind === "business" ?
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
                        <InputGroupInput placeholder={t.registrationNumberPlaceholder} disabled={isSubmitting} {...field} />
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
                    <FormLabel>{t.countryLabelBusiness}</FormLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange} disabled={isSubmitting}>
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
          : <FormField
              control={form.control}
              name="country"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t.countryLabelIndividual}</FormLabel>
                  <Select value={field.value || undefined} onValueChange={field.onChange} disabled={isSubmitting}>
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
          }

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
            skipLabel={skipLabel}
            onBack={onBack}
            onSkip={onSkip}
            isSubmitting={isSubmitting}
            isSkipping={isSkipping}
          />
        </form>
      </Form>
    </div>
  )
}
