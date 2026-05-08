import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import type {
  AuditorOnboardingInput,
  BusinessOnboardingInput,
} from "@/lib/schemas/onboarding"

export type WorkspaceKind = "individual" | "business"

export type CompanyDraft = {
  workspaceKind: WorkspaceKind
  legalName: string
  registrationNumber: string
  country: string
  industry: string
}

export type PlanDraft = {
  plan: "free" | "starter" | "business" | "enterprise" | null
  billing: "monthly" | "yearly"
}

/** Persona routing for onboarding (persisted locally until server sync). */
export type DraftUserPath = "business" | "auditor" | null

const DRAFT_VERSION = 2

export const initialBusinessAnswers: BusinessOnboardingInput = {
  industry: "fintech",
  targetAudience: "b2b",
  revenueModel: "subscription",
  paymentMethods: [],
}

export const initialAuditorAnswers: AuditorOnboardingInput = {
  specialization: "general",
  standards: ["aaoifi"],
  useCase: "consultantClientContracts",
}

type RegisterDraftState = {
  _version: number
  email: string | null
  /** Local-only until POST /organizations/me/persona */
  userPath: DraftUserPath
  businessAnswers: BusinessOnboardingInput
  auditorAnswers: AuditorOnboardingInput
  company: CompanyDraft
  planSelection: PlanDraft
  setEmail: (email: string) => void
  setUserPath: (path: "business" | "auditor") => void
  setBusinessAnswers: (data: Partial<BusinessOnboardingInput>) => void
  setAuditorAnswers: (data: Partial<AuditorOnboardingInput>) => void
  setCompany: (data: Partial<CompanyDraft>) => void
  setPlanSelection: (data: Partial<PlanDraft>) => void
  reset: () => void
}

const initialCompany: CompanyDraft = {
  workspaceKind: "individual",
  legalName: "",
  registrationNumber: "",
  country: "",
  industry: "",
}

const initialPlan: PlanDraft = { plan: null, billing: "monthly" }

const initialState = {
  _version: DRAFT_VERSION,
  email: null as string | null,
  userPath: null as DraftUserPath,
  businessAnswers: initialBusinessAnswers,
  auditorAnswers: initialAuditorAnswers,
  company: initialCompany,
  planSelection: initialPlan,
}

export const useRegisterDraft = create<RegisterDraftState>()(
  persist(
    (set) => ({
      ...initialState,
      setEmail: (email) => set({ email }),
      setUserPath: (path) =>
        set(() => ({
          userPath: path,
          ...(path === "business"
            ? { auditorAnswers: { ...initialAuditorAnswers } }
            : { businessAnswers: { ...initialBusinessAnswers } }),
        })),
      setBusinessAnswers: (data) =>
        set((state) => ({
          businessAnswers: { ...state.businessAnswers, ...data },
        })),
      setAuditorAnswers: (data) =>
        set((state) => ({
          auditorAnswers: { ...state.auditorAnswers, ...data },
        })),
      setCompany: (data) =>
        set((state) => ({ company: { ...state.company, ...data } })),
      setPlanSelection: (data) =>
        set((state) => ({
          planSelection: { ...state.planSelection, ...data },
        })),
      reset: () =>
        set({
          ...initialState,
        }),
    }),
    {
      name: "hallha-register-draft",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? sessionStorage
          : (undefined as unknown as Storage)
      ),
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<RegisterDraftState> | undefined
        if (!p) return currentState
        const coercedCompany: CompanyDraft = {
          ...initialCompany,
          ...currentState.company,
          ...p.company,
          workspaceKind:
            p.company?.workspaceKind === "business"
              ? "business"
              : "individual",
        }

        let businessAnswers = currentState.businessAnswers
        let auditorAnswers = currentState.auditorAnswers

        const rawVersion =
          "_version" in p && typeof p._version === "number"
            ? p._version
            : 1

        if (rawVersion < DRAFT_VERSION) {
          businessAnswers = { ...initialBusinessAnswers }
          auditorAnswers = { ...initialAuditorAnswers }
        } else if (rawVersion >= DRAFT_VERSION) {
          businessAnswers = {
            ...initialBusinessAnswers,
            ...currentState.businessAnswers,
            ...(p.businessAnswers ?? {}),
          }
          auditorAnswers = {
            ...initialAuditorAnswers,
            ...currentState.auditorAnswers,
            ...(p.auditorAnswers ?? {}),
          }
        }

        return {
          ...currentState,
          ...p,
          _version: DRAFT_VERSION,
          email: p.email ?? currentState.email,
          userPath:
            p.userPath === "business" || p.userPath === "auditor"
              ? p.userPath
              : currentState.userPath,
          company: coercedCompany,
          businessAnswers,
          auditorAnswers,
          planSelection: {
            ...initialPlan,
            ...currentState.planSelection,
            ...(p.planSelection ?? {}),
          },
        }
      },
    }
  )
)
