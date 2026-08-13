
import type { TabId } from "@/lib/jams/types"
import { useJams } from "./jams-context"
import { BlinksIcon, ChatIcon, HomeIcon, MapIcon, ReelsIcon } from "./icons"

const items: { id: TabId; label: string; Icon: typeof HomeIcon }[] = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "reels", label: "Reels", Icon: ReelsIcon },
  { id: "map", label: "Map", Icon: MapIcon },
  { id: "chat", label: "Chat", Icon: ChatIcon },
  { id: "blinks", label: "Blinks", Icon: BlinksIcon },
]

export function BottomNav() {
  const { activeTab, navigate } = useJams()

  return (
    <nav className="absolute inset-x-0 bottom-0 z-[25] flex shrink-0 justify-between border-t border-border bg-surface px-5 pb-6 pt-3">
      {items.map(({ id, label, Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => navigate(id)}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 ${active ? "text-primary" : "text-muted-foreground"}`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
