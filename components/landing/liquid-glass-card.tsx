"use client"

import { useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface LiquidGlassCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  tilt?: boolean
  goldBorder?: boolean
  strong?: boolean
}

export function LiquidGlassCard({
  children,
  className,
  style,
  tilt = false,
  goldBorder = false,
  strong = false,
}: LiquidGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const cx = rect.width / 2
      const cy = rect.height / 2
      const rotateX = ((y - cy) / cy) * -8
      const rotateY = ((x - cx) / cx) * 8
      cardRef.current.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`
    },
    [tilt]
  )

  const handleMouseLeave = useCallback(() => {
    if (!tilt || !cardRef.current) return
    cardRef.current.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
  }, [tilt])

  return (
    <div
      ref={cardRef}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "rounded-2xl transition-transform duration-200 ease-out",
        strong ? "glass-strong" : "glass",
        goldBorder && "glass-gold-border",
        className
      )}
    >
      {children}
    </div>
  )
}
