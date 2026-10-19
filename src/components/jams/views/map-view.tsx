import { useCallback, useEffect, useRef, useState } from "react"
import { useMapMarkers } from "@/lib/jams/data"
import type { MapMarker } from "@/lib/jams/types"
import { CITY_POIS, POI_CATEGORIES, type CityPoi, type PoiCategory } from "@/lib/jams/city-pois"
import { useJams } from "../jams-context"
import { PinIcon, CloseIcon, BookmarkIcon, PlusIcon } from "../icons"
import { MapBasemap, type MapLayerId } from "../map/map-layers"
import { PoiMarker } from "../map/city-overlays"
import { EventPassClaim } from "../map/event-pass-claim"
import { EventDetail } from "../map/event-detail"


type FilterId = "all" | "live" | "event" | "workshop" | "food" | "cafe" | "transit" | "park" | "art"
const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "🔴 Live" },
  { id: "event", label: "Jams" },
  { id: "workshop", label: "Workshops" },
  { id: "food", label: "🍜 Food" },
  { id: "cafe", label: "☕ Cafes" },
  { id: "transit", label: "🚊 Transit" },
  { id: "park", label: "🌳 Parks" },
  { id: "art", label: "🎨 Art" },
]
const POI_FILTER: Partial<Record<FilterId, PoiCategory>> = {
  food: "food", cafe: "cafe", transit: "transit", park: "park", art: "art",
}
const ZONES = [
  { name: "Uptown Main Stage", x: 30, y: 32, r: 30, cls: "border-accent/60 bg-accent/10" },
  { name: "Midtown Cypher", x: 50, y: 50, r: 22, cls: "border-primary/60 bg-primary/10" },
  { name: "Downtown Workshops", x: 68, y: 64, r: 30, cls: "border-gold/60 bg-gold/10" },
]
const directionsUrl = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${q}, Kitchener-Waterloo, ON`)}`

const MIN_ZOOM = 1
const MAX_ZOOM = 5

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Keep the basemap covering the viewport so panning never reveals empty gutters. */
function clampOffset(o: { x: number; y: number }, z: number, el: HTMLElement | null) {
  if (!el) return o
  const { width, height } = el.getBoundingClientRect()
  return {
    x: clamp(o.x, width * (1 - z), 0),
    y: clamp(o.y, height * (1 - z), 0),
  }
}

