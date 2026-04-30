import { RegisterWizard } from "@/components/auth/onboarding/register-wizard"

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function RegisterPage({ params }: PageProps) {
  const { locale } = await params

  const direction = locale === "ar" ? "rtl" : "ltr"

  return (
    <div dir={direction}>
      <RegisterWizard />
    </div>
  )
}
