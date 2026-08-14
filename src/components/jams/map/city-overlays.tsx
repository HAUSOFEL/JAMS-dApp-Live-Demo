import { CITY_BUILDINGS, POI_CATEGORIES, type CityPoi } from "@/lib/jams/city-pois"

/**
 * Faux-3D building footprints: each block is an extruded slab drawn with a
 * roof face plus a shaded side wall offset by the storey height.
 */
export function BuildingsLayer({ tinted }: { tinted?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
      {CITY_BUILDINGS.map((b) => {
        const lift = b.storeys * 0.42 // % of canvas height the roof is raised by
        const roofAlpha = tinted ? 0.5 : 0.14 + Math.min(0.24, b.storeys * 0.02)
        return (
          <div key={b.id} className="absolute" style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%` }}>
            {/* Side wall (extrusion body) */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: `${lift}vh`,
                background: tinted
                  ? "linear-gradient(180deg, rgba(60,44,26,0.55), rgba(60,44,26,0.28))"
                  : "linear-gradient(180deg, color-mix(in oklab, var(--foreground) 26%, transparent), color-mix(in oklab, var(--foreground) 12%, transparent))",
                borderLeft: "1px solid color-mix(in oklab, var(--foreground) 22%, transparent)",
                borderRight: "1px solid color-mix(in oklab, var(--foreground) 22%, transparent)",
              }}
            />
            {/* Roof face */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: `${lift}vh`,
                height: `${b.h}vh`,
                background: tinted
                  ? `rgba(232, 222, 200, ${roofAlpha})`
                  : `color-mix(in oklab, var(--foreground) ${Math.round(roofAlpha * 100)}%, transparent)`,
                border: "1px solid color-mix(in oklab, var(--foreground) 30%, transparent)",
                borderRadius: 1,
                boxShadow: "0 1px 0 color-mix(in oklab, var(--foreground) 18%, transparent)",
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

/** Small tappable POI chips (cafes, transit, art spaces, food, parks). */
export function PoiMarker({
  poi,
  zoom,
  active,
  onSelect,
}: {
  poi: CityPoi
  zoom: number
  active: boolean
  onSelect: (poi: CityPoi) => void
}) {
  const meta = POI_CATEGORIES[poi.category]
  return (
    <button
      type="button"
      onClick={() => onSelect(poi)}
      aria-label={`${meta.label}: ${poi.name}`}
      aria-pressed={active}
      className="absolute z-[4] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${poi.x}%`, top: `${poi.y}%`, scale: `${1 / zoom}` }}
    >
      <span
        className={`flex items-center gap-1 rounded-full border px-1.5 py-1 text-[9px] font-bold shadow-sm backdrop-blur transition-colors ${
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-surface/90 text-muted-foreground hover:text-foreground"
        }`}
      >
        <span aria-hidden="true" className="text-[10px] leading-none">
          {meta.glyph}
        </span>
        {zoom >= 1.6 ? <span className="max-w-[110px] truncate">{poi.name}</span> : null}
      </span>
    </button>
  )
}
