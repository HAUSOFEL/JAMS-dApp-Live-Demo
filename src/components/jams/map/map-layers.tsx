export type MapLayerId = "street" | "satellite" | "topo"

export const MAP_LAYERS: { id: MapLayerId; label: string; hint: string }[] = [
  { id: "street", label: "Street", hint: "Standard street grid" },
  { id: "satellite", label: "Satellite", hint: "Aerial imagery" },
  { id: "topo", label: "Terrain 3D", hint: "Topographic mesh + contours" },
]

/** Standard street basemap: block grid + arterial roads + labelled major streets. */
function StreetLayer() {
  const labels = [
    { name: "Cypher Way", x: 18, y: 28, rotate: -12 },
    { name: "Community St", x: 44, y: 50, rotate: 8 },
    { name: "Culture Ave", x: 72, y: 62, rotate: -6 },
  ]

  return (
    <div className="absolute inset-0 bg-surface-2">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(color-mix(in oklab, var(--foreground) 16%, transparent) 1px, transparent 1px)",
            "linear-gradient(color-mix(in oklab, var(--foreground) 10%, transparent) 1px, transparent 1px)",
            "linear-gradient(90deg, color-mix(in oklab, var(--foreground) 10%, transparent) 1px, transparent 1px)",
            "linear-gradient(color-mix(in oklab, var(--foreground) 20%, transparent) 3px, transparent 3px)",
            "linear-gradient(90deg, color-mix(in oklab, var(--foreground) 20%, transparent) 3px, transparent 3px)",
          ].join(", "),
          backgroundSize: "24px 24px, 30px 30px, 30px 30px, 150px 150px, 150px 150px",
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
            fill="#E2E8F0"
            stroke="#0F172A"
            strokeWidth={0.45}
            paintOrder="stroke"
            style={{ fontSize: "2.2px", fontWeight: 700, letterSpacing: "0.04em" }}
          >
            {l.name}
          </text>
        ))}
      </svg>
    </div>
  )
}

/** Simulated aerial imagery: vegetation, water and built-up patches. */
function SatelliteLayer() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: "#2f3a2b",
        backgroundImage: [
          "radial-gradient(120px 90px at 22% 28%, #46583c 0%, transparent 70%)",
          "radial-gradient(160px 120px at 74% 62%, #3d4a36 0%, transparent 72%)",
          "radial-gradient(100px 140px at 55% 88%, #2b3a44 0%, transparent 70%)",
          "radial-gradient(90px 70px at 86% 18%, #55523a 0%, transparent 70%)",
          "linear-gradient(115deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 46px)",
          "linear-gradient(25deg, rgba(0,0,0,0.18) 0 3px, transparent 3px 64px)",
        ].join(", "),
      }}
    />
  )
}

/** 3D topographic terrain: contour rings over a perspective wireframe mesh. */
function TopoLayer() {
  const rings = [
    { cx: 30, cy: 34, rx: 6, ry: 4 },
    { cx: 30, cy: 34, rx: 12, ry: 8 },
    { cx: 30, cy: 34, rx: 19, ry: 13 },
    { cx: 30, cy: 34, rx: 27, ry: 19 },
    { cx: 68, cy: 62, rx: 7, ry: 5 },
    { cx: 68, cy: 62, rx: 14, ry: 10 },
    { cx: 68, cy: 62, rx: 22, ry: 16 },
    { cx: 52, cy: 84, rx: 10, ry: 6 },
    { cx: 52, cy: 84, rx: 18, ry: 11 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: "#efe6d2" }}>
      {/* Perspective wireframe terrain mesh */}
      <div
        className="absolute inset-x-[-30%] bottom-[-10%] top-[20%]"
        style={{
          transform: "perspective(560px) rotateX(58deg)",
          transformOrigin: "50% 100%",
          backgroundImage: [
            "linear-gradient(rgba(120, 86, 48, 0.35) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(120, 86, 48, 0.35) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "36px 36px, 36px 36px",
        }}
      />
      {/* Elevation shading */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(180px 130px at 30% 34%, rgba(176, 122, 58, 0.35) 0%, transparent 72%)",
            "radial-gradient(160px 120px at 68% 62%, rgba(139, 150, 88, 0.32) 0%, transparent 72%)",
            "radial-gradient(150px 100px at 52% 84%, rgba(90, 130, 140, 0.28) 0%, transparent 72%)",
          ].join(", "),
        }}
      />
      {/* Contour lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {rings.map((r, i) => (
          <ellipse
            key={`${r.cx}-${i}`}
            cx={r.cx}
            cy={r.cy}
            rx={r.rx}
            ry={r.ry}
            fill="none"
            stroke="rgba(122, 84, 42, 0.55)"
            strokeWidth={i % 3 === 0 ? 0.5 : 0.28}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  )
}

export function MapBasemap({ layer }: { layer: MapLayerId }) {
  if (layer === "satellite") return <SatelliteLayer />
  if (layer === "topo") return <TopoLayer />
  return <StreetLayer />
}
