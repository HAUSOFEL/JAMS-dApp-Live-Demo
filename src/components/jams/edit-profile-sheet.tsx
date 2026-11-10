import { useEffect, useRef, useState } from "react"
import type { CreatorProfile } from "@/lib/jams/types"
import { type ProfileEdits, useProfileEdits, validateProfileEdits } from "@/lib/jams/stores"
import { useJams } from "./jams-context"
import { ChevronLeftIcon } from "./icons"

const STYLES = ["Breaking", "Popping", "Locking", "Krump", "Hip Hop", "House", "Waacking", "Vogue"]
const input =
  "w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary"

export function initialEdits(profile: CreatorProfile, saved: ProfileEdits | null): ProfileEdits {
  return (
    saved ?? {
      displayName: profile.creator.displayName,
      handle: profile.creator.handle,
      avatarUrl: profile.creator.avatarUrl ?? "",
      bio: profile.bio,
      crew: profile.crew ?? "",
      location: profile.location ?? "",
      styles: [],
      links: [],
    }
  )
}

export function EditProfileSheet({ profile, onClose }: { profile: CreatorProfile; onClose: () => void }) {
  const { showToast } = useJams()
  const [saved, save] = useProfileEdits()
  const [d, setD] = useState<ProfileEdits>(() => initialEdits(profile, saved))
  const fileRef = useRef<HTMLInputElement>(null)
  const set = <K extends keyof ProfileEdits>(k: K, v: ProfileEdits[K]) => setD((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  function pickPhoto(file?: File) {
    if (!file) return
    if (!file.type.startsWith("image/")) return showToast("Pick an image file")
    if (file.size > 1_500_000) return showToast("Photo too large — max 1.5 MB")
    const r = new FileReader()
    r.onload = () => typeof r.result === "string" && set("avatarUrl", r.result)
    r.readAsDataURL(file)
  }

  function submit() {
    if (!d.displayName.trim()) return showToast("Name can't be empty")
    if (!d.handle.trim()) return showToast("Username can't be empty")
    const clean = validateProfileEdits({ ...d, links: d.links.map((l) => ({ ...l, url: /^https?:\/\//.test(l.url) ? l.url : `https://${l.url}` })) })
    if (!clean) return
    save(clean)
    showToast("Profile updated")
    onClose()
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Edit profile" className="absolute inset-0 z-50 flex flex-col bg-background animate-in slide-in-from-bottom-4 fade-in duration-200">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <button type="button" onClick={onClose} aria-label="Cancel" className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-bold text-foreground">Edit profile</h2>
        <button type="button" onClick={submit} className="ml-auto rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground">
          Done
        </button>
      </header>

      <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-4 pb-28 pt-5">
        <div className="flex flex-col items-center gap-2">
          <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-surface-2 text-3xl font-extrabold text-foreground">
            {d.avatarUrl ? <img src={d.avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : d.displayName.slice(0, 2).toUpperCase()}
          </span>
          <div className="flex gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} className="text-xs font-bold text-primary">Change photo</button>
            {d.avatarUrl ? <button type="button" onClick={() => set("avatarUrl", "")} className="text-xs font-bold text-muted-foreground">Remove</button> : null}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickPhoto(e.target.files?.[0])} />
        </div>

        <Field label="Name"><input className={input} value={d.displayName} maxLength={40} onChange={(e) => set("displayName", e.target.value)} /></Field>
        <Field label="Username">
          <div className="flex items-center rounded-xl border border-border bg-secondary pl-3 focus-within:border-primary">
            <span className="text-sm text-muted-foreground">@</span>
            <input className="w-full bg-transparent px-1 py-2.5 text-sm text-foreground outline-none" value={d.handle} maxLength={30} onChange={(e) => set("handle", e.target.value.replace(/[^a-zA-Z0-9_.]/g, ""))} />
          </div>
        </Field>
        <Field label={`Bio · ${d.bio.length}/150`}>
          <textarea className={`${input} min-h-20 resize-none`} value={d.bio} maxLength={150} onChange={(e) => set("bio", e.target.value)} placeholder="Tell the cypher who you are" />
        </Field>
        <Field label="Crew"><input className={input} value={d.crew} maxLength={40} onChange={(e) => set("crew", e.target.value)} placeholder="e.g. Floor Phantoms" /></Field>
        <Field label="Home scene"><input className={input} value={d.location} maxLength={60} onChange={(e) => set("location", e.target.value)} placeholder="City, country" /></Field>

        <Field label="Dance styles">
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => {
              const on = d.styles.includes(s)
              return (
                <button key={s} type="button" aria-pressed={on} onClick={() => set("styles", on ? d.styles.filter((x) => x !== s) : [...d.styles, s])}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${on ? "border-accent bg-accent/15 text-foreground" : "border-border text-muted-foreground"}`}>
                  {s}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="Links">
          <div className="space-y-2">
            {d.links.map((l, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${input} w-28`} placeholder="Label" value={l.label} onChange={(e) => set("links", d.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <input className={input} placeholder="instagram.com/you" value={l.url} onChange={(e) => set("links", d.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                <button type="button" aria-label="Remove link" onClick={() => set("links", d.links.filter((_, j) => j !== i))} className="px-1 text-muted-foreground">✕</button>
              </div>
            ))}
            {d.links.length < 5 ? (
              <button type="button" onClick={() => set("links", [...d.links, { label: "", url: "" }])} className="text-xs font-bold text-primary">+ Add link</button>
            ) : null}
          </div>
        </Field>
        <p className="text-[11px] text-muted-foreground">Changes are saved on this device.</p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
