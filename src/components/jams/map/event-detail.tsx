import { useState } from "react"
import type { MapMarker } from "@/lib/jams/types"
import { useJams } from "../jams-context"
import { BookmarkIcon, CloseIcon, PinIcon } from "../icons"

type Tab = "overview" | "schedule" | "battles" | "people"
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "schedule", label: "Schedule" },
  { id: "battles", label: "Battles" },
  { id: "people", label: "People" },
]
// Sample event programme shared by all demo events.
const SCHEDULE = [
  { time: "5:00 PM", label: "Doors Open & Open Cypher", state: "done" },
  { time: "6:00 PM", label: "Prelims", state: "live" },
  { time: "7:00 PM", label: "Top 16", state: "next" },
  { time: "8:30 PM", label: "Finals & Awards", state: "next" },
] as const
const PEOPLE = [
  { role: "Host", name: "KWB Crew" },
  { role: "Judges", name: "Aria · Urban · Flex" },
  { role: "DJ", name: "DJ Shadow Cypher" },
  { role: "MC", name: "TO Cypher" },
]

export function EventDetail({
  marker, onClose, onClaim, directionsHref,
}: { marker: MapMarker | null; onClose: () => void; onClaim: (m: MapMarker) => void; directionsHref: string }) {
  const { savedEventIds, toggleSavedEvent, claimedPasses, openBrackets, showToast } = useJams()
  const [tab, setTab] = useState<Tab>("overview")
  if (!marker) return null
  const saved = savedEventIds.includes(marker.id)
  const claimed = claimedPasses.some((p) => p.title === marker.title)
  const workshop = marker.kind === "workshop"

  const share = async () => {
    const text = `${marker.title} · ${marker.time ?? ""}`
    try {
      if (navigator.share) await navigator.share({ title: marker.title, text })
      else { await navigator.clipboard.writeText(text); showToast("Event info copied") }
    } catch { /* user cancelled */ }
  }

  return (
    <div className="absolute inset-0 z-[45] flex flex-col bg-background animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="relative h-44 shrink-0 bg-gradient-primary">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-x-3 top-3 flex justify-between">
          <button type="button" onClick={onClose} aria-label="Close event" className="flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur">
            <CloseIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={share} className="rounded-full bg-background/70 px-3 text-xs font-bold text-foreground backdrop-blur">
            Share
          </button>
        </div>
        <span className={`absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${marker.variant === "live" ? "bg-accent text-accent-foreground" : workshop ? "bg-gold text-gold-foreground" : "bg-primary text-primary-foreground"}`}>
          {marker.variant === "live" ? <span className="h-1.5 w-1.5 rounded-full bg-accent-foreground animate-pulse-live" /> : null}
          {marker.variant === "live" ? "Live now" : workshop ? "Workshop" : "Jam"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <h2 className="mt-2 text-xl font-extrabold text-foreground">{marker.title}</h2>
        <p className="mt-1 text-sm font-semibold text-gold">{marker.time ?? "Schedule TBA"}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <PinIcon className="h-3.5 w-3.5" /> {marker.label} · Kitchener-Waterloo
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <a href={directionsHref} target="_blank" rel="noreferrer" className="rounded-xl bg-secondary py-2.5 text-center text-xs font-bold text-foreground">Directions</a>
          <button type="button" onClick={() => toggleSavedEvent(marker.id)} className={`flex items-center justify-center gap-1 rounded-xl py-2.5 text-xs font-bold ${saved ? "bg-primary/15 text-primary" : "bg-secondary text-foreground"}`}>
            <BookmarkIcon className="h-3.5 w-3.5" /> {saved ? "Saved" : "Save"}
          </button>
          <button type="button" onClick={share} className="rounded-xl bg-secondary py-2.5 text-xs font-bold text-foreground">Share</button>
        </div>

        <div role="tablist" className="sticky top-0 z-10 -mx-4 mt-4 flex gap-1 border-b border-border bg-background px-4">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} type="button" onClick={() => setTab(t.id)}
              className={`flex-1 border-b-2 py-2.5 text-xs font-bold ${tab === t.id ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="pt-4 text-sm">
          {tab === "overview" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-xs font-black text-primary-foreground">
                  {(marker.host ?? "JAMS").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Hosted by</p>
                  <p className="truncate font-bold text-foreground">{marker.host ?? "JAMS Community"} <span className="text-gold">✓</span></p>
                </div>
              </div>
              <p className="text-muted-foreground">{marker.description}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Entry", marker.passType ?? "Free entry"],
                  ["Ages", "All ages"],
                  ["Categories", workshop ? "All levels" : "1v1 · 2v2 · Kids"],
                  ["Going", "42 dancers"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border bg-surface p-2.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</p>
                    <p className="text-xs font-bold text-foreground">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : tab === "schedule" ? (
            <ol className="space-y-2">
              {SCHEDULE.map((s) => (
                <li key={s.label} className={`flex items-center gap-3 rounded-xl border p-3 ${s.state === "live" ? "border-accent bg-accent/10" : "border-border bg-surface"} ${s.state === "done" ? "opacity-50" : ""}`}>
                  <span className="w-16 text-xs font-bold text-gold">{s.time}</span>
                  <span className="flex-1 font-semibold text-foreground">{s.label}</span>
                  {s.state === "live" ? <span className="text-[10px] font-extrabold uppercase text-accent">Now</span> : null}
                </li>
              ))}
            </ol>
          ) : tab === "battles" ? (
            <div className="space-y-3">
              <p className="text-muted-foreground">Follow every round, see who's on deck and who's moving on.</p>
              <button type="button" onClick={openBrackets} className="w-full rounded-xl bg-accent py-3 text-xs font-bold text-accent-foreground">
                Open Live Brackets
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {PEOPLE.map((p) => (
                <li key={p.role} className="flex justify-between rounded-xl border border-border bg-surface p-3">
                  <span className="text-xs text-muted-foreground">{p.role}</span>
                  <span className="text-xs font-bold text-foreground">{p.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-border bg-background/95 p-3 backdrop-blur">
        <button type="button" disabled={claimed} onClick={() => onClaim(marker)}
          className={`w-full rounded-xl py-3 text-sm font-bold ${claimed ? "bg-secondary text-gold" : "bg-primary text-primary-foreground"}`}>
          {claimed ? "You're going ✓ · Ticket in your profile" : workshop ? "Sign Up for Workshop" : "Claim Event Pass"}
        </button>
      </div>
    </div>
  )
}
