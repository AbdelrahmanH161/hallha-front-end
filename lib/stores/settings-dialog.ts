import { create } from "zustand"

export type SettingsTab = "profile" | "organization" | "preferences"

type SettingsDialogState = {
  open: boolean
  tab: SettingsTab
  openAt: (tab?: SettingsTab) => void
  setTab: (tab: SettingsTab) => void
  setOpen: (open: boolean) => void
  close: () => void
}

export const useSettingsDialog = create<SettingsDialogState>((set) => ({
  open: false,
  tab: "profile",
  openAt: (tab = "profile") => set({ open: true, tab }),
  setTab: (tab) => set({ tab }),
  setOpen: (open) => set({ open }),
  close: () => set({ open: false }),
}))
