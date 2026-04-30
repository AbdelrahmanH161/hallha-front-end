"use client"

export function StatsTicker({ items }: { items: string[] }) {
  // Duplicate for seamless loop
  const doubled = [...items, ...items]

  return (
    <div className="flex overflow-hidden py-4 select-none">
      <div className="animate-ticker flex gap-12 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2.5 text-sm font-semibold text-foreground/70"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
