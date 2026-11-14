import { useEffect, useState } from "react"
import { X } from "lucide-react"
import type { ProfilePost } from "@/lib/jams/types"

export const HIGHLIGHTS = [
  { label: "Jams", lines: ["Sunday cypher vibes", "Circle was packed tonight", "Block jam recap"] },
  { label: "Battles", lines: ["Prelims round", "Top 16 crash", "Finals — what a night"] },
  { label: "Workshops", lines: ["Footwork fundamentals", "Freeze drills", "Musicality session"] },
  { label: "Sets", lines: ["DJ set — funk breaks", "Warm-up selections", "Closing set"] },
] as const

/** Splits a profile's photos across the four highlight circles (sample saved stories). */
export interface Slide { id: string; imageUrl: string; caption: string; ago: string }

export function agoLabel(ms: number) {
  const m = Math.max(1, Math.round((Date.now() - ms) / 60000))
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`
}

/** Recent-story sample for a creator's avatar ring: latest three photos. */
export function storySlides(posts: ProfilePost[]): Slide[] {
  return posts.filter((p) => p.imageUrl && !p.isLive).slice(0, 3).map((p, i) => ({
    id: `story-${p.id}`, imageUrl: p.imageUrl ?? "", caption: p.caption || "Today at the cypher", ago: `${(i + 1) * 3}h ago`,
  }))
}

export function highlightSlides(posts: ProfilePost[], index: number, saved: Slide[] = []): Slide[] {
  const media = posts.filter((p) => p.imageUrl)
  if (!media.length) return []
  const h = HIGHLIGHTS[index]
  if (!h) return []
  return [...saved, ...h.lines.map((caption, i) => ({
    id: `${h.label}-${i}`,
    imageUrl: media[(index * 3 + i) % media.length]?.imageUrl ?? "",
    caption,
    ago: `${(index + 1) * (i + 2)}w ago`,
  }))]
}

const DURATION = 5000

export function HighlightViewer({
  posts, startIndex, handle, avatarUrl, onClose, saved, story,
}: { posts: ProfilePost[]; startIndex: number; handle: string; avatarUrl?: string | undefined; onClose: () => void; saved?: Record<number, Slide[]>; story?: boolean }) {
  const [hi, setHi] = useState(startIndex)
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const slides = story ? storySlides(posts) : highlightSlides(posts, hi, saved?.[hi])
  const last = story ? 0 : HIGHLIGHTS.length - 1

  const next = () => {
    if (slide < slides.length - 1) setSlide(slide + 1)
    else if (hi < last) { setHi(hi + 1); setSlide(0) }
    else onClose()
  }
  const prev = () => {
    if (slide > 0) setSlide(slide - 1)
    else if (!story && hi > 0) { setHi(hi - 1); setSlide(Math.max(0, highlightSlides(posts, hi - 1, saved?.[hi - 1]).length - 1)) }
  }

  useEffect(() => { setProgress(0) }, [hi, slide])
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setProgress((p) => p + 100 / (DURATION / 100)), 100)
    return () => clearInterval(t)
  }, [paused, hi, slide])
  useEffect(() => { if (progress >= 100) next() }, [progress]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const current = slides[slide]
  return (
    <div role="dialog" aria-label={story ? "Story" : `${HIGHLIGHTS[hi]?.label} highlight`} className="absolute inset-0 z-50 flex flex-col bg-background">
      <div className="absolute inset-x-0 top-0 z-10 space-y-2 bg-gradient-to-b from-background/80 to-transparent p-3">
        <div className="flex gap-1">
          {slides.map((s, i) => (
            <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded bg-foreground/30">
              <div className="h-full bg-foreground" style={{ width: i < slide ? "100%" : i === slide ? `${Math.min(progress, 100)}%` : "0%" }} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {avatarUrl ? <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" /> : null}
          <p className="text-sm font-bold text-foreground">{story ? "Story" : HIGHLIGHTS[hi]?.label}</p>
          <p className="text-xs text-muted-foreground">@{handle} · {current?.ago}</p>
          <button type="button" aria-label="Close highlight" onClick={onClose} className="ml-auto p-1 text-foreground"><X className="h-5 w-5" /></button>
        </div>
      </div>
      {current ? (
        <img src={current.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <p className="m-auto text-sm text-muted-foreground">No saved stories yet</p>
      )}
      <div className="absolute inset-0 flex" onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerLeave={() => setPaused(false)}>
        <button type="button" aria-label="Previous story" className="w-1/3" onClick={prev} />
        <button type="button" aria-label="Next story" className="flex-1" onClick={next} />
      </div>
      {current ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-5 pt-12 text-sm font-semibold text-foreground">{current.caption}</p>
      ) : null}
    </div>
  )
}
