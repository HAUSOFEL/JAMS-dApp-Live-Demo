export type MapLayerId = "street"

export const MAP_LAYERS: { id: MapLayerId; label: string; hint: string }[] = [
  { id: "street", label: "Street", hint: "Clean 2D vector street map" },
]

const STREET = "#00F0FF"

/** Clean 2D vector street basemap: high-contrast grid, arterials and street labels. */
function StreetLayer() {
  const labels = [
    { name: "Cypher Way", x: 18, y: 28, rotate: -12 },
    { name: "Community St", x: 44, y: 50, rotate: 8 },
    { name: "Culture Ave", x: 72, y: 62, rotate: -6 },
  ]

  return (
    <div className="absolute inset-0 bg-surface-2">
      {/* Local street grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "linear-gradient(rgba(0, 240, 255, 0.22) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(0, 240, 255, 0.22) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "30px 30px, 30px 30px",
        }}
      />
      {/* Arterial roads */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "linear-gradient(rgba(255, 255, 255, 0.55) 3px, transparent 3px)",
            "linear-gradient(90deg, rgba(255, 255, 255, 0.55) 3px, transparent 3px)",
          ].join(", "),
          backgroundSize: "150px 150px, 150px 150px",
        }}
      />
      {/* Major street labels */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {labels.map((l) => (
          <text
            key={l.name}
            x={l.x}
            y={l.y}
            transform={`rotate(${l.rotate}, ${l.x}, ${l.y})`}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={STREET}
            stroke="#051329"
            strokeWidth={0.5}
            paintOrder="stroke"
            style={{ fontSize: "2.2px", fontWeight: 800, letterSpacing: "0.06em" }}
          >
            {l.name}
          </text>
        ))}
      </svg>
    </div>
  )
}

export function MapBasemap(_props: { layer?: MapLayerId }) {
  return <StreetLayer />
}
