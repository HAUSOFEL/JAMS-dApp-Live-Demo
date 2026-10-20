import { useState } from "react"
import { BottomSheet } from "./bottom-sheet"
import { useJams } from "./jams-context"

const CATEGORIES = ["1v1 Battle", "Open Cypher", "Workshop", "Block Jam"] as const
const SETUPS = ["Indoor", "Outdoor"] as const
const ENTRY = ["Free", "By donation", "Event pass"] as const

type Draft = {
  category: (typeof CATEGORIES)[number]
  title: string
  spot: string
  city: string
  setup: (typeof SETUPS)[number]
  date: string
  time: string
  music: string
  entry: (typeof ENTRY)[number]
  host: string
}

const EMPTY: Draft = {
  category: "Open Cypher",
  title: "",
  spot: "",
  city: "",
  setup: "Indoor",
  date: "",
  time: "",
  music: "",
  entry: "Free",
  host: "",
}

function Chips<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
            value === o ? "border-accent bg-accent/15 text-foreground glow-accent" : "border-border text-muted-foreground hover:border-primary"
          }`}
        >
          {o}
        </button>
      ))}
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

const inputCls =
  "w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary"

const STEPS = ["Type", "Spot", "When", "Review"]

export function ProposeJamSheet() {
  const { modal, closeModal, navigate, showToast, dancerProfile } = useJams()
  const [step, setStep] = useState(0)
  const [d, setD] = useState<Draft>(EMPTY)
  const [done, setDone] = useState(false)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }))

  function close() {
    closeModal()
    setTimeout(() => {
      setStep(0)
      setD(EMPTY)
      setDone(false)
    }, 250)
  }

  const valid = [
    d.title.trim().length > 2,
    d.spot.trim() && d.city.trim(),
    d.date && d.time,
    true,
  ][step]

  const host = d.host || (dancerProfile ? String((dancerProfile as unknown as Record<string, unknown>).name ?? "You") : "You")

  return (
    <BottomSheet
      open={modal === "propose"}
      title={done ? "Jam proposed!" : "Propose a Jam"}
      description={done ? "Your community can now see and rally around it." : "Drop a spot and gather local interest."}
      onClose={close}
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-2xl glow-gold">🔥</div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{d.title}</h3>
            <p className="text-xs text-muted-foreground">
              {d.spot}, {d.city} · {d.date} at {d.time}
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-pretty">
            Sample flow: your proposal is saved for this session only and is pending community review.
          </p>
          <button
            type="button"
            onClick={() => {
              close()
              navigate("chat")
              showToast("Shared your jam in the community chat")
            }}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground glow-primary"
          >
            Announce in chat
          </button>
          <button
            type="button"
            onClick={() => {
              if (navigator.share) navigator.share({ title: d.title, text: `${d.title} — ${d.spot}, ${d.city}` }).catch(() => {})
              else showToast("Link copied")
            }}
            className="w-full rounded-xl border border-gold/50 py-3 text-sm font-bold text-gold"
          >
            Share with friends
          </button>
          <button type="button" onClick={close} className="text-xs font-bold text-muted-foreground">
            Done
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col gap-1">
                <div className={`h-1 rounded-full ${i <= step ? "bg-accent" : "bg-border"}`} />
                <span className={`text-[10px] font-bold ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              </div>
            ))}
          </div>

          {step === 0 && (
            <>
              <Field label="WHAT KIND OF JAM?">
                <Chips options={CATEGORIES} value={d.category} onChange={(v) => set("category", v)} />
              </Field>
              <Field label="NAME IT">
                <input className={inputCls} value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="Sunday Park Cypher" />
              </Field>
              <Field label="HOST / CREW (OPTIONAL)">
                <input className={inputCls} value={d.host} onChange={(e) => set("host", e.target.value)} placeholder="@yourcrew" />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="SPOT NAME">
                <input className={inputCls} value={d.spot} onChange={(e) => set("spot", e.target.value)} placeholder="Victoria Park pavilion" />
              </Field>
              <Field label="CITY / NEIGHBORHOOD">
                <input className={inputCls} value={d.city} onChange={(e) => set("city", e.target.value)} placeholder="Kitchener, ON" />
              </Field>
              <Field label="SETUP">
                <Chips options={SETUPS} value={d.setup} onChange={(v) => set("setup", v)} />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="DATE">
                  <input type="date" className={inputCls} value={d.date} onChange={(e) => set("date", e.target.value)} />
                </Field>
                <Field label="TIME">
                  <input type="time" className={inputCls} value={d.time} onChange={(e) => set("time", e.target.value)} />
                </Field>
              </div>
              <Field label="MUSIC / DJ">
                <input className={inputCls} value={d.music} onChange={(e) => set("music", e.target.value)} placeholder="Bring a speaker, DJ TBA..." />
              </Field>
              <Field label="ENTRY">
                <Chips options={ENTRY} value={d.entry} onChange={(v) => set("entry", v)} />
              </Field>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-secondary p-4 text-sm">
              <span className="w-fit rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-accent">
                {d.category.toUpperCase()}
              </span>
              <h3 className="text-base font-bold text-foreground">{d.title}</h3>
              {[
                ["Where", `${d.spot}, ${d.city} · ${d.setup}`],
                ["When", `${d.date} at ${d.time}`],
                ["Music", d.music || "TBA"],
                ["Entry", d.entry],
                ["Host", host],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-t border-border pt-2">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="text-right text-xs font-bold text-foreground">{v}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-foreground">
                Back
              </button>
            )}
            <button
              type="button"
              disabled={!valid}
              onClick={() => (step < 3 ? setStep(step + 1) : setDone(true))}
              className="flex-[2] rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all disabled:opacity-40 enabled:glow-primary"
            >
              {step < 3 ? "Continue" : "Submit proposal"}
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  )
}
