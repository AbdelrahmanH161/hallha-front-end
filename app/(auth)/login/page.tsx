import { LoginForm } from "@/components/auth/login-form"

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params

  const direction = locale === "ar" ? "rtl" : "ltr"

  return (
    <div dir={direction}>
      <LoginForm />
    </div>
  )
}
