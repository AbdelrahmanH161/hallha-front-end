import { notFound } from "next/navigation"

import { RegisterWizard } from "@/components/auth/onboarding/register-wizard"
import type { RegisterWizardCopy } from "@/components/auth/onboarding/register-wizard"
import { dictionary, getDirection, isLocale } from "@/lib/i18n"

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function RegisterPage({ params }: PageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const direction = getDirection(locale)
  const auth = dictionary[locale].auth
  if (!("register" in auth)) {
    notFound()
  }
  const t = auth.register as unknown as RegisterWizardCopy

  return (
    <div dir={direction}>
      <RegisterWizard t={t} />
    </div>
  )
}
