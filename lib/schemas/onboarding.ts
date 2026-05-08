import { z } from "zod"

const pm = z.enum([
  "installments",
  "digitalGateways",
  "cash",
  "wireTransfer",
  "crypto",
])

const std = z.enum(["aaoifi", "nationalLaws", "hanafi", "maliki", "shafii", "hanbali"])

export const onboardingUserTypeSchema = z.enum(["business", "auditor"], {
  error: () => ({ message: "required" }),
})

export const businessOnboardingSchema = z.object({
  industry: z.enum(
    ["fintech", "realEstate", "ecommerce", "investment", "lending", "insurance", "other"],
    { error: () => ({ message: "required" }) }
  ),
  targetAudience: z.enum(["b2b", "b2c", "b2b2c"], {
    error: () => ({ message: "required" }),
  }),
  revenueModel: z.enum(
    [
      "subscription",
      "commission",
      "markup",
      "transactionFee",
      "interestSpread",
      "other",
    ],
    { error: () => ({ message: "required" }) }
  ),
  paymentMethods: z.array(pm).min(1, { message: "selectAtLeastOne" }),
})

export type BusinessOnboardingInput = z.infer<typeof businessOnboardingSchema>

export const auditorOnboardingSchema = z.object({
  specialization: z.enum(
    ["banking", "crypto", "insuranceTakaful", "capitalMarkets", "realEstate", "general"],
    { error: () => ({ message: "required" }) }
  ),
  standards: z.array(std).min(1, { message: "selectAtLeastOne" }),
  useCase: z.enum(
    ["consultantClientContracts", "internalCompliance", "training", "other"],
    { error: () => ({ message: "required" }) }
  ),
})

export type AuditorOnboardingInput = z.infer<typeof auditorOnboardingSchema>
