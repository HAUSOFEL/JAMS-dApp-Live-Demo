import { useEffect, useState } from "react"
import {
  CITY_HUBS,
  approximateHubFromTimeZone,
  getHub,
  nearestHub,
  nearestJamHub,
  type UserLocation,
} from "@/lib/jams/location"

const STORAGE_KEY = "jams.userLocation"

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setLocation(JSON.parse(raw))
    } catch {}
    setReady(true)
  }, [])

  const save = (loc: UserLocation) => {
    setLocation(loc)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
    } catch {}
  }
  return { location, ready, save }
}

export function LocationPill({ location, onClick }: { location: UserLocation | null; onClick: () => void }) {
  const hub = location ? getHub(location.hubId) : null
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-border bg-surface/95 px-3 py-1.5 text-[11px] font-bold text-foreground shadow-lg backdrop-blur hover:border-accent"
    >
      <span aria-hidden="true">📍</span>
      {hub ? `${hub.city}${hub.region ? `, ${hub.region}` : ""}` : "Set your location"}
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {location?.accuracy === "precise" ? "GPS" : location?.accuracy === "approximate" ? "Approx" : "Change"}
      </span>
    </button>
  )
}

export function NoJamsBanner({ location, onPropose }: { location: UserLocation; onPropose: () => void }) {
  const hub = getHub(location.hubId)
  if (hub.hasJams) return null
  const near = nearestJamHub(hub)
  return (
    <div className="rounded-2xl border border-gold/50 bg-surface/95 p-3 text-[11px] shadow-lg backdrop-blur">
      <p className="font-extrabold text-foreground">No jams in {hub.city} yet</p>
      <p className="mt-0.5 text-muted-foreground">
        Showing the closest scene: {near.hub.city} ({near.km.toLocaleString()} km away).
      </p>
      <button
        type="button"
        onClick={onPropose}
        className="mt-2 rounded-full bg-gradient-primary px-3 py-1.5 text-[11px] font-extrabold text-primary-foreground"
      >
        Start the first jam in {hub.city}
      </button>
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
  if (!open) return null

  const usePrecise = () => {
    setError(null)
    if (!("geolocation" in navigator)) {
      setError("Your device doesn't support location. Try approximate or pick a city.")
      return
    }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false)
        const { latitude: lat, longitude: lng } = pos.coords
        onSave({ hubId: nearestHub(lat, lng).id, accuracy: "precise", lat, lng })
      },
      () => {
        setBusy(false)
        setError("Location was blocked. Try approximate or pick a city below.")
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const useApprox = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    onSave({ hubId: approximateHubFromTimeZone(tz).id, accuracy: "approximate" })
  }

  const cities = CITY_HUBS.filter((h) =>
    `${h.city} ${h.country}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <div className="absolute inset-0 z-[60] flex items-end bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Find jams near you"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85%] w-full flex-col rounded-t-3xl border-t border-border bg-surface p-4 animate-in slide-in-from-bottom duration-200"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <h2 className="text-lg font-black text-foreground">Find cyphers near you</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Share your location to see local jams, workshops and sessions. You can change this anytime.
        </p>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={usePrecise}
            className="rounded-2xl bg-gradient-primary px-4 py-3 text-left text-sm font-extrabold text-primary-foreground shadow-glow-primary disabled:opacity-60"
          >
            📍 {busy ? "Finding you…" : "Use my precise location"}
            <span className="block text-[11px] font-medium opacity-80">Best for finding sessions down the street</span>
          </button>
          <button
            type="button"
            onClick={useApprox}
            className="rounded-2xl border border-border bg-secondary px-4 py-3 text-left text-sm font-bold text-foreground hover:border-gold"
          >
            🌍 Approximate (city only)
            <span className="block text-[11px] font-medium text-muted-foreground">We guess your city — no GPS needed</span>
          </button>
        </div>
        {error ? <p className="mt-2 text-[11px] font-semibold text-accent">{error}</p> : null}

        <p className="mt-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Or pick a city</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cities"
          className="mt-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
          {cities.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => onSave({ hubId: h.id, accuracy: "manual" })}
              className="flex w-full items-center justify-between border-b border-border/60 py-2.5 text-left text-sm text-foreground hover:text-gold"
            >
              <span>
                {h.city}
                <span className="ml-1 text-xs text-muted-foreground">{h.country}</span>
              </span>
              {h.hasJams ? (
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">Jams live</span>
              ) : null}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="mt-3 text-xs font-bold text-muted-foreground">
          Not now
        </button>
      </div>
    </div>
  )
}
