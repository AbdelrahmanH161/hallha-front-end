import Image from "next/image"

import { cn } from "@/lib/utils"

export function HalimAvatar({
  size = 32,
  className,
}: {
  size?: number
  className?: string
}) {
  const px = Math.round(size)

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-transparent",
        className
      )}
      style={{ width: px, height: px }}
      aria-hidden
    >
      <Image
        src="/logo.png"
        alt=""
        width={px}
        height={px}
        className="size-full object-contain"
        sizes={`${px}px`}
      />
    </div>
  )
}
