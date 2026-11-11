import { useEffect, useRef, useState } from "react"
import { addUpload } from "@/lib/jams/uploads"
import { useJams } from "./jams-context"

type Mode = "live" | "upload"

/** In-shell Creator Studio screens: camera live preview and photo/reel upload composer. */
export function CreatorStudioPanel({ mode, onClose }: { mode: Mode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])
  return (
    <div role="dialog" aria-label={mode === "live" ? "Go live" : "Upload content"} className="absolute inset-0 z-[60] flex flex-col bg-background">
      {mode === "live" ? <LiveStudio onClose={onClose} /> : <UploadStudio onClose={onClose} />}
    </div>
  )
}

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <button type="button" onClick={onClose} className="text-sm font-bold text-muted-foreground hover:text-foreground">✕ Close</button>
      <h2 className="text-sm font-black uppercase tracking-wider text-foreground">{title}</h2>
      <span className="w-14" />
    </div>
  )
}

function LiveStudio({ onClose }: { onClose: () => void }) {
  const { showToast } = useJams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [facing, setFacing] = useState<"user" | "environment">("user")
  const [title, setTitle] = useState("Sunday cypher session")
  const [liveSince, setLiveSince] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function start() {
      setReady(false)
      setError(null)
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This browser can't use the camera.")
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: true })
        if (cancelled) return stream.getTracks().forEach((t) => t.stop())
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setReady(true)
      } catch {
        setError("Camera or mic access was blocked. Allow it in your browser settings and try again.")
      }
    }
    start()
    return () => {
      cancelled = true
    }
  }, [facing])

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), [])
  useEffect(() => {
    if (!liveSince) return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [liveSince])
  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !muted))
  }, [muted])

  const secs = liveSince ? Math.floor((now - liveSince) / 1000) : 0
  const clock = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`
  const viewers = liveSince ? Math.min(240, Math.floor(secs * 1.7)) : 0

  function end() {
    showToast(`Stream ended · ${clock} live`)
    onClose()
  }

  return (
    <>
      <Header title="Go Live" onClose={liveSince ? end : onClose} />
      <div className="relative flex-1 overflow-hidden bg-card">
        <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 h-full w-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`} />
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button type="button" onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))} className="rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground">Try again</button>
          </div>
        ) : !ready ? (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Starting camera…</p>
        ) : null}
        {liveSince ? (
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-[10px] font-black uppercase text-live-foreground">
              <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-live-foreground" /> Live {clock}
            </span>
            <span className="rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-bold text-foreground">👁 {viewers}</span>
          </div>
        ) : null}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button type="button" aria-label="Flip camera" onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))} className="h-10 w-10 rounded-full bg-background/70 text-foreground">⟲</button>
          <button type="button" aria-label={muted ? "Unmute mic" : "Mute mic"} onClick={() => setMuted((m) => !m)} className="h-10 w-10 rounded-full bg-background/70 text-foreground">{muted ? "🔇" : "🎙"}</button>
        </div>
      </div>
      <div className="space-y-3 border-t border-border p-4">
        {!liveSince ? (
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="Stream title" className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
        ) : (
          <p className="truncate text-sm font-bold text-foreground">{title}</p>
        )}
        {liveSince ? (
          <button type="button" onClick={end} className="w-full rounded-2xl bg-secondary py-3.5 text-sm font-black uppercase text-foreground">End stream</button>
        ) : (
          <button type="button" disabled={!ready || !title.trim()} onClick={() => { setLiveSince(Date.now()); setNow(Date.now()); showToast("You're live!") }} className="w-full rounded-2xl bg-gradient-primary py-3.5 text-sm font-black uppercase text-primary-foreground disabled:opacity-40">● Go Live Now!</button>
        )}
        <p className="text-center text-[10px] text-muted-foreground">Preview only — your camera stays on this device; others can't watch yet.</p>
      </div>
    </>
  )
}

function UploadStudio({ onClose }: { onClose: () => void }) {
  const { showToast, openProfile } = useJams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<{ url: string; isVideo: boolean; name: string } | null>(null)
  const [caption, setCaption] = useState("")

  useEffect(() => {
    inputRef.current?.click()
  }, [])

  function pick(f?: File) {
    if (!f) return
    const isVideo = f.type.startsWith("video/")
    if (!isVideo && !f.type.startsWith("image/")) return showToast("Pick a photo or video")
    if (f.size > 200 * 1024 * 1024) return showToast("That file is over 200 MB")
    if (file) URL.revokeObjectURL(file.url)
    setFile({ url: URL.createObjectURL(f), isVideo, name: f.name })
  }

  function post() {
    if (!file) return
    addUpload({
      id: `up-${Date.now()}`,
      gradient: "linear-gradient(135deg,var(--primary),var(--accent))",
      ...(file.isVideo ? { videoUrl: file.url } : { imageUrl: file.url }),
      isReel: file.isVideo,
      ...(caption.trim() ? { caption: caption.trim() } : {}),
      likes: 0,
    })
    showToast(file.isVideo ? "Reel posted to your profile" : "Photo posted to your profile")
    onClose()
    openProfile("me")
  }

  return (
    <>
      <Header title="New Post" onClose={onClose} />
      <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      <div className="flex-1 overflow-y-auto p-4">
        <button type="button" onClick={() => inputRef.current?.click()} className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-card">
          {file ? (
            file.isVideo ? (
              <video src={file.url} autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <img src={file.url} alt="Selected upload" className="absolute inset-0 h-full w-full object-cover" />
            )
          ) : (
            <span className="text-center text-sm text-muted-foreground">
              <span className="block text-3xl text-primary">▲</span>Tap to choose a photo or video
            </span>
          )}
          {file ? <span className="absolute bottom-2 right-2 rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-bold text-foreground">{file.isVideo ? "Reel" : "Photo"} · Change</span> : null}
        </button>
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} rows={3} placeholder="Write a caption…" className="mt-3 w-full resize-none rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
      </div>
      <div className="border-t border-border p-4">
        <button type="button" disabled={!file} onClick={post} className="w-full rounded-2xl bg-gradient-primary py-3.5 text-sm font-black uppercase text-primary-foreground disabled:opacity-40">Share</button>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">Posts show on your profile for this session only.</p>
      </div>
    </>
  )
}
