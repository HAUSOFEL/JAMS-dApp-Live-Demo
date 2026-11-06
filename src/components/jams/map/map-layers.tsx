export type MapLayerId = "street"

export const MAP_LAYERS: { id: MapLayerId; label: string; hint: string }[] = [
  { id: "street", label: "Street", hint: "Clean 2D vector street map" },
]

const STREET = "#00F0FF"
const BG = "#051329"
const BLOCK = "#0B2244"
const BLOCK_EDGE = "#12305C"
const PARK = "#0E3B33"
const PARK_EDGE = "#1F6B57"
const WATER = "#0A2F5C"
const WATER_EDGE = "#1C5AA8"

/** City blocks laid out between the street network (x, y, w, h in % units). */
const BLOCKS: [number, number, number, number][] = []
const COLS = [0, 9, 20, 31, 43, 54, 66, 77, 89, 100]
const ROWS = [0, 8, 18, 29, 40, 51, 62, 73, 84, 100]
for (let c = 0; c < COLS.length - 1; c++) {
  for (let r = 0; r < ROWS.length - 1; r++) {
    const x = COLS[c]! + 1.2
    const y = ROWS[r]! + 1.2
    const w = COLS[c + 1]! - COLS[c]! - 2.4
    const h = ROWS[r + 1]! - ROWS[r]! - 2.4
    BLOCKS.push([x, y, w, h])
    // split some blocks into smaller lots for texture
    if ((c + r) % 3 === 0 && w > 6) BLOCKS.push([x + w / 2 - 0.3, y, 0.6, h])
  }
}

const PARKS = [
  { name: "Waterloo Park", d: "M8 10 L30 9 L32 24 L22 30 L9 27 Z", lx: 19, ly: 18 },
  { name: "Victoria Park", d: "M56 74 L74 72 L80 86 L66 94 L54 88 Z", lx: 66, ly: 83 },
  { name: "Cypher Commons", d: "M80 20 L94 22 L93 34 L81 33 Z", lx: 87, ly: 27 },
]

const STREETS_MAJOR = [
  { d: "M0 40 C 25 37, 60 44, 100 40", name: "King St", lx: 82, ly: 40.2 },
  { d: "M43 0 C 41 30, 46 60, 43 100", name: "Cypher Way", lx: 43.6, ly: 12, vertical: true },
  { d: "M0 92 L 100 58", name: "Culture Ave", lx: 26, ly: 83.3, rot: -18.8 },
]

const STREETS_MINOR = [
  ...COLS.slice(1, -1).map((x) => `M${x} 0 L${x} 100`),
  ...ROWS.slice(1, -1).map((y) => `M0 ${y} L100 ${y}`),
]

const MINOR_LABELS = [
  { name: "Community St", x: 60, y: 51.2 },
  { name: "Breaker Ln", x: 15, y: 62.2 },
  { name: "Popping Pl", x: 72, y: 18.2 },
  { name: "Freeze Rd", x: 28, y: 73.2 },
]

const DISTRICTS = [
  { name: "UPTOWN", x: 24, y: 34 },
  { name: "MIDTOWN", x: 60, y: 31 },
  { name: "DOWNTOWN", x: 78, y: 67 },
  { name: "ARTS DISTRICT", x: 18, y: 50 },
]