export function MapView() {
  const markers = useMapMarkers()
  const { openStream, navigate, toggleSavedEvent, savedEventIds, showToast } = useJams()
  const [selected, setSelected] = useState<MapMarker | null>(null)
  const [selectedPoi, setSelectedPoi] = useState<CityPoi | null>(null)
  const [claimMarker, setClaimMarker] = useState<MapMarker | null>(null)
  const [detailMarker, setDetailMarker] = useState<MapMarker | null>(null)
  const [filter, setFilter] = useState<FilterId>("all")
  const [layer] = useState<MapLayerId>("street")
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ id: number; x: number; y: number } | null>(null)
  const saved = selected ? savedEventIds.includes(selected.id) : false

  const zoomAt = useCallback((nextZoomRaw: number, px: number, py: number) => {
    setZoom((z) => {
      const next = clamp(nextZoomRaw, MIN_ZOOM, MAX_ZOOM)
      const k = next / z
      setOffset((o) => clampOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k }, next, containerRef.current))
      return next
    })
  }, [])

  // Native non-passive wheel listener: React's onWheel is passive.
  const wheelRef = useRef<(e: WheelEvent) => void>(() => {})
  wheelRef.current = (e: WheelEvent) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1)
    setZoom((z) => {
      const next = clamp(z * Math.exp(-dy * 0.0018), MIN_ZOOM, MAX_ZOOM)
      const k = next / z
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      setOffset((o) => clampOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k }, next, containerRef.current))
      return next
    })
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      wheelRef.current(e)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const zoomByButton = (factor: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    zoomAt(zoom * factor, rect.width / 2, rect.height / 2)
  }

  const poiFilter = POI_FILTER[filter] ?? (["all"].includes(filter) ? null : "none")
  const showPois = filter === "all" || POI_FILTER[filter] !== undefined
  const visibleMarkers = markers.filter((m) =>
    filter === "all" ? true : filter === "live" ? m.variant === "live" : filter === "event" ? m.kind !== "workshop" : filter === "workshop" ? m.kind === "workshop" : false,
  )

  const focusMarker = (m: MapMarker) => {
    setSelectedPoi(null)
    setSelected(m)
    const el = containerRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const z = Math.max(zoom, 2)
    setZoom(z)
    setOffset(clampOffset({ x: width / 2 - (m.x / 100) * width * z, y: height * 0.4 - (m.y / 100) * height * z }, z, el))
  }

  const resetView = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-surface">
      {/* Unified interactive map canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 touch-none overflow-hidden bg-surface-2"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return
          dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          const d = dragRef.current
          if (!d || d.id !== e.pointerId) return
          const dx = e.clientX - d.x
          const dy = e.clientY - d.y
          dragRef.current = { id: d.id, x: e.clientX, y: e.clientY }
          setOffset((o) => clampOffset({ x: o.x + dx, y: o.y + dy }, zoom, containerRef.current))
        }}
        onPointerUp={() => {
          dragRef.current = null
        }}
        onPointerCancel={() => {
          dragRef.current = null
        }}
      >
        {/* Transformed map surface (basemap + markers share one coordinate space) */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          <MapBasemap layer={layer} />

          {ZONES.map((z) => (
            <div
              key={z.name}
              aria-hidden="true"
              className={`pointer-events-none absolute z-[2] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed ${z.cls}`}
              style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.r}%`, aspectRatio: "1" }}
            >
              <span
                className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-background/80 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest text-foreground"
                style={{ scale: `${1 / zoom}` }}
              >
                {z.name}
              </span>
            </div>
          ))}


          {showPois
            ? CITY_POIS.filter((p) => poiFilter === null || p.category === poiFilter).map((poi) => (
                <PoiMarker
                  key={poi.id}
                  poi={poi}
                  zoom={zoom}
                  active={selectedPoi?.id === poi.id}
                  onSelect={(p) => {
                    setSelected(null)
                    setSelectedPoi(p)
                  }}
                />
              ))
            : null}

          {visibleMarkers.map((marker) => {
            const active = selected?.id === marker.id
            return (
              <button
                key={marker.id}
                type="button"
                onClick={() => {
                  setSelectedPoi(null)
                  setSelected(marker)
                }}

                className="absolute z-[5] flex -translate-x-1/2 -translate-y-full flex-col items-center transition-transform active:scale-95"
                style={{
                  top: `${marker.y}%`,
                  left: `${marker.x}%`,
                  // keep pin chrome at a readable size regardless of zoom
                  scale: `${1 / zoom}`,
                }}
                aria-label={marker.title}
                aria-pressed={active}
              >
                {marker.variant === "live" ? (
                  <span aria-hidden="true" className="absolute -inset-1 animate-ping rounded-full bg-accent/40" />
                ) : null}
                <span
                  className={`relative flex items-center gap-1.5 rounded-full border-2 px-3 py-2 text-[11px] font-extrabold shadow-lg ${
                    marker.variant === "live"
                      ? "border-foreground bg-accent text-accent-foreground shadow-glow-accent"
                      : marker.kind === "workshop"
                        ? "border-background bg-gold text-gold-foreground"
                        : "border-foreground/70 bg-primary text-primary-foreground"
                  } ${active ? "ring-4 ring-foreground/40" : ""}`}
                >
                  {marker.variant === "live" ? <span className="text-[9px]">LIVE</span> : null}
                  <PinIcon className="h-3.5 w-3.5" />
                  {marker.label}
                </span>
                <span aria-hidden="true" className="h-2 w-0.5 bg-foreground/70" />
              </button>
            )
          })}
        </div>

        {/* Filter chips */}
        <div className="absolute inset-x-0 top-3 z-[12] flex gap-1.5 overflow-x-auto px-3 pr-16 [scrollbar-width:none]" role="group" aria-label="Map filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold shadow-lg backdrop-blur transition-colors ${
                filter === f.id
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface/95 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Zoom control */}
        <div className="absolute right-3 top-14 z-[12] flex flex-col gap-1 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={() => zoomByButton(1.4)}
            aria-label="Zoom in"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-accent"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => zoomByButton(1 / 1.4)}
            aria-label="Zoom out"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-lg font-bold leading-none text-foreground transition-colors hover:bg-accent"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetView}
            aria-label="Reset map view"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-[9px] font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {Math.round(zoom * 100)}
          </button>
        </div>


        {/* Event details card overlay */}
        {selected ? (
          <div className="absolute inset-x-3 bottom-[88px] z-[36] mx-auto max-w-[360px] pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="max-h-[min(48vh,420px)] overflow-y-auto rounded-2xl border border-border bg-surface/95 p-3 shadow-2xl backdrop-blur-xl">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-[10px] font-bold ${
                      selected.variant === "live"
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {selected.variant === "live" ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-live" />
                    ) : null}
                    {selected.time ?? "Schedule TBA"}
                  </span>
                  <span className="inline-block rounded-xl border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                    Fact-Verified Location Hub
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close event details"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <h3 className="mb-1 text-base font-bold text-foreground">{selected.title}</h3>
              <p className="mb-2 text-[13px] text-muted-foreground">{selected.description}</p>
              <button
                type="button"
                onClick={() => setDetailMarker(selected)}
                className="mb-3 text-xs font-bold text-gold underline-offset-2 hover:underline"
              >
                View full event details →
              </button>

              <div className="flex flex-col gap-2 pb-1">
                <button
                  type="button"
                  onClick={() => setClaimMarker(selected)}
                  className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground"
                >
                  {selected.kind === "workshop" ? "Sign Up for Workshop" : "Claim Event Pass"}
                </button>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleSavedEvent(selected.id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-colors ${
                      saved ? "bg-primary/15 text-primary" : "bg-secondary text-foreground"
                    }`}
                  >
                    <BookmarkIcon className="h-3.5 w-3.5" />
                    {saved ? "Saved" : "Save Event"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selected.linkedStreamId) {
                        openStream(selected.linkedStreamId)
                      } else {
                        navigate("chat")
                        showToast("Opened event chat")
                      }
                    }}
                    className="flex-1 rounded-xl bg-secondary py-2.5 text-xs font-bold text-foreground"
                  >
                    {selected.linkedStreamId ? "Tune In Live" : "Join Chat"}
                  </button>
                  <a
                    href={directionsUrl(selected.title)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center rounded-xl bg-secondary py-2.5 text-xs font-bold text-foreground"
                  >
                    Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : selectedPoi ? (
          <div className="absolute inset-x-3 bottom-[88px] z-[36] mx-auto max-w-[360px] pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="max-h-[min(48vh,420px)] overflow-y-auto rounded-2xl border border-border bg-surface/95 p-3 shadow-2xl backdrop-blur-xl">
              <div className="mb-2 flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-2 py-1 text-[10px] font-bold text-muted-foreground">
                  <span aria-hidden="true">{POI_CATEGORIES[selectedPoi.category].glyph}</span>
                  {POI_CATEGORIES[selectedPoi.category].label}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPoi(null)}
                  aria-label="Close place details"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-base font-bold text-foreground">{selectedPoi.name}</h3>
              <p className="mb-1 text-[11px] font-semibold text-primary">{selectedPoi.area}</p>
              <p className="mb-3 text-[13px] text-muted-foreground">{selectedPoi.detail}</p>
              <a
                href={directionsUrl(`${selectedPoi.name} ${selectedPoi.area}`)}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-xl bg-secondary py-2.5 text-center text-xs font-bold text-foreground"
              >
                Get Directions
              </a>
            </div>
          </div>
        ) : visibleMarkers.length ? (
          <div className="absolute inset-x-0 bottom-[88px] z-[12] flex snap-x gap-2 overflow-x-auto px-3 [scrollbar-width:none]">
            {visibleMarkers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => focusMarker(m)}
                className="w-[230px] shrink-0 snap-start rounded-2xl border border-border bg-surface/95 p-3 text-left shadow-lg backdrop-blur transition-colors hover:border-accent"
              >
                <span
                  className={`mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${
                    m.variant === "live"
                      ? "bg-accent text-accent-foreground"
                      : m.kind === "workshop"
                        ? "bg-gold text-gold-foreground"
                        : "bg-primary text-primary-foreground"
                  }`}
                >
                  {m.variant === "live" ? "Live now" : m.kind === "workshop" ? "Workshop" : "Event"}
                </span>
                <p className="truncate text-sm font-bold text-foreground">{m.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">{m.time ?? "Schedule TBA"}</p>
              </button>
            ))}
          </div>
        ) : null}

        <EventDetail
          marker={detailMarker}
          onClose={() => setDetailMarker(null)}
          onClaim={setClaimMarker}
          directionsHref={detailMarker ? directionsUrl(detailMarker.title) : "#"}
        />

        <EventPassClaim
          marker={claimMarker}
          onClose={() => setClaimMarker(null)}
          onToast={showToast}
        />
      </div>
    </div>
  )
}
