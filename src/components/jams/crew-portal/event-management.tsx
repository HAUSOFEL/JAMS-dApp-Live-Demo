import { useState } from "react"
import { useJams } from "../jams-context"
import { CrewPanel, CrewSectionLabel, CrewTab } from "./panel"

type Status = "done" | "live" | "next"
interface Segment {
  id: string
  name: string
  time: string
  status: Status
}

const SEGMENTS: Segment[] = [
  { id: "doors", name: "Doors Open", time: "18:00", status: "done" },
  { id: "prelims", name: "Prelims", time: "19:00", status: "live" },
  { id: "top16", name: "Top 16", time: "20:30", status: "next" },
  { id: "finals", name: "Finals", time: "22:00", status: "next" },
]

const QUEUE = [
  { a: "B-Boy Kilo", b: "B-Boy Rexx", dj: "DJ Fleg" },
  { a: "B-Girl Nova", b: "B-Girl Sky", dj: "DJ Fleg" },
  { a: "Lil Zoo", b: "Phil Wizard", dj: "DJ Lean Rock" },
  { a: "Ami", b: "Logistx", dj: "DJ Lean Rock" },
]

export function EventManagement({ onClose }: { onClose: () => void }) {
  const { showToast } = useJams()
  const [tab, setTab] = useState<"timeline" | "cue">("timeline")
  const [segments, setSegments] = useState(SEGMENTS)
  const [cueIndex, setCueIndex] = useState(0)

  function advance() {
    setSegments((prev) => {
      const live = prev.findIndex((s) => s.status === "live")
      if (live === -1 || live === prev.length - 1) {
        showToast("Event complete")
        return prev.map((s) => ({ ...s, status: "done" as Status }))
      }
      showToast(`${prev[live + 1]?.name} is now live`)
      return prev.map((s, i) => ({ ...s, status: i <= live ? "done" : i === live + 1 ? "live" : "next" }))
    })
  }

  const onStage = QUEUE[cueIndex]
  const onDeck = QUEUE[cueIndex + 1]

  return (
    <CrewPanel
      title="Event Management"
      subtitle="Run the night live"
      onClose={onClose}
      tabs={
        <>
          <CrewTab active={tab === "timeline"} onClick={() => setTab("timeline")}>Run-of-Show</CrewTab>
          <CrewTab active={tab === "cue"} onClick={() => setTab("cue")}>Stage & DJ Cue</CrewTab>
        </>
      }
      footer={
        tab === "timeline" ? (
          <button type="button" onClick={advance} className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground">
            Advance to next segment
          </button>
        ) : (
          <button
            type="button"
            disabled={!onDeck}
            onClick={() => {
              setCueIndex((i) => i + 1)
              showToast("Next battle called to stage")
            }}
            className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-accent-foreground disabled:opacity-40"
          >
            {onDeck ? "Call On Deck to stage" : "Queue finished"}
          </button>
        )
      }
    >
      {tab === "timeline" ? (
        <div className="flex flex-col gap-2">
          <CrewSectionLabel>TAP A TIME TO EDIT</CrewSectionLabel>
          {segments.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${s.status === "live" ? "border-accent bg-accent/10 glow-accent" : "border-border bg-surface-2"}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${s.status === "live" ? "animate-pulse bg-accent" : s.status === "done" ? "bg-muted-foreground" : "bg-gold"}`} />
              <span className={`flex-1 text-sm font-bold ${s.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>{s.name}</span>
              <input
                type="time"
                value={s.time}
                aria-label={`${s.name} time`}
                onChange={(e) => setSegments((p) => p.map((x) => (x.id === s.id ? { ...x, time: e.target.value } : x)))}
                className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
              />
              <span className="w-10 text-right text-[10px] font-bold text-muted-foreground">{s.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {onStage ? (
            <div className="rounded-2xl border border-accent bg-accent/10 p-4">
              <CrewSectionLabel>ON STAGE</CrewSectionLabel>
              <p className="mt-1 text-lg font-bold text-foreground">{onStage.a} vs {onStage.b}</p>
              <p className="text-xs text-muted-foreground">Spinning: {onStage.dj}</p>
            </div>
          ) : null}
          <div className="rounded-2xl border border-gold bg-gold/10 p-4">
            <CrewSectionLabel>ON DECK</CrewSectionLabel>
            <p className="mt-1 text-lg font-bold text-foreground">{onDeck ? `${onDeck.a} vs ${onDeck.b}` : "Nobody queued"}</p>
            {onDeck ? <p className="text-xs text-muted-foreground">DJ cue: {onDeck.dj}</p> : null}
          </div>
          <CrewSectionLabel>LATER</CrewSectionLabel>
          {QUEUE.slice(cueIndex + 2).map((q) => (
            <div key={q.a} className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground">
              {q.a} vs {q.b}
            </div>
          ))}
        </div>
      )}
    </CrewPanel>
  )
}
