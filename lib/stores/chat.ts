import { create } from "zustand"

import type { RetrievedSource } from "@/lib/types/retrieved-source"

type ChatStreamState = {
  activeThreadId: string | null
  streamingThreadId: string | null
  streamingText: string
  streamingSources: RetrievedSource[]
  isStreaming: boolean
  abortController: AbortController | null
  composerPrefill: string | null
  setActiveThreadId: (id: string | null) => void
  startStreaming: (threadId: string, controller: AbortController) => void
  appendToken: (text: string) => void
  setStreamingSources: (sources: RetrievedSource[]) => void
  finishStreaming: () => void
  abortStreaming: () => void
  setComposerPrefill: (text: string | null) => void
  takeComposerPrefill: () => string | null
}

export const useChatStore = create<ChatStreamState>((set, get) => ({
  activeThreadId: null,
  streamingThreadId: null,
  streamingText: "",
  streamingSources: [],
  isStreaming: false,
  abortController: null,
  composerPrefill: null,
  setActiveThreadId: (id) => set({ activeThreadId: id }),
  startStreaming: (threadId, controller) =>
    set({
      streamingThreadId: threadId,
      streamingText: "",
      streamingSources: [],
      isStreaming: true,
      abortController: controller,
    }),
  appendToken: (text) =>
    set((state) => ({ streamingText: state.streamingText + text })),
  setStreamingSources: (sources) => set({ streamingSources: sources }),
  finishStreaming: () =>
    set({
      streamingThreadId: null,
      streamingText: "",
      streamingSources: [],
      isStreaming: false,
      abortController: null,
    }),
  abortStreaming: () => {
    const ctrl = get().abortController
    ctrl?.abort()
    set({
      streamingThreadId: null,
      streamingText: "",
      streamingSources: [],
      isStreaming: false,
      abortController: null,
    })
  },
  setComposerPrefill: (text) => set({ composerPrefill: text }),
  takeComposerPrefill: () => {
    const text = get().composerPrefill
    set({ composerPrefill: null })
    return text
  },
}))
