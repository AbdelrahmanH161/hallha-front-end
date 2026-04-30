import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import type {
  BankLinkInput,
  CompanyProfileInput,
  PlanInput,
} from "@/lib/schemas/organization"

export type Organization = {
  id: string
  name?: string
  slug?: string
  plan?: string
  planStatus?: string
  legalName?: string
  registrationNumber?: string
  country?: string
  industry?: string
  bankInstitutionId?: string
  billingCycle?: "monthly" | "yearly"
  onboardingStep?: number
  onboardingCompleted?: boolean
  [key: string]: unknown
}

export const organizationKeys = {
  me: ["organization", "me"] as const,
}

export function useOrganizationQuery() {
  return useQuery({
    queryKey: organizationKeys.me,
    queryFn: () =>
      apiFetch<{ organization: Organization }>("/organizations/me").then(
        (r) => r.organization
      ),
  })
}

export function useUpdateCompanyProfileMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CompanyProfileInput) =>
      apiFetch<{ ok: true; organization: Organization }>("/organizations/me", {
        method: "PATCH",
        body: data,
      }),
    onSuccess: (data) => {
      qc.setQueryData(organizationKeys.me, data.organization)
    },
  })
}

export function useLinkBankMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BankLinkInput) =>
      apiFetch<{ ok: true; organization: Organization }>(
        "/organizations/me/bank-link",
        {
          method: "POST",
          body: data,
        }
      ),
    onSuccess: (data) => {
      qc.setQueryData(organizationKeys.me, data.organization)
    },
  })
}

export function useChoosePlanMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PlanInput) =>
      apiFetch<{ ok: true; organization: Organization }>(
        "/organizations/me/plan",
        {
          method: "POST",
          body: data,
        }
      ),
    onSuccess: (data) => {
      qc.setQueryData(organizationKeys.me, data.organization)
    },
  })
}

export function useSkipOnboardingMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { fromStep?: number }) =>
      apiFetch<{ ok: true; organization: Organization }>(
        "/organizations/me/onboarding/skip",
        {
          method: "POST",
          body: data,
        }
      ),
    onSuccess: (data) => {
      qc.setQueryData(organizationKeys.me, data.organization)
    },
  })
}
