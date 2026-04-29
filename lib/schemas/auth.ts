import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, { message: "required" }).email({ message: "invalidEmail" }),
  password: z.string().min(8, { message: "passwordMin" }),
})

export type LoginInput = z.infer<typeof loginSchema>

export const signUpSchema = z
  .object({
    email: z.string().min(1, { message: "required" }).email({ message: "invalidEmail" }),
    password: z.string().min(8, { message: "passwordMin" }),
    confirmPassword: z.string().min(8, { message: "passwordMin" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordsMustMatch",
  })

export type SignUpInput = z.infer<typeof signUpSchema>
