import { useMemo, useState } from "react"
import type { MapMarker } from "@/lib/jams/types"
import { useWallet } from "@/lib/jams/data"
import { BottomSheet } from "../bottom-sheet"
import { useJams } from "../jams-context"

type Step = "review" | "claiming" | "success"

/** Deterministic pseudo-QR matrix derived from the pass payload (demo-only visual). */
function useQrMatrix(payload: string, size = 21) {
  return useMemo(() => {
    let h = 2166136261
    for (let i = 0; i < payload.length; i += 1) {
      h ^= payload.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    const cells: boolean[] = []
    let state = h >>> 0
    for (let i = 0; i < size * size; i += 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0
      cells.push((state >>> 16) % 100 < 48)
    }
    // Finder patterns in three corners so it reads as a QR code.
    const stamp = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y += 1) {
        for (let x = 0; x < 7; x += 1) {
          const edge = x === 0 || y === 0 || x === 6 || y === 6
          const core = x >= 2 && x <= 4 && y >= 2 && y <= 4
          cells[(oy + y) * size + (ox + x)] = edge || core
        }
      }
    }
    stamp(0, 0)
    stamp(size - 7, 0)
    stamp(0, size - 7)
    return { cells, size }
  }, [payload, size])
}

export function QrPass({ payload }: { payload: string }) {
  const { cells, size } = useQrMatrix(payload)
  return (
    <div className="mx-auto w-fit rounded-2xl bg-white p-3 shadow-lg">
      <div
        className="grid gap-0"
        style={{ gridTemplateColumns: `repeat(${size}, 7px)` }}
        role="img"
        aria-label="Entry pass QR code"
      >
        {cells.map((on, i) => (
          <span key={i} className="h-[7px] w-[7px]" style={{ background: on ? "#000" : "#fff" }} />
        ))}
      </div>
    </div>
  )
}

function icsHref(marker: MapMarker) {
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JAMS//Event Pass//EN",
    "BEGIN:VEVENT",
    `UID:${marker.id}@jams.live`,
    `SUMMARY:${marker.title}`,
    `DESCRIPTION:${marker.description} (${marker.time ?? "Schedule TBA"})`,
    `LOCATION:${marker.label}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`
}

interface EventPassClaimProps {
  marker: MapMarker | null
  onClose: () => void
  onToast: (message: string) => void
}

export function EventPassClaim({ marker, onClose, onToast }: EventPassClaimProps) {
  const wallet = useWallet()
  const { addClaimedPass } = useJams()
  const [step, setStep] = useState<Step>("review")
  const [showTech, setShowTech] = useState(false)

  if (!marker) return null

  const isWorkshop = marker.kind === "workshop"
  const passType = marker.passType ?? (isWorkshop ? "Free Entry" : "Entry Pass")
  const host = marker.host ?? "JAMS Crew"
  const schedule = marker.time ?? "Schedule TBA"
  const payload = `jams:pass:${marker.id}:${wallet.address}`

  const close = () => {
    setStep("review")
    setShowTech(false)
    onClose()
  }

  const claim = () => {
    setStep("claiming")
    window.setTimeout(() => {
      addClaimedPass({
        id: marker.id,
        title: marker.title,
        host,
        passType,
        schedule,
        venue: marker.label,
        payload,
        calendarHref: icsHref(marker),
        claimedAt: Date.now(),
      })
      setStep("success")
      onToast(`You're on the list for ${marker.title}`)
    }, 1400)
  }

  return (
    <BottomSheet
      open
      onClose={close}
      title={step === "success" ? "You're on the list" : isWorkshop ? "Join this workshop" : "Get your ticket"}
      description={
        step === "success"
          ? "Show this code at the door. It's saved in My Tickets."
          : "Check the details, then grab your spot in one tap."
      }
    >
      {step === "success" ? (
        <div className="space-y-4">
          <QrPass payload={payload} />
          <div className="rounded-2xl border border-border bg-surface p-3 text-center">
            <p className="text-sm font-bold text-foreground">{marker.title}</p>
            <p className="text-[11px] font-semibold text-primary">
              {passType} · {schedule}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Saved to My Tickets on your profile
            </p>
          </div>
          <a
            href={icsHref(marker)}
            download={`${marker.id}-jams-ticket.ics`}
            onClick={() => onToast("Added to your calendar")}
            className="block rounded-xl bg-secondary py-3 text-center text-xs font-bold text-foreground"
          >
            Add to Calendar
          </a>
          <button
            type="button"
            onClick={close}
            className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <dl className="divide-y divide-border rounded-2xl border border-border bg-surface px-3">
            {[
              ["Event", marker.title],
              ["Host", host],
              ["Ticket", passType],
              ["When", schedule],
              ["Where", marker.label],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-3 py-2.5">
                <dt className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{k}</dt>
                <dd className="max-w-[60%] text-right text-xs font-semibold text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            onClick={claim}
            disabled={step === "claiming"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground disabled:opacity-70"
          >
            {step === "claiming" ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                Saving your spot…
              </>
            ) : isWorkshop ? (
              "Sign me up"
            ) : (
              "Get my ticket"
            )}
          </button>
          <p className="text-center text-[10px] text-muted-foreground">
            Free to claim. Your ticket lives in the app with a QR code for the door.
          </p>
          <button
            type="button"
            onClick={() => setShowTech((v) => !v)}
            className="w-full text-center text-[10px] font-semibold text-muted-foreground underline underline-offset-4"
          >
            {showTech ? "Hide technical details" : "Show technical details"}
          </button>
          {showTech ? (
            <p className="break-all rounded-xl bg-secondary p-2.5 text-[10px] text-muted-foreground">
              Proof-of-attendance pass minted to {wallet.address.slice(0, 6)}…
              {wallet.address.slice(-4)} on {wallet.chain}.
            </p>
          ) : null}
        </div>
      )}
    </BottomSheet>
  )
}
