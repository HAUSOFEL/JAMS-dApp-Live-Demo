import { useEffect, useRef, useState } from "react"

export type ChatChannel = { id: string; name: string; icon: string; description: string; membersOnline?: number }

type Msg = { id: string; author: string; text: string; time: string; mine?: boolean; pinned?: boolean }

const SEED: Msg[] = [
  { id: "p", author: "JAMS Crew", text: "Welcome! Keep it respectful — peace, love, unity & having fun. ✌️", time: "Pinned", pinned: true },
  { id: "1", author: "b-girl_nova", text: "Anyone pulling up to the cypher tonight?", time: "6:42 PM" },
  { id: "2", author: "lil_footwork", text: "Pulling up! DJ is playing funk breaks all night 🔥", time: "6:45 PM" },
  { id: "3", author: "crew_kw", text: "Practice session after, bring knee pads", time: "6:51 PM" },
]

const QUICK = ["🔥", "🙌", "Pulling up!", "Where at?"]

export function ChatThread({ channel, onBack }: { channel: ChatChannel; onBack: () => void }) {
  const [messages, setMessages] = useState<Msg[]>(SEED)
  const [draft, setDraft] = useState("")
  const [joined, setJoined] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [messages])

  const send = (text: string) => {
    const t = text.trim()
    if (!t) return
    const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    setMessages((m) => [...m, { id: crypto.randomUUID(), author: "You", text: t, time, mine: true }])
    setDraft("")
  }

  return (
    <div className="flex animate-fade-in flex-col">
      <div className="sticky top-0 z-10 -mx-1 mb-3 flex items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3">
        <button type="button" onClick={onBack} aria-label="Back to channels" className="rounded-lg bg-secondary px-2.5 py-1.5 text-sm font-bold">
          ←
        </button>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 font-extrabold text-primary">{channel.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{channel.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{channel.membersOnline ?? 12} online</p>
        </div>
        <button
          type="button"
          onClick={() => setJoined((j) => !j)}
          className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${joined ? "bg-secondary text-muted-foreground" : "bg-gradient-primary text-primary-foreground"}`}
        >
          {joined ? "Joined" : "Join"}
        </button>
      </div>

      <div className="space-y-2.5 pb-3">
        {messages.map((m) =>
          m.pinned ? (
            <div key={m.id} className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-xs">
              <span className="font-bold text-gold">📌 {m.author}</span>
              <p className="mt-1 text-foreground">{m.text}</p>
            </div>
          ) : (
            <div key={m.id} className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
              <span className="mb-0.5 text-[10px] text-muted-foreground">
                {m.author} · {m.time}
              </span>
              <p
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  m.mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-surface-2 text-foreground"
                }`}
              >
                {m.text}
              </p>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      {joined ? (
        <div className="sticky bottom-0 bg-background pb-1 pt-2">
          <div className="mb-2 flex gap-1.5 overflow-x-auto">
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => send(q)} className="shrink-0 rounded-full border border-border px-3 py-1 text-xs">
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(draft)
            }}
            className="flex gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${channel.name}`}
              aria-label="Message"
              className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button type="submit" disabled={!draft.trim()} className="rounded-xl bg-gradient-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-40">
              Send
            </button>
          </form>
        </div>
      ) : (
        <p className="rounded-xl bg-surface-2 p-3 text-center text-xs text-muted-foreground">Join this channel to send messages.</p>
      )}
    </div>
  )
}
