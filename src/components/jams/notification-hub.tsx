import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  const sheetRef = useRef<HTMLElement>(null)
  const touchStartY = useRef<number | null>(null)
  const touchCurrentY = useRef<number | null>(null)

  const items = useMemo(
    () => (tab === "all" ? NOTIFICATIONS : NOTIFICATIONS.filter((n) => n.category === tab)),
    [tab],
  )

  // Escape key dismiss
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

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
        openModal("menu")
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

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null
    touchCurrentY.current = touchStartY.current
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0]?.clientY ?? null
  }, [])

  const onTouchEnd = useCallback(() => {
    const start = touchStartY.current
    const end = touchCurrentY.current
    if (start != null && end != null && end - start > 80) {
      onClose()
    }
    touchStartY.current = null
    touchCurrentY.current = null
  }, [onClose])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md transition-opacity duration-200 md:items-stretch md:justify-end ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
      role="presentation"
      aria-hidden={!open}
    >
      <aside
        ref={sheetRef}
        className={`flex w-full flex-col rounded-t-3xl border-t border-border bg-surface-2 transition-transform duration-200 md:h-full md:max-w-[360px] md:rounded-none md:border-l md:border-t-0 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Notification hub"
      >
        {/* Mobile grab handle */}
        <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/40 md:hidden" />

        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface-2 px-4 py-4">
          <div className="flex items-center gap-2">
            <BellIcon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold tracking-[0.16em] text-foreground">NOTIFICATIONS</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="sticky top-[57px] z-10 flex gap-2 overflow-x-auto border-b border-border bg-surface-2 px-3 py-3 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                tab === t.id
                  ? "bg-cyan-500 text-white"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable notification list */}
        <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
          <div className="space-y-2">
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
        </div>
      </aside>
    </div>
  )
}

export const UNREAD_NOTIFICATION_COUNT = NOTIFICATIONS.filter((n) => n.unread).length
