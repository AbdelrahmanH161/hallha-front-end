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
import { auditorOnboardingSchema, type AuditorOnboardingInput } from "@/lib/schemas/onboarding"
import { initialAuditorAnswers, useRegisterDraft } from "@/lib/stores/register-draft"
import { useSubmitAuditorOnboardingMutation } from "@/lib/api/queries/organization"

const SPEC = ["banking", "crypto", "insuranceTakaful", "capitalMarkets", "realEstate", "general"] as const
const STDS = ["aaoifi", "nationalLaws", "hanafi", "maliki", "shafii", "hanbali"] as const
const USE = ["consultantClientContracts", "internalCompliance", "training", "other"] as const

type Props = {
  common: CommonCopy
  messages: Record<string, unknown>
  onBack: () => void
  onSuccess: () => void
  backLabel: string
  continueLabel: string
}

export function AuditorQuestionsStep({
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
    rq.auditorQuestions && typeof rq.auditorQuestions === "object" ?
      (rq.auditorQuestions as Record<string, unknown>)
    : {}
  const overlay =
    rq.synthesisOverlay && typeof rq.synthesisOverlay === "object" ?
      (rq.synthesisOverlay as Record<string, string>)
    : { title: "", subtitle: "" }
  const options =
    typeof t.options === "object" && t.options ?
      (t.options as Record<string, Record<string, string>>)
    : {}

  const draft = useRegisterDraft((s) => s.auditorAnswers)
  const setAnswers = useRegisterDraft((s) => s.setAuditorAnswers)

  const labels =
    typeof t.labels === "object" && t.labels ? (t.labels as Record<string, string>) : {}

  function opt(cat: keyof typeof options | "labels", key: string): string {
    if (cat === "labels") return labels[key] ?? key
    const m = options[cat]
    return m?.[key] ?? key
  }

  const form = useForm<AuditorOnboardingInput>({
    resolver: zodResolver(auditorOnboardingSchema),
    defaultValues: { ...initialAuditorAnswers, ...draft },
    mode: "onTouched",
  })

  const standards = useWatch({
    control: form.control,
    name: "standards",
    defaultValue: initialAuditorAnswers.standards,
  })

  const mutation = useSubmitAuditorOnboardingMutation()

  async function submit(values: AuditorOnboardingInput) {
    try {
      await mutation.mutateAsync(values)
      setAnswers(values)
      onSuccess()
    } catch (err) {
      toast.error(common.errors.unknown, { description: describeError(err, common) })
    }
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
              <OnboardingHeader title={String(t.title ?? "")} description={String(t.subtitle ?? "")} />
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
              {String((t.blocks as Record<string, string>)?.specialization ?? "")}
            </p>
            <FormField
              control={form.control}
              name="specialization"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{opt("labels", "specialization")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SPEC.map((k) => (
                        <SelectItem key={k} value={k}>
                          {opt("specialization", k)}
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
              {String((t.blocks as Record<string, string>)?.standards ?? "")}
            </p>
            <FormField
              control={form.control}
              name="standards"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Field>
                    <FieldLabel>
                      <FieldContent>
                        <div className="mb-3 text-sm font-medium">{opt("labels", "standards")}</div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {STDS.map((std) => {
                            const sel = standards.includes(std)
                            return (
                              <label key={std} className="cursor-pointer">
                                <input
                                  className="peer sr-only"
                                  type="checkbox"
                                  checked={sel}
                                  onChange={() => {
                                    const next = sel ? standards.filter((x) => x !== std) : [...standards, std]
                                    field.onChange(next)
                                  }}
                                />
                                <span
                                  className={cn(
                                    "flex min-h-[3rem] items-center justify-center rounded-lg border px-2 text-center text-xs font-medium transition-colors peer-checked:border-primary peer-checked:bg-primary/10"
                                  )}
                                >
                                  {opt("standards", std)}
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

          <div className="space-y-4 rounded-xl border bg-muted/15 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {String((t.blocks as Record<string, string>)?.use ?? "")}
            </p>
            <FormField
              control={form.control}
              name="useCase"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{opt("labels", "useCase")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USE.map((k) => (
                        <SelectItem key={k} value={k}>
                          {opt("useCase", k)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
