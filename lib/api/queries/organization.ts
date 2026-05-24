import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import type {
  AuditorOnboardingInput,
  BusinessOnboardingInput,
} from "@/lib/schemas/onboarding"
import type { PlanInput, WorkspaceProfileInput } from "@/lib/schemas/organization"

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
  workspaceKind?: "individual" | "business"
  userType?: "business" | "auditor"
  contextSummary?: string
  onboardingData?: Record<string, unknown>
  [key: string]: unknown
}

export const organizationKeys = {
  me: ["organization", "me"] as const,
}

export function useOrganizationQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: organizationKeys.me,
    queryFn: () =>
      apiFetch<{ organization: Organization }>("/organizations/me").then(
        (r) => r.organization
      ),
    enabled: options?.enabled ?? true,
  })
}

export function useUpdateCompanyProfileMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: WorkspaceProfileInput) =>
      apiFetch<{ ok: true; organization: Organization }>("/organizations/me", {
        method: "PATCH",
        body: data,
      }),
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

export function useSetPersonaMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { userType: "business" | "auditor" }) =>
      apiFetch<{ ok: true; organization: Organization }>(
        "/organizations/me/persona",
        { method: "POST", body }
      ),
    onSuccess: (data) => {
      qc.setQueryData(organizationKeys.me, data.organization)
    },
  })
}

export function useSubmitBusinessOnboardingMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: BusinessOnboardingInput) =>
      apiFetch<{ ok: true; organization: Organization }>(
        "/organizations/me/onboarding/business",
        { method: "POST", body }
      ),
    onSuccess: (data) => {
      qc.setQueryData(organizationKeys.me, data.organization)
      qc.invalidateQueries({ queryKey: organizationKeys.me })
    },
  })
}

export function useSubmitAuditorOnboardingMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AuditorOnboardingInput) =>
      apiFetch<{ ok: true; organization: Organization }>(
        "/organizations/me/onboarding/auditor",
        { method: "POST", body }
      ),
    onSuccess: (data) => {
      qc.setQueryData(organizationKeys.me, data.organization)
      qc.invalidateQueries({ queryKey: organizationKeys.me })
    },
  })
}

export type FirstClientInput = {
  name: string
  industry?: string
}

export function useSubmitFirstClientMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: FirstClientInput) =>
      apiFetch<{
        ok: true
        organization: Organization
        client: { id: string; name: string; industry: string | null }
      }>("/organizations/me/onboarding/first-client", { method: "POST", body }),
    onSuccess: (data) => {
      qc.setQueryData(organizationKeys.me, data.organization)
      qc.invalidateQueries({ queryKey: organizationKeys.me })
      qc.invalidateQueries({ queryKey: ["clients"] })
    },
  })
}
