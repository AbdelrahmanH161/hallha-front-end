"use client"

import Image from "next/image"
import Link from "next/link"
import { Lock, Mail } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"

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

export function LoginForm({ locale, t }: { locale: string; t: LoginFormCopy }) {
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
            <form className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.emailLabel}</Label>
                <InputGroup>
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>
                      <Mail className="size-4" aria-hidden />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    autoComplete="email"
                    required
                  />
                </InputGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <Label htmlFor="password">{t.passwordLabel}</Label>
                  <Link
                    href="#"
                    className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {t.forgotPassword}
                  </Link>
                </div>
                <InputGroup>
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>
                      <Lock className="size-4" aria-hidden />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t.passwordPlaceholder}
                    autoComplete="current-password"
                    required
                  />
                </InputGroup>
              </div>

              <Button type="submit" className="mt-1 w-full font-semibold">
                {t.submit}
              </Button>
            </form>

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

