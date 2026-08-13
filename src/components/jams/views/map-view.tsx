
import { useState } from "react"
import { useMapMarkers } from "@/lib/jams/data"
import type { MapMarker } from "@/lib/jams/types"
import { useJams } from "../jams-context"
import { PinIcon } from "../icons"

export function MapView() {
  const markers = useMapMarkers()
  const { openStream, navigate, toggleSavedEvent, showToast } = useJams()
  const [selected, setSelected] = useState<MapMarker | null>(markers[0] ?? null)

  return (
    <div className="absolute inset-0 flex flex-col bg-surface">
      {/* Unified interactive map canvas */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          backgroundColor: "#15181c",
          backgroundImage:
            "radial-gradient(#262626 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
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
              className="absolute z-[5] flex -translate-x-1/2 -translate-y-full flex-col items-center"
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
      </div>

      {/* Details card */}
      <div className="shrink-0 border-t border-border bg-surface-2 px-5 pb-6 pt-4">
        <span className="mb-2 inline-block rounded-xl border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground">
          Fact-Verified Location Hub
        </span>
        <h3 className="mb-1 text-base font-bold">{selected?.title ?? "Select a pin"}</h3>
        <p className="mb-3 text-[13px] text-muted-foreground">
          {selected?.description ?? "Tap a marker on the map to see event details."}
        </p>
        {selected ? (
          <div className="flex gap-2.5">
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
            <button
              type="button"
              onClick={() => toggleSavedEvent(selected.id)}
              className="flex-1 rounded-xl bg-secondary py-2.5 text-xs font-bold text-foreground"
            >
              Save Event
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
