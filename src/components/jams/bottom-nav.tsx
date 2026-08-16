import type { TabId } from "@/lib/jams/types";
import meAvatar from "@/assets/me-avatar.jpg"
import { useJams } from "./jams-context";
import { ChatIcon, HomeIcon, MapIcon, ReelsIcon } from "./icons";

type NavItem =
  | { id: TabId; label: string; Icon: typeof HomeIcon }
  | { id: TabId; label: string; isAvatar: true };

const items: NavItem[] = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "reels", label: "Reels", Icon: ReelsIcon },
  { id: "profile", label: "Profile", isAvatar: true },
  { id: "chat", label: "Chat", Icon: ChatIcon },
  { id: "map", label: "Map", Icon: MapIcon },
];

export function BottomNav() {
  const { activeTab, navigate, profileCreatorId } = useJams();

  return (
    <nav className="absolute inset-x-0 bottom-0 z-[35] flex shrink-0 justify-between border-t border-border bg-surface/95 px-5 pb-6 pt-3 backdrop-blur">
      {items.map((item) => {
        const { id, label } = item;
        const active = activeTab === id && !profileCreatorId;
        return (
          <button
            key={id}
            type="button"
            onClick={() => navigate(id)}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-1 flex-col items-center gap-1 transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {active ? (
              <span
                aria-hidden="true"
                className="bg-gradient-primary absolute -top-3 h-0.5 w-8 rounded-full"
              />
            ) : null}
            {"isAvatar" in item ? (
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                  active
                    ? "glow-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "ring-1 ring-transparent"
                }`}
              >
                <img
                  src={meAvatar}
                  alt={label}
                  className="h-full w-full rounded-full object-cover"
                  width={32}
                  height={32}
                  loading="eager"
                />
              </span>
            ) : (
              (() => {
                const Icon = item.Icon;
                return <Icon className="h-6 w-6" />;
              })()
            )}
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

