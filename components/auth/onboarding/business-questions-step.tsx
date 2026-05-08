"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { initialBusinessAnswers, useRegisterDraft } from "@/lib/stores/register-draft"
import {
  businessOnboardingSchema,
  type BusinessOnboardingInput,
} from "@/lib/schemas/onboarding"
import { useSubmitBusinessOnboardingMutation } from "@/lib/api/queries/organization"

const INDUSTRIES = [
  "fintech",
  "realEstate",
  "ecommerce",
  "investment",
  "lending",
  "insurance",
  "other",
] as const

const AUD = ["b2b", "b2c", "b2b2c"] as const
const REV = [
  "subscription",
  "commission",
  "markup",
  "transactionFee",
  "interestSpread",
  "other",
] as const
const PAY = [
  "installments",
  "digitalGateways",
  "cash",
  "wireTransfer",
  "crypto",
] as const

type Props = {
  common: CommonCopy
  messages: Record<string, unknown>
  onBack: () => void
  onSuccess: () => void
  backLabel: string
  continueLabel: string
}

export function BusinessQuestionsStep({
  common,
  messages,
  onBack,
  onSuccess,
  backLabel,
  continueLabel,
}: Props) {
  const rq = ((messages as Record<string, unknown>).auth as Record<string, unknown>).register as Record<
    string,
    unknown
  >
  const t =
    rq.businessQuestions && typeof rq.businessQuestions === "object" ?
      (rq.businessQuestions as Record<string, unknown>)
    : {}
  const overlay =
    rq.synthesisOverlay && typeof rq.synthesisOverlay === "object" ?
      (rq.synthesisOverlay as Record<string, string>)
    : { title: "", subtitle: "" }
  const options =
    typeof t.options === "object" && t.options ?
      (t.options as Record<string, Record<string, string>>)
    : {}

  const draft = useRegisterDraft((s) => s.businessAnswers)
  const setAnswers = useRegisterDraft((s) => s.setBusinessAnswers)

  const form = useForm<BusinessOnboardingInput>({
    resolver: zodResolver(businessOnboardingSchema),
    defaultValues: { ...initialBusinessAnswers, ...draft },
    mode: "onTouched",
  })

  const mutation = useSubmitBusinessOnboardingMutation()

  const paymentMethods =
    useWatch({
      control: form.control,
      name: "paymentMethods",
      defaultValue: initialBusinessAnswers.paymentMethods,
    }) ?? initialBusinessAnswers.paymentMethods

  async function submit(values: BusinessOnboardingInput) {
    try {
      await mutation.mutateAsync(values)
      setAnswers(values)
      onSuccess()
    } catch (err) {
      toast.error(common.errors.unknown, { description: describeError(err, common) })
    }
  }

  const labels =
    typeof t.labels === "object" && t.labels ? (t.labels as Record<string, string>) : {}

  function opt(cat: keyof typeof options | "labels", key: string): string {
    if (cat === "labels") return labels[key] ?? key
    const m = options[cat]
    return m?.[key] ?? key
  }

  return (
    <div className="relative">
      {mutation.isPending ?
        <div className="fixed inset-x-4 top-[20vh] z-50 mx-auto flex max-w-md flex-col items-center rounded-xl border border-border bg-background/90 p-6 shadow-lg backdrop-blur-md">
          <Loader2 className="mb-2 size-8 animate-spin text-primary" aria-hidden />
          <p className="text-center text-sm font-semibold">{overlay.title ?? ""}</p>
          <p className="mt-1 max-w-xs text-center text-xs text-muted-foreground">{overlay.subtitle ?? ""}</p>
        </div>
      : null}

      <div className="mb-6 text-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <OnboardingHeader
                title={String(t.title ?? "")}
                description={String(t.subtitle ?? "")}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-sm">
            <p className="text-xs">{String(t.hint ?? "")}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(submit)}>
          <div className="space-y-4 rounded-xl border bg-muted/15 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {String((t.blocks as Record<string, string>)?.money ?? "")}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="industry"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{opt("labels", "industry")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDUSTRIES.map((k) => (
                          <SelectItem key={k} value={k}>
                            {opt("industry", k)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage>{resolveErrorKey(fieldState.error?.message, common)}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{opt("labels", "targetAudience")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AUD.map((k) => (
                          <SelectItem key={k} value={k}>
                            {opt("targetAudience", k)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage>{resolveErrorKey(fieldState.error?.message, common)}</FormMessage>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border bg-muted/15 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {String((t.blocks as Record<string, string>)?.revenue ?? "")}
            </p>
            <FormField
              control={form.control}
              name="revenueModel"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{opt("labels", "revenueModel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REV.map((k) => (
                        <SelectItem key={k} value={k}>
                          {opt("revenueModel", k)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage>{resolveErrorKey(fieldState.error?.message, common)}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 rounded-xl border bg-muted/15 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {String((t.blocks as Record<string, string>)?.payments ?? "")}
            </p>
            <FormField
              control={form.control}
              name="paymentMethods"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Field>
                    <FieldLabel>
                      <FieldContent>
                        <div className="mb-3 text-sm font-medium">{opt("labels", "paymentMethods")}</div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {PAY.map((method) => {
                            const sel = paymentMethods.includes(method)
                            return (
                              <label key={method} className="cursor-pointer">
                                <input
                                  className="peer sr-only"
                                  type="checkbox"
                                  checked={sel}
                                  onChange={() => {
                                    const next = sel ?
                                      paymentMethods.filter((x) => x !== method)
                                    : [...paymentMethods, method]
                                    field.onChange(next)
                                  }}
                                />
                                <span
                                  className={cn(
                                    "flex min-h-[3rem] items-center justify-center rounded-lg border px-3 text-center text-xs font-medium transition-colors peer-checked:border-primary peer-checked:bg-primary/10"
                                  )}
                                >
                                  {opt("paymentMethods", method)}
                                </span>
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
          </div>

          <FooterNav
            backLabel={backLabel}
            nextLabel={continueLabel}
            onBack={onBack}
            isSubmitting={mutation.isPending || form.formState.isSubmitting}
          />
        </form>
      </Form>
    </div>
  )
}
