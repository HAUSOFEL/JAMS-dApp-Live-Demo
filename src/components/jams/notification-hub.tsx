import { useMemo, useState } from "react"
import { useJams } from "./jams-context"
import {
  BellIcon,
  CheckCircleIcon,
  ChatIcon,
  CloseIcon,
  CommentIcon,
  TicketIcon,
  TipIcon,
  TrophyIcon,
} from "./icons"

type NotificationCategory = "events" | "social"

interface JamsNotification {
  id: string
  category: NotificationCategory
  icon: "checkin" | "pass" | "bracket" | "tip" | "comment" | "tag"
  title: string
  body: string
  time: string
  action: string
  unread: boolean
}

const NOTIFICATIONS: JamsNotification[] = [
  {
    id: "n1",
    category: "events",
    icon: "checkin",
    title: "Door check-in confirmed",
    body: "You're in at Stage 1: Live Cypher — Gate B scanned your pass.",
    time: "2m ago",
    action: "View pass QR",
    unread: true,
  },
  {
    id: "n2",
    category: "social",
    icon: "tip",
    title: "DRiP collectible received",
    body: "@kwbreakers sent you the 'Windmill Finals' collectible + 0.25 SOL tip.",
    time: "11m ago",
    action: "Open wallet",
    unread: true,
  },
  {
    id: "n3",
    category: "events",
    icon: "bracket",
    title: "Bracket update: Top 8",
    body: "BGirl Aria advances. Your next battle slot is 21:40 on Main Stage.",
    time: "34m ago",
    action: "Open live bracket",
    unread: true,
  },
  {
    id: "n4",
    category: "social",
    icon: "tag",
    title: "You were tagged in #main-stage",
    body: "@urban_cypher tagged you in the KWB crew callout thread.",
    time: "1h ago",
    action: "Jump to chat",
    unread: false,
  },
  {
    id: "n5",
    category: "events",
    icon: "pass",
    title: "Event pass claimed",
    body: "Workshop pass for KWC Practice Hub is now in your wallet.",
    time: "3h ago",
    action: "View pass QR",
    unread: false,
  },
  {
    id: "n6",
    category: "social",
    icon: "comment",
    title: "New comment on your reel",
    body: "@bboyflex: 'that footwork transition was clean 🔥'",
    time: "5h ago",
    action: "Open reel",
    unread: false,
  },
]

const TABS = [
  { id: "all", label: "All Activity" },
  { id: "events", label: "Events & Passes" },
  { id: "social", label: "Social & Web3" },
] as const

const ICONS = {
  checkin: CheckCircleIcon,
  pass: TicketIcon,
  bracket: TrophyIcon,
  tip: TipIcon,
  comment: CommentIcon,
  tag: ChatIcon,
}

function iconTone(icon: JamsNotification["icon"]) {
  if (icon === "bracket" || icon === "tip") return "border-gold/40 bg-gold/15 text-gold"
  if (icon === "checkin" || icon === "pass") return "border-primary/40 bg-primary/15 text-primary"
  return "border-accent/40 bg-accent/15 text-accent"
}

export function NotificationHub({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { navigate, openModal, openStream, showToast } = useJams()
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all")
  const [readIds, setReadIds] = useState<string[]>([])

  const items = useMemo(
    () => (tab === "all" ? NOTIFICATIONS : NOTIFICATIONS.filter((n) => n.category === tab)),
    [tab],
  )

  const handleAction = (n: JamsNotification) => {
    setReadIds((prev) => (prev.includes(n.id) ? prev : [...prev, n.id]))
    onClose()

    switch (n.icon) {
      case "checkin":
      case "pass":
        navigate("map")
        showToast("Opening your event pass QR")
        break
      case "bracket":
        navigate("map")
        showToast("Live bracket update opened")
        break
      case "tip":
        openModal("wallet")
        break
      case "tag":
        navigate("chat")
        showToast("Jumped to #main-stage")
        break
      case "comment":
        openStream("r1")
        break
    }
  }

  if (!open) return null

  return (
    <div className="absolute inset-0 z-[60] flex justify-end bg-black/70 backdrop-blur-sm" onClick={onClose} role="presentation">
      <aside
        className="animate-slide-up flex h-full w-[88%] max-w-[350px] flex-col border-l border-border bg-surface-2"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Notification hub"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <BellIcon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold tracking-[0.16em] text-foreground">NOTIFICATIONS</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto border-b border-border px-3 py-3 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                tab === t.id
                  ? "border-primary/50 bg-gradient-primary text-primary-foreground"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto p-3">
          {items.map((n) => {
            const Icon = ICONS[n.icon]
            const unread = n.unread && !readIds.includes(n.id)
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => handleAction(n)}
                className={`flex w-full gap-3 rounded-2xl border p-3 text-left transition-shadow hover:glow-primary ${
                  unread ? "border-primary/35 bg-primary/5" : "border-border bg-surface"
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${iconTone(n.icon)}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{n.title}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{n.body}</span>
                  <span className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-primary">
                    {n.action}
                    <span aria-hidden="true">→</span>
                  </span>
                </span>
                {unread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" /> : null}
              </button>
            )
          })}
          {items.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">Nothing here yet.</p>
          ) : null}
        </div>
      </aside>
    </div>
  )
}

export const UNREAD_NOTIFICATION_COUNT = NOTIFICATIONS.filter((n) => n.unread).length
