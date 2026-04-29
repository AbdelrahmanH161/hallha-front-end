import { notFound } from "next/navigation"

import { LoginForm } from "@/components/auth/login-form"
import { dictionary, getDirection, isLocale } from "@/lib/i18n"

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const direction = getDirection(locale)
  const t = dictionary[locale].auth.login

  return (
    <div dir={direction}>
      <LoginForm locale={locale} t={t} />
    </div>
  )
}
