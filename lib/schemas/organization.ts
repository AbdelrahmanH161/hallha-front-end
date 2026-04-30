import { z } from "zod"

export const companyProfileSchema = z.object({
  legalName: z.string().min(2, { message: "required" }),
  registrationNumber: z.string().min(1, { message: "required" }),
  country: z.string().min(2, { message: "required" }),
  industry: z.string().min(1, { message: "required" }),
})

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>

export const bankLinkSchema = z.object({
  institutionId: z.string().min(1, { message: "required" }),
  sandbox: z.literal(true).default(true),
})

export type BankLinkInput = z.infer<typeof bankLinkSchema>

export const planSchema = z.object({
  plan: z.enum(["starter", "business", "enterprise"]),
  billing: z.enum(["monthly", "yearly"]),
})

export type PlanInput = z.infer<typeof planSchema>
