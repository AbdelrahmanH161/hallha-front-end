import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type CompanyDraft = {
  legalName: string
  registrationNumber: string
  country: string
  industry: string
}

export type BankDraft = {
  institutionId: string | null
}

export type PlanDraft = {
  plan: "startup" | "growth" | "enterprise" | null
  billing: "monthly" | "yearly"
}

type RegisterDraftState = {
  email: string | null
  company: CompanyDraft
  bank: BankDraft
  planSelection: PlanDraft
  setEmail: (email: string) => void
  setCompany: (data: Partial<CompanyDraft>) => void
  setBank: (data: Partial<BankDraft>) => void
  setPlanSelection: (data: Partial<PlanDraft>) => void
  reset: () => void
}

const initialCompany: CompanyDraft = {
  legalName: "",
  registrationNumber: "",
  country: "",
  industry: "",
}

const initialBank: BankDraft = { institutionId: null }
const initialPlan: PlanDraft = { plan: null, billing: "monthly" }

export const useRegisterDraft = create<RegisterDraftState>()(
  persist(
    (set) => ({
      email: null,
      company: initialCompany,
      bank: initialBank,
      planSelection: initialPlan,
      setEmail: (email) => set({ email }),
      setCompany: (data) =>
        set((state) => ({ company: { ...state.company, ...data } })),
      setBank: (data) =>
        set((state) => ({ bank: { ...state.bank, ...data } })),
      setPlanSelection: (data) =>
        set((state) => ({ planSelection: { ...state.planSelection, ...data } })),
      reset: () =>
        set({
          email: null,
          company: initialCompany,
          bank: initialBank,
          planSelection: initialPlan,
        }),
    }),
    {
      name: "hallha-register-draft",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : (undefined as unknown as Storage)
      ),
    }
  )
)
