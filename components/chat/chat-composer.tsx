"use client"

import * as React from "react"
import { Loader2, Mic, Paperclip, Send, Square, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { VoiceRecordingPill } from "@/components/chat/voice-recording-pill"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ApiError } from "@/lib/api/client"
import { transcribeChatAudio } from "@/lib/api/transcribe"
import { useSendChatStream } from "@/lib/api/queries/chats"
import { useChatStore } from "@/lib/stores/chat"
import { cn } from "@/lib/utils"

const MAX_FILE_BYTES = 50 * 1024 * 1024
const MAX_RECORD_MS = 120_000

function newThreadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c
  }
  return undefined
}

function useDictateShortcutLabel() {
  return React.useMemo(() => {
    if (typeof navigator === "undefined") return "Ctrl+Shift+D"
    return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? "⌘⇧D"
      : "Ctrl+Shift+D"
  }, [])
}

export function ChatComposer({ threadId }: { threadId: string | null }) {
  const t = useTranslations("app.chat.composer")
  const dictateShortcut = useDictateShortcutLabel()
  const [message, setMessage] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [focused, setFocused] = React.useState(false)
  const [isRecording, setIsRecording] = React.useState(false)
  const [isTranscribing, setIsTranscribing] = React.useState(false)
  const [waveAnalyser, setWaveAnalyser] = React.useState<AnalyserNode | null>(
    null
  )
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const attachmentDuringVoiceRef = React.useRef<File | null>(null)

  const aliveRef = React.useRef(true)
  const pendingSubmitRef = React.useRef(false)
  const streamRef = React.useRef<MediaStream | null>(null)
  const recorderRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<BlobPart[]>([])
  const maxDurationRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const mediaSourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null)
  const analyserRef = React.useRef<AnalyserNode | null>(null)

  React.useEffect(() => {
    let previousPrefill = useChatStore.getState().composerPrefill
    return useChatStore.subscribe((state) => {
      const current = state.composerPrefill
      if (current === previousPrefill) return
      previousPrefill = current
      if (!current) return
      const text = useChatStore.getState().takeComposerPrefill()
      if (!text) return
      setMessage(text)
      queueMicrotask(() => textareaRef.current?.focus())
    })
  }, [])

  React.useEffect(() => {
    attachmentDuringVoiceRef.current = file
  }, [file])

  function teardownAudioAnalysis() {
    try {
      mediaSourceRef.current?.disconnect()
    } catch {
      /* ignore */
    }
    mediaSourceRef.current = null
    analyserRef.current = null
    const ctx = audioContextRef.current
    audioContextRef.current = null
    void ctx?.close().catch(() => {})
  }

  React.useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
      if (maxDurationRef.current) {
        clearTimeout(maxDurationRef.current)
        maxDurationRef.current = null
      }
      pendingSubmitRef.current = false
      const r = recorderRef.current
      if (r && r.state === "recording") {
        try {
          r.stop()
        } catch {
          /* ignore */
        }
      }
      teardownAudioAnalysis()
      streamRef.current?.getTracks().forEach((tr) => tr.stop())
      streamRef.current = null
      recorderRef.current = null
    }
  }, [])

  const isStreaming = useChatStore((s) => s.isStreaming)
  const streamingThreadId = useChatStore((s) => s.streamingThreadId)
  const abortStreaming = useChatStore((s) => s.abortStreaming)
  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId)

  const sendChat = useSendChatStream()

  const isThisThreadStreaming =
    isStreaming && !!threadId && streamingThreadId === threadId
  const voiceBusy =
    isRecording || isTranscribing || isStreaming || sendChat.isPending
  const canSend = !isStreaming && (message.trim().length > 0 || !!file)
  const showVoicePill = isRecording || isTranscribing

  function cleanupStream() {
    streamRef.current?.getTracks().forEach((tr) => tr.stop())
    streamRef.current = null
  }

  const transcribeAndSend = React.useCallback(
    async (blob: Blob, mimeType: string) => {
      const resolvedMime = mimeType || pickRecorderMime() || "audio/webm"
      const filename = resolvedMime.includes("mp4")
        ? "recording.mp4"
        : "recording.webm"

      setIsTranscribing(true)
      try {
        const text = (await transcribeChatAudio(blob, { filename })).trim()
        if (!text.length) {
          toast.error(t("voiceEmptyTranscript"))
          return
        }
        const targetId = threadId ?? newThreadId()
        if (!threadId) setActiveThreadId(targetId)
        await sendChat.mutateAsync({
          threadId: targetId,
          message: text,
          file: attachmentDuringVoiceRef.current,
        })
      } catch (err) {
        const description =
          err instanceof ApiError
            ? err.detail
            : err instanceof Error
              ? err.message
              : undefined
        toast.error(t("voiceTranscriptionFailed"), { description })
      } finally {
        if (aliveRef.current) setIsTranscribing(false)
      }
    },
    [threadId, sendChat, setActiveThreadId, t]
  )

  const cancelDictation = React.useCallback(() => {
    if (isTranscribing) return
    pendingSubmitRef.current = false
    if (maxDurationRef.current) {
      clearTimeout(maxDurationRef.current)
      maxDurationRef.current = null
    }
    const r = recorderRef.current
    if (r && r.state === "recording") {
      try {
        r.stop()
      } catch {
        teardownAudioAnalysis()
        cleanupStream()
        recorderRef.current = null
        if (aliveRef.current) {
          setWaveAnalyser(null)
          setIsRecording(false)
        }
      }
    } else {
      teardownAudioAnalysis()
      cleanupStream()
      recorderRef.current = null
      if (aliveRef.current) {
        setWaveAnalyser(null)
        setIsRecording(false)
      }
    }
  }, [isTranscribing])

  const confirmDictation = React.useCallback(() => {
    if (isTranscribing) return
    pendingSubmitRef.current = true
    if (maxDurationRef.current) {
      clearTimeout(maxDurationRef.current)
      maxDurationRef.current = null
    }
    const r = recorderRef.current
    if (r && r.state === "recording") {
      try {
        r.stop()
      } catch {
        pendingSubmitRef.current = false
        teardownAudioAnalysis()
        cleanupStream()
        recorderRef.current = null
        if (aliveRef.current) {
          setWaveAnalyser(null)
          setIsRecording(false)
        }
      }
    }
  }, [isTranscribing])

  const startDictation = React.useCallback(async () => {
    if (isTranscribing || isStreaming || sendChat.isPending || isRecording)
      return

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      toast.error(t("voiceNotSupported"))
      return
    }

    pendingSubmitRef.current = false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      streamRef.current = stream

      const ctx = new AudioContext()
      audioContextRef.current = ctx
      await ctx.resume()

      const source = ctx.createMediaStreamSource(stream)
      mediaSourceRef.current = source

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.72
      analyserRef.current = analyser
      source.connect(analyser)

      if (aliveRef.current) setWaveAnalyser(analyser)

      const mime = pickRecorderMime()
      const rec = new MediaRecorder(
        stream,
        mime ? { mimeType: mime } : undefined
      )
      recorderRef.current = rec
      chunksRef.current = []

      rec.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data)
      }

      rec.onstop = () => {
        if (maxDurationRef.current) {
          clearTimeout(maxDurationRef.current)
          maxDurationRef.current = null
        }

        const mimeType = rec.mimeType || pickRecorderMime() || "audio/webm"
        const submit = pendingSubmitRef.current
        pendingSubmitRef.current = false

        const blob = new Blob(chunksRef.current, { type: mimeType })
        chunksRef.current = []

        teardownAudioAnalysis()
        cleanupStream()
        recorderRef.current = null

        if (aliveRef.current) {
          setWaveAnalyser(null)
          setIsRecording(false)
        }

        if (submit && blob.size >= 32 && aliveRef.current) {
          void transcribeAndSend(blob, mimeType)
        }
      }

      maxDurationRef.current = setTimeout(() => {
        pendingSubmitRef.current = true
        const rTimer = recorderRef.current
        if (rTimer && rTimer.state === "recording") {
          try {
            rTimer.stop()
          } catch {
            /* ignore */
          }
        }
      }, MAX_RECORD_MS)

      rec.start(250)
      if (aliveRef.current) setIsRecording(true)
    } catch (err) {
      teardownAudioAnalysis()
      cleanupStream()
      recorderRef.current = null
      if (aliveRef.current) {
        setWaveAnalyser(null)
        setIsRecording(false)
      }
      const name = err instanceof DOMException ? err.name : ""
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        toast.error(t("voiceMicDenied"), {
          description: t("voiceMicDeniedDescription"),
        })
      } else {
        toast.error(t("voiceRecordingFailed"))
      }
    }
  }, [
    isStreaming,
    sendChat.isPending,
    t,
    transcribeAndSend,
    isTranscribing,
    isRecording,
  ])

  React.useEffect(() => {
    if (!isRecording || isTranscribing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        cancelDictation()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isRecording, isTranscribing, cancelDictation])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        !e.shiftKey ||
        !(e.ctrlKey || e.metaKey) ||
        e.key.toLowerCase() !== "d"
      ) {
        return
      }
      const el = e.target
      if (
        el instanceof HTMLElement &&
        el.closest("[data-skip-dictate-shortcut]")
      ) {
        return
      }
      e.preventDefault()
      if (isRecording) confirmDictation()
      else if (!isTranscribing && !isStreaming && !sendChat.isPending) {
        void startDictation()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [
    isRecording,
    isTranscribing,
    isStreaming,
    sendChat.isPending,
    confirmDictation,
    startDictation,
  ])

  async function handleSend() {
    if (!canSend) return
    const targetId = threadId ?? newThreadId()
    if (!threadId) setActiveThreadId(targetId)
    const payload = {
      threadId: targetId,
      message: message.trim() || undefined,
      file,
    }
    setMessage("")
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    try {
      await sendChat.mutateAsync(payload)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      const description =
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : undefined
      toast.error(t("sendFailed"), { description })
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0]
    if (!next) {
      setFile(null)
      return
    }
    if (next.size > MAX_FILE_BYTES) {
      toast.error(t("fileTooLarge"), {
        description: t("fileTooLargeDescription"),
      })
      e.target.value = ""
      return
    }
    setFile(next)
  }

  return (
    <div className="px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-6 sm:pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]">
      <div
        className={cn(
          "glass-card overflow-hidden rounded-2xl transition-shadow",
          focused && !showVoicePill
            ? "border-accent/40 shadow-[0_0_0_3px_rgba(212,175,55,0.10),var(--glass-shadow-card)]"
            : ""
        )}
      >
        {file ? (
          <div className="flex items-center justify-between gap-2 border-b border-(--glass-border-card) bg-primary/6 px-4 py-2 text-xs">
            <span className="truncate">📎 {file.name}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-6"
              disabled={showVoicePill}
              onClick={() => {
                setFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}

        {showVoicePill ? (
          <div className="px-4 py-4 sm:px-5">
            <p className="sr-only text-muted-foreground" aria-live="polite">
              {isTranscribing ? t("voiceTranscribing") : t("voiceRecording")}
            </p>
            <VoiceRecordingPill
              analyser={isRecording && !isTranscribing ? waveAnalyser : null}
              isTranscribing={isTranscribing}
              onAttach={() => fileInputRef.current?.click()}
              onCancel={cancelDictation}
              onConfirm={confirmDictation}
              attachLabel={t("attach")}
              cancelLabel={t("voiceCancelRecording")}
              confirmLabel={t("voiceConfirmRecording")}
            />
          </div>
        ) : (
          <>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={threadId ? t("placeholder") : t("newPlaceholder")}
              rows={3}
              className="min-h-[72px] resize-none border-0 bg-transparent px-4 py-3.5 text-sm leading-relaxed shadow-none focus-visible:ring-0"
              disabled={isStreaming && !isThisThreadStreaming}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2.5">
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming || showVoicePill}
                  aria-label={t("attach")}
                  className="size-8 text-muted-foreground hover:text-primary"
                >
                  <Paperclip className="size-4" />
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={voiceBusy}
                      aria-label={t("voiceMic")}
                      onClick={() => void startDictation()}
                      className="size-8 text-muted-foreground hover:text-primary"
                    >
                      {isTranscribing ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <Mic className="size-4" aria-hidden />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={6}
                    className="max-w-[220px] border-border/80 bg-popover px-3 py-2 text-popover-foreground shadow-lg"
                  >
                    <p className="text-sm font-medium">{t("voiceDictate")}</p>
                    <p className="mt-0.5 text-xs tracking-wide text-muted-foreground">
                      {dictateShortcut}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
                <span className="hidden text-[11px] text-muted-foreground sm:inline">
                  {t("enterToSend")}
                </span>
                {isThisThreadStreaming ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={abortStreaming}
                    className="w-full gap-2 sm:w-auto"
                  >
                    <Square className="size-4" aria-hidden />
                    {t("stop")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend}
                    className={cn(
                      "shimmer w-full shrink-0 gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_3px_12px_rgba(6,78,59,0.25)] transition-transform sm:w-auto",
                      canSend
                        ? "bg-[linear-gradient(135deg,#064e3b_0%,#0a6652_100%)] hover:-translate-y-0.5 hover:shadow-[0_5px_16px_rgba(6,78,59,0.35)]"
                        : "bg-primary/20 text-muted-foreground shadow-none"
                    )}
                  >
                    {sendChat.isPending ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Send className="size-4" aria-hidden />
                    )}
                    {t("send")}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/80">
        {t("disclaimer")}
      </p>
    </div>
  )
}
