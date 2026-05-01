import { z } from "zod"

export const workspaceKindSchema = z.enum(["individual", "business"])

export const workspaceProfileSchema = z
  .object({
    workspaceKind: workspaceKindSchema,
    legalName: z.string().min(2, { message: "required" }),
    registrationNumber: z.string(),
    country: z.string().min(2, { message: "required" }),
    industry: z.string().min(1, { message: "required" }),
  })
  .superRefine((data, ctx) => {
    if (
      data.workspaceKind === "business" &&
      data.registrationNumber.trim().length < 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "required",
        path: ["registrationNumber"],
      })
    }
  })

export type WorkspaceProfileInput = z.infer<typeof workspaceProfileSchema>

export const bankLinkSchema = z.object({
  institutionId: z.string().min(1, { message: "required" }),
  sandbox: z.literal(true).default(true),
})

export type BankLinkInput = z.infer<typeof bankLinkSchema>

export const planSchema = z.object({
  plan: z.enum(["free", "starter", "business", "enterprise"]),
  billing: z.enum(["monthly", "yearly"]),
})

export type PlanInput = z.infer<typeof planSchema>
