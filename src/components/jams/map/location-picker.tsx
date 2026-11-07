import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { CloseIcon } from "../icons"
import {
  CITY_HUBS,
  approximateHubFromTimeZone,
  getHub,
  nearestHub,
  nearestJamHub,
  parseSavedLocation,
  type UserLocation,
} from "@/lib/jams/location"

const STORAGE_KEY = "jams.userLocation"

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setLocation(parseSavedLocation(JSON.parse(raw)))
    } catch {}
    setReady(true)
  }, [])

  const save = (loc: UserLocation) => {
    const safe = parseSavedLocation(loc)
    if (!safe) return
    setLocation(safe)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
    } catch {}
  }
  return { location, ready, save }
}

export function LocationPill({ location, onClick }: { location: UserLocation | null; onClick: () => void }) {
  const hub = location ? getHub(location.hubId) : null
  return (
    <Button
      variant="outline"
      type="button"
      onClick={onClick}
      className="h-auto max-w-full whitespace-normal rounded-full border-border bg-surface/95 px-3 py-1.5 text-left text-[11px] font-bold text-foreground shadow-lg backdrop-blur hover:border-accent"
    >
      <span aria-hidden="true">📍</span>
      {hub ? `${hub.city}${hub.region ? `, ${hub.region}` : ""}` : "Set your location"}
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {location?.accuracy === "precise" ? "GPS" : location?.accuracy === "approximate" ? "Approx" : "Change"}
      </span>
    </Button>
  )
}

export function NoJamsBanner({ location, onPropose }: { location: UserLocation; onPropose: () => void }) {
  const hub = getHub(location.hubId)
  if (hub.hasJams) return null
  const near = nearestJamHub(hub)
  return (
    <div className="rounded-2xl border border-gold/50 bg-surface/95 p-3 text-[11px] shadow-lg backdrop-blur">
      <p className="font-extrabold text-foreground">No sample jams in {hub.city} yet</p>
      <p className="mt-0.5 text-muted-foreground">
        Showing samples from {near.hub.city}, about {near.km.toLocaleString()} km away. Local event listings aren't connected yet.
      </p>
      <Button
        type="button"
        onClick={onPropose}
        className="mt-2 h-auto whitespace-normal rounded-full bg-gradient-primary px-3 py-1.5 text-[11px] font-extrabold text-primary-foreground"
      >
        Start the first jam in {hub.city}
      </Button>
    </div>
  )
}

export function LocationSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (loc: UserLocation) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const dialogRef = useRef<HTMLDivElement>(null)
  const request = useRef(0)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!open) return
    setBusy(false)
    setError(null)
    setQuery("")
    const previous = document.activeElement
    dialogRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current()
      if (event.key !== "Tab") return
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input")
      const first = controls?.[0]
      const last = controls?.[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      request.current += 1
      document.removeEventListener("keydown", onKey)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [open])
  if (!open) return null

  const usePrecise = () => {
    setError(null)
    if (!("geolocation" in navigator)) {
      setError("Your device doesn't support location. Try approximate or pick a city.")
      return
    }
    setBusy(true)
    const currentRequest = ++request.current
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (request.current !== currentRequest) return
        setBusy(false)
        const { latitude: lat, longitude: lng } = pos.coords
        onSave({ hubId: nearestHub(lat, lng).id, accuracy: "precise" })
      },
      () => {
        if (request.current !== currentRequest) return
        setBusy(false)
        setError("Location was blocked. Try approximate or pick a city below.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  const useApprox = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const hub = approximateHubFromTimeZone(tz)
    if (!hub) {
      setError("We couldn't suggest a city for your time zone. Pick a city below.")
      return
    }
    onSave({ hubId: hub.id, accuracy: "approximate" })
  }

  const cities = CITY_HUBS.filter((h) =>
    `${h.city} ${h.country}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <div className="absolute inset-0 z-[60] flex items-end bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Find jams near you"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90%] w-full flex-col overflow-y-auto rounded-t-3xl border-t border-border bg-surface p-4 outline-none animate-in slide-in-from-bottom duration-200 motion-reduce:animate-none"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-black text-foreground">Find cyphers near you</h2>
          <Button variant="ghost" size="icon" aria-label="Close location picker" onClick={onClose}><CloseIcon /></Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Choose your city. For now, explore sample jams from Kitchener-Waterloo. Only your city choice is saved, not GPS coordinates.
        </p>

        <div className="mt-4 grid gap-2">
          <Button
            type="button"
            disabled={busy}
            onClick={usePrecise}
            className="h-auto flex-col items-start gap-1 whitespace-normal rounded-lg bg-gradient-primary px-4 py-3 text-left text-sm font-extrabold text-primary-foreground shadow-glow-primary disabled:opacity-60"
          >
            📍 {busy ? "Finding you…" : "Use my precise location"}
            <span className="block text-[11px] font-medium opacity-80">Find the closest sample city using GPS</span>
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            type="button"
            onClick={useApprox}
            className="h-auto flex-col items-start gap-1 whitespace-normal rounded-lg border border-border bg-secondary px-4 py-3 text-left text-sm font-bold text-foreground hover:border-gold"
          >
            🌍 Approximate (city only)
            <span className="block text-[11px] font-medium text-muted-foreground">City suggestion from your time zone — no GPS</span>
          </Button>
        </div>
        {error ? <p className="mt-2 text-[11px] font-semibold text-accent">{error}</p> : null}

        <p className="mt-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Or pick a city</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cities"
          aria-label="Search cities"
          className="mt-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <div className="mt-2 min-h-16 flex-1 overflow-y-auto overscroll-contain">
          {!cities.length ? <p className="py-3 text-xs text-muted-foreground">No matching sample cities.</p> : null}
          {cities.map((h) => (
            <Button
              variant="ghost"
              disabled={busy}
              key={h.id}
              type="button"
              onClick={() => onSave({ hubId: h.id, accuracy: "manual" })}
              className="h-auto w-full justify-between whitespace-normal rounded-none border-b border-border/60 px-1 py-2.5 text-left text-sm text-foreground hover:text-gold"
            >
              <span>
                {h.city}
                <span className="ml-1 text-xs text-muted-foreground">{h.country}</span>
              </span>
              {h.hasJams ? (
                <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">Sample jams</span>
              ) : null}
            </Button>
          ))}
        </div>
        <Button variant="ghost" type="button" onClick={onClose} className="mt-3 shrink-0 text-xs font-bold text-muted-foreground">
          Not now
        </Button>
      </div>
    </div>
  )
}
