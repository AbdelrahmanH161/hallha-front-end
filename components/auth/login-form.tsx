"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2, Lock, Mail } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { signIn } from "@/lib/auth/client"
import { ApiError } from "@/lib/api/client"
import { dictionary, type Locale } from "@/lib/i18n"
import { loginSchema, type LoginInput } from "@/lib/schemas/auth"

export type LoginFormCopy = {
  title: string
  subtitle: string
  emailLabel: string
  emailPlaceholder: string
  passwordLabel: string
  passwordPlaceholder: string
  forgotPassword: string
  submit: string
  signupPrompt: string
  signupLink: string
  badges: {
    shariaCertified: string
    secureEncryption: string
  }
}

type CommonCopy = (typeof dictionary)[Locale]["common"]

function resolveErrorKey(key: string | undefined, common: CommonCopy): string | undefined {
  if (!key) return undefined
  const errors = common.errors as Record<string, string>
  return errors[key] ?? key
}

export function LoginForm({ locale, t }: { locale: Locale; t: LoginFormCopy }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const common = dictionary[locale].common

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
        toast.error(common.toast.loginFailed, {
          description: result.error.message ?? undefined,
        })
        return
      }
      toast.success(common.toast.loginSuccess)
      const from = searchParams.get("from")
      router.push(from && from.startsWith("/") ? from : `/${locale}/dashboard`)
      router.refresh()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : common.errors.unknown
      toast.error(common.toast.loginFailed, { description: message })
    }
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.05]">
        <Image
          src="/auth/login-pattern.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="pointer-events-none absolute -left-24 -top-24 size-[420px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-[420px] rounded-full bg-accent/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-[420px]">
        <Card className="border bg-card/60 shadow-2xl backdrop-blur-xl">
          <CardHeader className="items-center text-center">
            <div className="mb-2 grid size-16 place-items-center">
              <Image
                src="/auth/login-logo.png"
                alt="Hallilha"
                width={64}
                height={64}
                priority
                className="max-h-16 w-auto object-contain"
              />
            </div>

            <CardTitle className="text-xl">{t.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                className="flex flex-col gap-4"
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
              >
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
                      <FormMessage>
                        {resolveErrorKey(fieldState.error?.message, common)}
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
                        <FormLabel>{t.passwordLabel}</FormLabel>
                        <Link
                          href={`/${locale}/forgot-password`}
                          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {t.forgotPassword}
                        </Link>
                      </div>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon align="inline-end">
                            <InputGroupText>
                              <Lock className="size-4" aria-hidden />
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            type="password"
                            placeholder={t.passwordPlaceholder}
                            autoComplete="current-password"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage>
                        {resolveErrorKey(fieldState.error?.message, common)}
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
                      {t.submit}
                    </>
                  ) : (
                    t.submit
                  )}
                </Button>
              </form>
            </Form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t.signupPrompt}{" "}
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                href={`/${locale}/register`}
              >
                {t.signupLink}
              </Link>
            </p>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary">{t.badges.shariaCertified}</Badge>
            <Badge variant="secondary">{t.badges.secureEncryption}</Badge>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
