import { useCallback, useEffect, useRef, useState } from "react"
import { useMapMarkers } from "@/lib/jams/data"
import type { MapMarker } from "@/lib/jams/types"
import { CITY_POIS, POI_CATEGORIES, type CityPoi } from "@/lib/jams/city-pois"
import { useJams } from "../jams-context"
import { PinIcon, CloseIcon, BookmarkIcon, PlusIcon } from "../icons"
import { MapBasemap, MAP_LAYERS, type MapLayerId } from "../map/map-layers"
import { BuildingsLayer, PoiMarker } from "../map/city-overlays"


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
  const [showBuildings, setShowBuildings] = useState(true)
  const [showPois, setShowPois] = useState(true)
  const [layer, setLayer] = useState<MapLayerId>("street")
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

          {showBuildings ? <BuildingsLayer tinted={layer === "topo"} /> : null}

          {showPois
            ? CITY_POIS.map((poi) => (
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

          {markers.map((marker) => {
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
                <span
                  className={`flex items-center gap-1.5 rounded-full border-2 border-foreground/70 px-3 py-2 text-[11px] font-extrabold shadow-lg ${
                    marker.variant === "live" ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
                  } ${active ? "ring-2 ring-primary/60" : ""}`}
                >
                  <PinIcon className="h-3.5 w-3.5" />
                  {marker.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Layer control */}
        <div className="absolute left-4 top-4 z-[12] rounded-2xl border border-border bg-surface/95 p-1.5 shadow-lg backdrop-blur">
          <p className="px-1.5 pb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Layers</p>
          <div className="flex flex-col gap-1" role="group" aria-label="Map layers">
            {MAP_LAYERS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setLayer(l.id)
                  showToast(`${l.label} layer: ${l.hint}`)
                }}
                aria-pressed={layer === l.id}
                title={l.hint}
                className={`rounded-xl px-2.5 py-1.5 text-left text-[11px] font-bold transition-colors ${
                  layer === l.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="mt-1.5 border-t border-border pt-1.5">
            <p className="px-1.5 pb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Overlays
            </p>
            <div className="flex flex-col gap-1">
              {[
                { id: "buildings", label: "3D Buildings", on: showBuildings, set: setShowBuildings },
                { id: "pois", label: "Nearby POIs", on: showPois, set: setShowPois },
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => o.set(!o.on)}
                  aria-pressed={o.on}
                  className={`rounded-xl px-2.5 py-1.5 text-left text-[11px] font-bold transition-colors ${
                    o.on ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Zoom control */}
        <div className="absolute right-4 top-4 z-[12] flex flex-col gap-1 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-lg backdrop-blur">
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

        {/* Terrain legend (topo layer only) */}
        {layer === "topo" ? (
          <div className="absolute right-4 top-[136px] z-[12] rounded-2xl border border-border bg-surface/95 p-2.5 shadow-lg backdrop-blur">
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Elevation</p>
            <div className="h-1.5 w-24 rounded-full" style={{ background: "linear-gradient(90deg,#5a828c,#8b9658,#b07a3a)" }} />
            <div className="mt-1 flex justify-between text-[9px] font-semibold text-muted-foreground">
              <span>240m</span>
              <span>410m</span>
            </div>
            <p className="mt-1.5 text-[9px] text-muted-foreground">Contours · 20m interval</p>
          </div>
        ) : null}

        {/* Event details card overlay */}
        {selected ? (
          <div className="fixed bottom-20 left-3 right-3 z-40 mx-auto w-[calc(100%-24px)] max-w-[380px]">
            <div className="max-h-[40vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl">
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
                  <span className="inline-block rounded-xl border border-white/10 px-2 py-1 text-[10px] font-semibold text-muted-foreground">
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
              <p className="mb-3 text-[13px] text-muted-foreground">{selected.description}</p>

              <div className="flex gap-2.5 pb-1">
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
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground"
                >
                  {selected.linkedStreamId ? "Tune In Live" : "Join Chat"}
                </button>
              </div>
            </div>
          </div>
        ) : selectedPoi ? (
          <div className="fixed bottom-20 left-3 right-3 z-40 mx-auto w-[calc(100%-24px)] max-w-[380px]">
            <div className="max-h-[40vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl">
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
              <p className="text-[13px] text-muted-foreground">{selectedPoi.detail}</p>
            </div>
          </div>
        ) : (
          <div className="fixed bottom-20 left-3 right-3 z-40 mx-auto w-[calc(100%-24px)] max-w-[380px]">
            <p className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-center text-[12px] text-muted-foreground backdrop-blur-xl">
              Tap a pin or place for details · scroll to zoom · drag to pan
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
