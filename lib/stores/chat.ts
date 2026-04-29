import { create } from "zustand"

type ChatStreamState = {
  activeThreadId: string | null
  streamingThreadId: string | null
  streamingText: string
  isStreaming: boolean
  abortController: AbortController | null
  setActiveThreadId: (id: string | null) => void
  startStreaming: (threadId: string, controller: AbortController) => void
  appendToken: (text: string) => void
  finishStreaming: () => void
  abortStreaming: () => void
}

export const useChatStore = create<ChatStreamState>((set, get) => ({
  activeThreadId: null,
  streamingThreadId: null,
  streamingText: "",
  isStreaming: false,
  abortController: null,
  setActiveThreadId: (id) => set({ activeThreadId: id }),
  startStreaming: (threadId, controller) =>
    set({
      streamingThreadId: threadId,
      streamingText: "",
      isStreaming: true,
      abortController: controller,
    }),
  appendToken: (text) =>
    set((state) => ({ streamingText: state.streamingText + text })),
  finishStreaming: () =>
    set({
      streamingThreadId: null,
      streamingText: "",
      isStreaming: false,
      abortController: null,
    }),
  abortStreaming: () => {
    const ctrl = get().abortController
    ctrl?.abort()
    set({
      streamingThreadId: null,
      streamingText: "",
      isStreaming: false,
      abortController: null,
    })
  },
}))
