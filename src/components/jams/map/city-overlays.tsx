import { POI_CATEGORIES, type CityPoi } from "@/lib/jams/city-pois"

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
