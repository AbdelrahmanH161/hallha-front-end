"use client"

import * as React from "react"
import { Check, Loader2, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Enough segments to span the flex center; each column flexes so bars use full width.
 * Bars stay short vertically and grow only upward from the dotted baseline.
 */
const BAR_COUNT = 48

function VoiceWaveformBars({ analyser }: { analyser: AnalyserNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const bars = root.querySelectorAll<HTMLDivElement>("[data-voice-bar]")
    if (bars.length !== BAR_COUNT) return

    const data = new Uint8Array(analyser.frequencyBinCount)
    let raf = 0

    const loop = () => {
      analyser.getByteFrequencyData(data)
      const slice = Math.max(1, Math.floor(data.length / BAR_COUNT))
      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0
        const start = i * slice
        const end = Math.min(start + slice, data.length)
        for (let j = start; j < end; j++) sum += data[j] ?? 0
        const avg = sum / (end - start)
        const h = 2 + (avg / 255) * 16
        bars[i]?.style.setProperty("height", `${h}px`)
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [analyser])

  return (
    <div
      ref={containerRef}
      className="flex h-8 w-full min-w-0 items-end gap-[2px]"
      aria-hidden
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <div key={i} className="flex min-h-0 min-w-0 flex-1 justify-center">
          <div
            data-voice-bar
            className="bg-foreground/80 min-h-[2px] w-0.5 max-w-[3px] shrink-0 rounded-full transition-none [transform-origin:bottom]"
            style={{ height: 2 }}
          />
        </div>
      ))}
    </div>
  )
}

function TranscribingPlaceholder() {
  return (
    <div
      className="flex h-8 w-full min-w-0 items-end gap-[2px]"
      aria-busy
      aria-live="polite"
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <div key={i} className="flex min-h-0 min-w-0 flex-1 justify-center">
          <div
            className="bg-muted-foreground/45 max-h-5 min-h-[3px] w-0.5 max-w-[3px] shrink-0 animate-pulse rounded-full"
            style={{
              height: 6 + (i % 5) * 2,
              animationDelay: `${(i % 12) * 60}ms`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export type VoiceRecordingPillProps = {
  analyser: AnalyserNode | null
  isTranscribing: boolean
  onAttach: () => void
  onCancel: () => void
  onConfirm: () => void
  attachLabel: string
  cancelLabel: string
  confirmLabel: string
}

export function VoiceRecordingPill({
  analyser,
  isTranscribing,
  onAttach,
  onCancel,
  onConfirm,
  attachLabel,
  cancelLabel,
  confirmLabel,
}: VoiceRecordingPillProps) {
  return (
    <div
      className={cn(
        "border-border/55 bg-card/45 flex w-full min-h-[52px] items-end gap-1 rounded-full border px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl",
      )}
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="text-foreground/90 hover:text-foreground size-10 shrink-0 rounded-full"
        onClick={onAttach}
        disabled={isTranscribing}
        aria-label={attachLabel}
      >
        <Plus className="size-5 stroke-[1.75]" aria-hidden />
      </Button>

      <div className="flex min-h-8 min-w-0 flex-1 flex-col justify-end gap-0 px-1">
        {isTranscribing ? (
          <TranscribingPlaceholder />
        ) : analyser ? (
          <VoiceWaveformBars analyser={analyser} />
        ) : (
          <div className="text-muted-foreground flex h-8 w-full min-w-0 items-center justify-center">
            <Loader2 className="size-4 animate-spin" aria-hidden />
          </div>
        )}
        <div
          className="border-muted-foreground/40 mt-1 h-px w-full shrink-0 border-b border-dotted"
          aria-hidden
        />
      </div>

      <div className="flex shrink-0 items-end gap-0.5 pb-px">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-foreground/90 hover:text-foreground size-10 shrink-0 rounded-full"
          onClick={onCancel}
          disabled={isTranscribing}
          aria-label={cancelLabel}
        >
          <X className="size-5 stroke-[1.75]" aria-hidden />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-foreground/90 hover:text-foreground size-10 shrink-0 rounded-full"
          onClick={onConfirm}
          disabled={isTranscribing}
          aria-label={confirmLabel}
        >
          <Check className="size-5 stroke-[1.75]" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
