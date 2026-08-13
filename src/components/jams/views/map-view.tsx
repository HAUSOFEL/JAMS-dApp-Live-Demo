import { useState } from "react"
import { useMapMarkers } from "@/lib/jams/data"
import type { MapMarker } from "@/lib/jams/types"
import { useJams } from "../jams-context"
import { PinIcon, CloseIcon, BookmarkIcon } from "../icons"

export function MapView() {
  const markers = useMapMarkers()
  const { openStream, navigate, toggleSavedEvent, savedEventIds, showToast } = useJams()
  const [selected, setSelected] = useState<MapMarker | null>(null)
  const saved = selected ? savedEventIds.includes(selected.id) : false

  return (
    <div className="absolute inset-0 flex flex-col bg-surface">
      {/* Unified interactive map canvas */}
      <div
        className="relative flex-1 overflow-hidden bg-surface-2"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--foreground) 18%, transparent) 1px, transparent 1px), linear-gradient(color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 30px 30px, 30px 30px",
        }}
      >
        {markers.map((marker) => {
          const active = selected?.id === marker.id
          return (
            <button
              key={marker.id}
              type="button"
              onClick={() => setSelected(marker)}
              className="absolute z-[5] flex -translate-x-1/2 -translate-y-full flex-col items-center transition-transform active:scale-95"
              style={{ top: `${marker.y}%`, left: `${marker.x}%` }}
              aria-label={marker.title}
              aria-pressed={active}
            >
              <span
                className={`flex items-center gap-1.5 rounded-full border-2 border-black px-3 py-2 text-[11px] font-extrabold shadow-lg ${
                  marker.variant === "live" ? "bg-primary text-primary-foreground" : "bg-[#3b82f6] text-white"
                } ${active ? "ring-2 ring-white/70" : ""}`}
              >
                <PinIcon className="h-3.5 w-3.5" />
                {marker.label}
              </span>
            </button>
          )
        })}

        {/* Event details card overlay */}
        {selected ? (
          <div className="absolute inset-x-0 bottom-0 z-[10] p-4">
            <div className="animate-fade-in rounded-2xl border border-border bg-surface-2/95 p-4 shadow-2xl backdrop-blur">
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
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <h3 className="mb-1 text-base font-bold">{selected.title}</h3>
              <p className="mb-3 text-[13px] text-muted-foreground">{selected.description}</p>

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
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground"
                >
                  {selected.linkedStreamId ? "Tune In Live" : "Join Chat"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-0 z-[10] p-4">
            <p className="rounded-2xl border border-border bg-surface-2/80 px-4 py-3 text-center text-[12px] text-muted-foreground backdrop-blur">
              Tap a pin to see event details.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
