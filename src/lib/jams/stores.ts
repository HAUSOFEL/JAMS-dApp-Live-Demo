import { useSyncExternalStore } from "react"

function createStore<T>(initial: T, storageKey?: string, validate?: (v: unknown) => T | null) {
  let value = initial
  let loaded = false
  const listeners = new Set<() => void>()
  const load = () => {
    if (loaded || !storageKey || typeof window === "undefined") return
    loaded = true
    try {
      const raw = window.localStorage.getItem(storageKey)
      const v = raw ? validate?.(JSON.parse(raw)) : null
      if (v) value = v
    } catch { /* ignore bad storage */ }
  }
  return {
    get: () => { load(); return value },
    set: (next: T) => {
      value = next
      if (storageKey) try { window.localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* full */ }
      listeners.forEach((l) => l())
    },
    subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l) },
    initial,
  }
}

/** Reels sound: shared so unmuting one reel keeps sound on while swiping (Instagram behaviour). */
const soundStore = createStore(true)
export function useReelsMuted() {
  const muted = useSyncExternalStore(soundStore.subscribe, soundStore.get, () => true)
  return [muted, (m: boolean) => soundStore.set(m)] as const
}

export interface ProfileEdits {
  displayName: string
  handle: string
  avatarUrl: string
  bio: string
  crew: string
  location: string
  styles: string[]
  links: { label: string; url: string }[]
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "")
export function validateProfileEdits(v: unknown): ProfileEdits | null {
  if (!v || typeof v !== "object") return null
  const o = v as Partial<Record<keyof ProfileEdits, unknown>>
  const avatar = str(o.avatarUrl, 500)
  return {
    displayName: str(o.displayName, 40),
    handle: str(o.handle, 30).replace(/[^a-zA-Z0-9_.]/g, ""),
    avatarUrl: /^(https:\/\/|data:image\/)/.test(avatar) ? avatar : "",
    bio: str(o.bio, 150),
    crew: str(o.crew, 40),
    location: str(o.location, 60),
    styles: Array.isArray(o.styles) ? o.styles.filter((s): s is string => typeof s === "string").slice(0, 8) : [],
    links: Array.isArray(o.links)
      ? o.links
          .filter((l): l is { label: string; url: string } => !!l && typeof l === "object")
          .map((l) => ({ label: str(l.label, 30), url: str(l.url, 200) }))
          .filter((l) => /^https?:\/\//.test(l.url))
          .slice(0, 5)
      : [],
  }
}

const profileStore = createStore<ProfileEdits | null>(null, "jams.profileEdits", validateProfileEdits)
export function useProfileEdits() {
  const edits = useSyncExternalStore(profileStore.subscribe, profileStore.get, () => null)
  return [edits, (e: ProfileEdits) => profileStore.set(e)] as const
}
