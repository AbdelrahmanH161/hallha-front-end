"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { KeyRound, Lock, Loader2, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { describeError, OnboardingHeader, resolveErrorKey } from "@/components/auth/onboarding/onboarding-shared"
import type { CommonCopy } from "@/components/auth/onboarding/onboarding-shared"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { createSignUpSchema, type SignUpInput } from "@/lib/schemas/auth"
import { useRegisterDraft } from "@/lib/stores/register-draft"
import { signUp } from "@/lib/auth/client"

type Props = {
  common: CommonCopy
  nextLabel: string
  messages: Record<string, unknown>
  onSuccess: () => void
}

export function AccountBasicsStep({ common, nextLabel, messages, onSuccess }: Props) {
  const auth = (messages as Record<string, unknown>).auth as Record<string, unknown>
  const reg = auth.register as Record<string, unknown>
  const step1 = (reg.step1 ?? {}) as Record<string, unknown>
  const setEmail = useRegisterDraft((s) => s.setEmail)
  const draftEmail = useRegisterDraft((s) => s.email)
  const tErrors = useTranslations("common.errors")
  const signUpSchema = React.useMemo(() => createSignUpSchema(tErrors), [tErrors])

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
      <OnboardingHeader
        title={String(step1.title ?? "")}
        description={String(step1.description ?? "")}
      />
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{String(step1.emailLabel ?? "")}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>
                        <Mail className="size-4" aria-hidden />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      type="email"
                      placeholder={String(step1.emailPlaceholder ?? "")}
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
                <FormLabel>{String(step1.passwordLabel ?? "")}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>
                        <KeyRound className="size-4" aria-hidden />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      type="password"
                      placeholder={String(step1.passwordPlaceholder ?? "")}
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
                <FormLabel>{String(step1.confirmPasswordLabel ?? "")}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>
                        <Lock className="size-4" aria-hidden />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      type="password"
                      placeholder={String(step1.confirmPasswordPlaceholder ?? "")}
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
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {String(step1.signInPrompt ?? "")}{" "}
            <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/login">
              {String(step1.signInLink ?? "")}
            </Link>
          </p>
        </form>
      </Form>
    </div>
  )
}
