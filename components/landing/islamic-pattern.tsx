export function IslamicPattern({
  opacity = 0.06,
  className = "",
}: {
  opacity?: number
  className?: string
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {/* Repeated SVG star tessellation */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity }}
      >
        <defs>
          <pattern
            id="islamic-star"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* 8-pointed star */}
            <g fill="currentColor" fillRule="evenodd">
              <polygon
                points="40,4 46,18 60,10 54,24 70,24 58,34 64,48 50,42 50,58 40,48 30,58 30,42 16,48 22,34 10,24 26,24 20,10 34,18"
                fillOpacity="0.6"
              />
              {/* Corner quarters */}
              <polygon
                points="0,0 8,0 8,8 0,8"
                fillOpacity="0.25"
              />
              <polygon
                points="80,0 72,0 72,8 80,8"
                fillOpacity="0.25"
              />
              <polygon
                points="0,80 8,80 8,72 0,72"
                fillOpacity="0.25"
              />
              <polygon
                points="80,80 72,80 72,72 80,72"
                fillOpacity="0.25"
              />
              {/* Connecting lines */}
              <path
                d="M0,40 L10,40 M70,40 L80,40 M40,0 L40,10 M40,70 L40,80"
                stroke="currentColor"
                strokeWidth="1"
                strokeOpacity="0.4"
                fill="none"
              />
            </g>
          </pattern>

          {/* Large medallion at center-ish */}
          <pattern
            id="islamic-medallion"
            x="0"
            y="0"
            width="320"
            height="320"
            patternUnits="userSpaceOnUse"
          >
            <g
              transform="translate(160,160)"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.35"
            >
              {/* 12-fold symmetry lines */}
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1="-130"
                  x2="0"
                  y2="130"
                  strokeWidth="0.75"
                  transform={`rotate(${i * 30})`}
                />
              ))}
              <circle r="130" strokeWidth="0.75" strokeOpacity="0.2" />
              <circle r="90" strokeWidth="0.75" strokeOpacity="0.25" />
              <circle r="50" strokeWidth="0.75" strokeOpacity="0.3" />
              <circle r="20" strokeWidth="1" strokeOpacity="0.35" />

              {/* 12-pointed star petals */}
              {Array.from({ length: 12 }).map((_, i) => (
                <ellipse
                  key={i}
                  cx="0"
                  cy="-75"
                  rx="12"
                  ry="45"
                  strokeWidth="0.75"
                  transform={`rotate(${i * 30})`}
                  fillOpacity="0.08"
                  fill="currentColor"
                />
              ))}
            </g>
          </pattern>
        </defs>

        {/* Base tile pattern */}
        <rect
          width="100%"
          height="100%"
          fill="url(#islamic-star)"
          className="text-primary"
        />

        {/* Large medallion overlay */}
        <rect
          width="100%"
          height="100%"
          fill="url(#islamic-medallion)"
          className="text-primary"
          opacity="0.5"
        />
      </svg>
    </div>
  )
}
