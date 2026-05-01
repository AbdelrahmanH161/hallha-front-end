"use client"

import * as React from "react"
import Image from "next/image"
import { useMessages, useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2, Lock, Mail } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import Link from "next/link"
import { IslamicPattern } from "@/components/landing/islamic-pattern"
import { LiquidGlassCard } from "@/components/landing/liquid-glass-card"
import { signIn } from "@/lib/auth/client"
import { ApiError } from "@/lib/api/client"
import { loginSchema, type LoginInput } from "@/lib/schemas/auth"

type CommonCopy = {
  errors: Record<string, string>
  toast: Record<string, string>
}

function resolveErrorKey(
  key: string | undefined,
  common: CommonCopy
): string | undefined {
  if (!key) return undefined
  return common.errors[key] ?? key
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const messages = useMessages()
  const commonResolved = messages.common as CommonCopy
  const t = useTranslations("auth.login")

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: LoginInput) {
    try {
      const result = await signIn.email({
        email: values.email,
        password: values.password,
      })
      if (result.error) {
        toast.error(commonResolved.toast.loginFailed, {
          description: result.error.message ?? undefined,
        })
        return
      }
      toast.success(commonResolved.toast.loginSuccess)
      const from = searchParams.get("from")
      router.push(from && from.startsWith("/") ? from : "/dashboard")
      router.refresh()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : commonResolved.errors.unknown
      toast.error(commonResolved.toast.loginFailed, { description: message })
    }
  }

  return (
    <main className="relative flex h-svh max-h-svh flex-col overflow-hidden bg-background text-foreground">
      <IslamicPattern opacity={0.05} />

      {/* Floating blobs */}
      <div
        className="blob pointer-events-none absolute -top-24 -left-24 h-[500px] w-[500px] animate-pulse-glow"
        style={{
          background:
            "radial-gradient(circle, rgba(6,78,59,0.22) 0%, transparent 70%)",
        }}
      />
      <div
        className="blob pointer-events-none absolute -bottom-16 -right-16 h-[420px] w-[420px] animate-float-slow"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
        <div className="w-full max-w-[420px]">
          <LiquidGlassCard goldBorder className="p-0 pt-4">
            <CardHeader className="items-center text-center">
              <div className="mb-2 grid size-16 place-items-center mx-auto">
                <Image
                  src="/logo.png"
                  alt="Hallilha"
                  width={64}
                  height={64}
                  priority
                  className="max-h-16 w-auto object-contain"
                />
              </div>

              <CardTitle className="text-xl">
                <span className="gradient-text-gold">{t("title")}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </CardHeader>

            <CardContent className="py-4">
              <Form {...form}>
                <form
                  className="flex flex-col gap-4 "
                  onSubmit={form.handleSubmit(onSubmit)}
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>{t("emailLabel")}</FormLabel>
                        <FormControl>
                          <InputGroup className="rtl:pl-2">
                            <InputGroupAddon align="inline-end">
                              <InputGroupText>
                                <Mail className="size-4" aria-hidden />
                              </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              type="email"
                              placeholder={t("emailPlaceholder")}
                              autoComplete="email"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage>
                          {resolveErrorKey(
                            fieldState.error?.message,
                            commonResolved
                          )}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="flex items-baseline justify-between gap-3">
                          <FormLabel>{t("passwordLabel")}</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                          >
                            {t("forgotPassword")}
                          </Link>
                        </div>
                        <FormControl>
                          <InputGroup className="rtl:pl-2">
                            <InputGroupAddon align="inline-end">
                              <InputGroupText>
                                <Lock className="size-4" aria-hidden />
                              </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              type="password"
                              placeholder={t("passwordPlaceholder")}
                              autoComplete="current-password"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage>
                          {resolveErrorKey(
                            fieldState.error?.message,
                            commonResolved
                          )}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="mt-1 w-full font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        {t("submit")}
                      </>
                    ) : (
                      t("submit")
                    )}
                  </Button>
                </form>
              </Form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                {t("signupPrompt")}{" "}
                <Link
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  href="/register"
                >
                  {t("signupLink")}
                </Link>
              </p>
            </CardContent>

            <CardFooter className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary">{t("badges.shariaCertified")}</Badge>
              <Badge variant="secondary">{t("badges.secureEncryption")}</Badge>
            </CardFooter>
          </LiquidGlassCard>
        </div>
      </div>
    </main>
  )
}