/** Rich 2D vector basemap: blocks, parks, river, layered streets and labels. */
function StreetLayer() {
  return (
    <div className="absolute inset-0 bg-surface-2">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <radialGradient id="map-vignette" cx="50%" cy="45%" r="70%">
            <stop offset="60%" stopColor={BG} stopOpacity="0" />
            <stop offset="100%" stopColor={BG} stopOpacity="0.85" />
          </radialGradient>
          <pattern id="park-trees" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.35" fill={PARK_EDGE} opacity="0.7" />
          </pattern>
        </defs>

        <rect width="100" height="100" fill={BG} />

        {/* City blocks */}
        {BLOCKS.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx={0.6} fill={BLOCK} stroke={BLOCK_EDGE} strokeWidth={0.15} />
        ))}

        {/* River */}
        <path
          d="M-2 58 C 12 52, 20 66, 34 60 S 52 48, 64 54 S 86 70, 102 62 L102 68 C 86 76, 72 60, 62 61 S 44 56, 34 66 S 12 60, -2 65 Z"
          fill={WATER}
          stroke={WATER_EDGE}
          strokeWidth={0.25}
        />
        <text x={8} y={61.5} fill={WATER_EDGE} style={{ fontSize: "1.6px", fontStyle: "italic", fontWeight: 700, letterSpacing: "0.2em" }}>
          GRAND RIVER
        </text>

        {/* Parks */}
        {PARKS.map((p) => (
          <g key={p.name}>
            <path d={p.d} fill={PARK} stroke={PARK_EDGE} strokeWidth={0.3} />
            <path d={p.d} fill="url(#park-trees)" />
            <text x={p.lx} y={p.ly} textAnchor="middle" fill="#6EE7B7" stroke={BG} strokeWidth={0.35} paintOrder="stroke" style={{ fontSize: "1.7px", fontWeight: 800 }}>
              🌳 {p.name}
            </text>
          </g>
        ))}

        {/* Minor streets */}
        {STREETS_MINOR.map((d) => (
          <path key={d} d={d} stroke={STREET} strokeOpacity={0.18} strokeWidth={0.35} fill="none" />
        ))}

        {/* Major streets: glow + casing + core */}
        {STREETS_MAJOR.map((s) => (
          <g key={s.name}>
            <path d={s.d} stroke={STREET} strokeOpacity={0.15} strokeWidth={3} fill="none" />
            <path d={s.d} stroke={BG} strokeWidth={1.6} fill="none" />
            <path d={s.d} stroke={STREET} strokeOpacity={0.85} strokeWidth={0.9} fill="none" />
            <path d={s.d} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={0.2} strokeDasharray="1.5 1.5" fill="none" />
          </g>
        ))}

        {/* Bridges across the river */}
        {[20, 43, 77].map((x) => (
          <rect key={x} x={x - 1.2} y={56} width={2.4} height={10} fill={BLOCK_EDGE} stroke={STREET} strokeOpacity={0.5} strokeWidth={0.15} />
        ))}

        {/* District labels */}
        {DISTRICTS.map((d) => (
          <text key={d.name} x={d.x} y={d.y} textAnchor="middle" fill="#8CA3C7" fillOpacity={0.45} style={{ fontSize: "2.4px", fontWeight: 900, letterSpacing: "0.4em" }}>
            {d.name}
          </text>
        ))}

        {/* Major street labels */}
        {STREETS_MAJOR.map((s) => (
          <text
            key={s.name}
            x={s.lx}
            y={s.ly}
            transform={s.vertical ? `rotate(90, ${s.lx}, ${s.ly})` : s.rot ? `rotate(${s.rot}, ${s.lx}, ${s.ly})` : undefined}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#E2F9FF"
            stroke={BG}
            strokeWidth={0.5}
            paintOrder="stroke"
            style={{ fontSize: "1.8px", fontWeight: 800, letterSpacing: "0.08em" }}
          >
            {s.name}
          </text>
        ))}

        {/* Minor street labels */}
        {MINOR_LABELS.map((l) => (
          <text key={l.name} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" fill={STREET} fillOpacity={0.75} stroke={BG} strokeWidth={0.35} paintOrder="stroke" style={{ fontSize: "1.3px", fontWeight: 700 }}>
            {l.name}
          </text>
        ))}

        <rect width="100" height="100" fill="url(#map-vignette)" pointerEvents="none" />
      </svg>
    </div>
  )
}

export function MapBasemap(_props: { layer?: MapLayerId }) {
  return <StreetLayer />
}
