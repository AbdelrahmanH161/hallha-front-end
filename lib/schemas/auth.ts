import { z } from "zod"
type Translate = (key: string) => string

export const createLoginSchema = (t: Translate) =>
  z.object({
    email: z.string().min(1, { message: t("required") }).email({ message: t("invalidEmail") }),
    password: z.string().min(8, { message: t("passwordMin") }),
  })

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>

export const createSignUpSchema = (t: Translate) =>
  z
    .object({
      email: z.string().min(1, { message: t("required") }).email({ message: t("invalidEmail") }),
      password: z.string().min(8, { message: t("passwordMin") }),
      confirmPassword: z.string().min(8, { message: t("passwordMin") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: t("passwordsMustMatch"),
    })

export type SignUpInput = z.infer<ReturnType<typeof createSignUpSchema>>
