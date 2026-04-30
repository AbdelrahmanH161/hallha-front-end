import { cn } from "@/lib/utils"

export function HalimAvatar({
  size = 32,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.44) }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-serif text-primary-foreground shadow-[0_2px_8px_rgba(6,78,59,0.30)]",
        "bg-[linear-gradient(135deg,#064e3b_0%,#0f766e_55%,#d4af37_100%)]",
        className
      )}
    >
      ح
    </div>
  )
}
