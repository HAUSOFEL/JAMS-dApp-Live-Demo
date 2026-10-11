import { useEffect, useRef, useState } from "react"
import { useJams } from "../jams-context"
import { CrewPanel, CrewSectionLabel } from "./panel"

const CATEGORIES = ["1v1 Bboy", "1v1 Bgirl", "2v2 Crew", "Kids (U12)", "Top Rock"]

interface CheckIn {
  id: string
  name: string
  detail: string
  at: number
  walkUp?: boolean
}

type BarcodeDetectorCtor = new (opts: { formats: string[] }) => {
  detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]>
}

export function QrGateScanner({ onClose }: { onClose: () => void }) {
  const { claimedPasses, showToast } = useJams()
  const [mode, setMode] = useState<"scan" | "walkup">("scan")
  const [camState, setCamState] = useState<"idle" | "on" | "denied" | "unsupported">("idle")
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [name, setName] = useState("")
  const [category, setCategory] = useState(CATEGORIES[0])
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const seen = useRef(new Set<string>())

  function admit(raw: string) {
    if (seen.current.has(raw)) return
    seen.current.add(raw)
    const pass = claimedPasses.find((p) => p.payload === raw || p.id === raw)
    setCheckIns((c) => [
      { id: crypto.randomUUID(), name: pass?.title ?? "Event pass", detail: pass ? `${pass.passType} · ${pass.host}` : raw.slice(0, 24), at: Date.now() },
      ...c,
    ])
    showToast(pass ? "Pass verified — welcome in!" : "Pass scanned")
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) return setCamState("unsupported")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCamState("on")
    } catch {
      setCamState("denied")
    }
  }

  useEffect(() => {
    if (camState !== "on") return
    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
    if (!Detector) return
    const detector = new Detector({ formats: ["qr_code"] })
    const id = window.setInterval(async () => {
      if (!videoRef.current) return
      try {
        const codes = await detector.detect(videoRef.current)
        if (codes[0]) admit(codes[0].rawValue)
      } catch {
        /* frame not ready */
      }
    }, 600)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camState, claimedPasses])

  useEffect(() => stopCamera, [])
  useEffect(() => {
    if (mode !== "scan") {
      stopCamera()
      setCamState("idle")
    }
  }, [mode])

  function registerWalkUp() {
    if (!name.trim()) return showToast("Add the dancer's name")
    setCheckIns((c) => [
      { id: crypto.randomUUID(), name: name.trim(), detail: category, at: Date.now(), walkUp: true },
      ...c,
    ])
    showToast(`${name.trim()} registered for ${category}`)
    setName("")
  }

  return (
    <CrewPanel
      title={mode === "scan" ? "QR Gate Scanner" : "Walk-Up Registration"}
      subtitle={`${checkIns.length} checked in tonight`}
      onClose={() => {
        stopCamera()
        onClose()
      }}
      footer={
        <button
          type="button"
          onClick={() => setMode(mode === "scan" ? "walkup" : "scan")}
          className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground glow-primary"
        >
          {mode === "scan" ? "Walk-Up Registration" : "Back to Scanner"}
        </button>
      }
    >
      {mode === "scan" ? (
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface-2">
            <video ref={videoRef} playsInline muted className={`h-full w-full object-cover ${camState === "on" ? "" : "hidden"}`} />
            {camState !== "on" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {camState === "denied"
                    ? "Camera access was blocked. Allow it in your browser settings."
                    : camState === "unsupported"
                      ? "This device has no camera access."
                      : "Point the camera at a dancer's ticket QR code."}
                </p>
                <button type="button" onClick={startCamera} className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground">
                  Start camera
                </button>
              </div>
            ) : (
              <div className="pointer-events-none absolute inset-10 rounded-xl border-2 border-gold" />
            )}
          </div>
          {claimedPasses.length > 0 ? (
            <button
              type="button"
              onClick={() => admit(claimedPasses[0].payload)}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground"
            >
              Test scan: {claimedPasses[0].title}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <CrewSectionLabel>DANCER NAME</CrewSectionLabel>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. B-Girl Nova"
            className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          />
          <CrewSectionLabel>BATTLE CATEGORY</CrewSectionLabel>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${c === category ? "bg-accent text-accent-foreground" : "border border-border text-muted-foreground"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <button type="button" onClick={registerWalkUp} className="mt-1 rounded-xl bg-gold py-3 text-sm font-bold text-background">
            Register dancer
          </button>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2">
        <CrewSectionLabel>RECENT CHECK-INS</CrewSectionLabel>
        {checkIns.length === 0 ? (
          <p className="text-xs text-muted-foreground">No one checked in yet.</p>
        ) : (
          checkIns.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2.5">
              <div>
                <p className="text-sm font-bold text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.detail}</p>
              </div>
              <span className={`text-[10px] font-bold ${c.walkUp ? "text-gold" : "text-primary"}`}>
                {c.walkUp ? "WALK-UP" : "PASS"}
              </span>
            </div>
          ))
        )}
      </div>
    </CrewPanel>
  )
}
