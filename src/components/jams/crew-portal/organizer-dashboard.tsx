import { useState } from "react"
import { useJams } from "../jams-context"
import { CrewPanel, CrewSectionLabel, CrewTab } from "./panel"

type Vote = "red" | "blue" | "tie"
interface Battle {
  id: string
  round: string
  red: string
  blue: string
  winner?: string
}

const BATTLES: Battle[] = [
  { id: "qf1", round: "Quarterfinal", red: "B-Boy Kilo", blue: "B-Boy Rexx" },
  { id: "qf2", round: "Quarterfinal", red: "B-Girl Nova", blue: "B-Girl Sky" },
  { id: "f1", round: "Final (1v1)", red: "Lil Zoo", blue: "Phil Wizard", winner: "Phil Wizard" },
]

const PRIZES = [
  { place: "1st", name: "Phil Wizard", amount: 500 },
  { place: "2nd", name: "Lil Zoo", amount: 250 },
]

const STAFF = [
  { name: "Maya R.", role: "Gate Lead", zone: "Front Door" },
  { name: "Jordan T.", role: "MC", zone: "Main Stage" },
  { name: "Kenji O.", role: "Stage Manager", zone: "Backstage" },
  { name: "Priya S.", role: "Medic", zone: "First Aid" },
  { name: "Leo B.", role: "Merch", zone: "Vendor Row" },
]

export function OrganizerDashboard({ onClose }: { onClose: () => void }) {
  const { showToast } = useJams()
  const [tab, setTab] = useState<"judges" | "prizes" | "staff">("judges")
  const [battles, setBattles] = useState(BATTLES)
  const [votes, setVotes] = useState<Record<string, Vote>>({})
  const [paid, setPaid] = useState(false)
  const [paying, setPaying] = useState(false)

  function vote(b: Battle, v: Vote) {
    setVotes((p) => ({ ...p, [b.id]: v }))
    if (v === "tie") return showToast("One more round!")
    const winner = v === "red" ? b.red : b.blue
    setBattles((p) => p.map((x) => (x.id === b.id ? { ...x, winner } : x)))
    showToast(`Vote locked: ${winner}`)
  }

  function payout() {
    setPaying(true)
    window.setTimeout(() => {
      setPaying(false)
      setPaid(true)
      showToast("Prizes sent to winners' wallets")
    }, 1200)
  }

  const live = battles.filter((b) => !b.winner)
  const done = battles.filter((b) => b.winner)

  return (
    <CrewPanel
      title="Organizer Dashboard"
      subtitle="Brackets, prizes and team"
      onClose={onClose}
      tabs={
        <>
          <CrewTab active={tab === "judges"} onClick={() => setTab("judges")}>Judges Panel</CrewTab>
          <CrewTab active={tab === "prizes"} onClick={() => setTab("prizes")}>Prize Vault</CrewTab>
          <CrewTab active={tab === "staff"} onClick={() => setTab("staff")}>Staff Roster</CrewTab>
        </>
      }
    >
      {tab === "judges" ? (
        <div className="flex flex-col gap-3">
          <CrewSectionLabel>LIVE BRACKETS</CrewSectionLabel>
          {live.length === 0 ? <p className="text-xs text-muted-foreground">All battles judged.</p> : null}
          {live.map((b) => (
            <div key={b.id} className="rounded-2xl border border-border bg-surface-2 p-3">
              <p className="text-[11px] font-bold text-muted-foreground">{b.round}</p>
              <p className="mt-1 text-sm font-bold text-foreground">{b.red} vs {b.blue}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button type="button" onClick={() => vote(b, "red")} className="rounded-xl bg-accent py-2.5 text-xs font-bold text-accent-foreground">Red Corner</button>
                <button type="button" onClick={() => vote(b, "blue")} className="rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground">Blue Corner</button>
                <button
                  type="button"
                  onClick={() => vote(b, "tie")}
                  className={`rounded-xl border py-2.5 text-[11px] font-bold ${votes[b.id] === "tie" ? "border-gold text-gold" : "border-border text-foreground"}`}
                >
                  Tie / One More
                </button>
              </div>
            </div>
          ))}
          {done.length ? <CrewSectionLabel>COMPLETED</CrewSectionLabel> : null}
          {done.map((b) => (
            <div key={b.id} className="flex justify-between rounded-xl border border-border px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">{b.red} vs {b.blue}</span>
              <span className="font-bold text-gold">{b.winner}</span>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "prizes" ? (
        <div className="flex flex-col gap-3">
          <CrewSectionLabel>COMPLETED BRACKET · FINAL (1V1)</CrewSectionLabel>
          {PRIZES.map((p) => (
            <div key={p.place} className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-3">
              <div>
                <p className="text-xs font-bold text-gold">{p.place}</p>
                <p className="text-sm font-bold text-foreground">{p.name}</p>
              </div>
              <span className="text-sm font-bold text-foreground">${p.amount}</span>
            </div>
          ))}
          <button
            type="button"
            disabled={paid || paying}
            onClick={payout}
            className="mt-2 rounded-xl bg-gold py-3 text-sm font-bold text-background glow-gold disabled:opacity-60"
          >
            {paid ? "Paid out ✓" : paying ? "Sending..." : `Pay winners · $${PRIZES.reduce((s, p) => s + p.amount, 0)}`}
          </button>
          <p className="text-center text-[11px] text-muted-foreground">Sent instantly to each winner's connected wallet.</p>
        </div>
      ) : null}

      {tab === "staff" ? (
        <div className="flex flex-col gap-2">
          <CrewSectionLabel>TEAM ON SHIFT</CrewSectionLabel>
          {STAFF.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2.5">
              <div>
                <p className="text-sm font-bold text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.role}</p>
              </div>
              <span className="rounded-full border border-primary/60 px-2.5 py-1 text-[10px] font-bold text-primary">{s.zone}</span>
            </div>
          ))}
        </div>
      ) : null}
    </CrewPanel>
  )
}
