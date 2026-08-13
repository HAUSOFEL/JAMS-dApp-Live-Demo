
import { useEvents } from "@/lib/jams/data"
import { useJams } from "../jams-context"
import { SponsorTicker } from "../sponsor-ticker"
import { StoriesRail } from "../stories-rail"
import { BookmarkIcon } from "../icons"

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{children}</h2>
  )
}

export function HomeView() {
  const events = useEvents()
  const { navigate, openStream, toggleSavedEvent, savedEventIds, showToast } = useJams()

  const featured = events.find((e) => e.isFeatured) ?? events[0]
  const upcoming = events.filter((e) => e.id !== featured?.id)

  return (
    <div className="animate-fade-in">
      <SectionHeader>Live Feed &amp; Stories</SectionHeader>
      <StoriesRail />

      <SponsorTicker />

      <SectionHeader>Featured Activation</SectionHeader>
      <div className="mb-5 rounded-2xl border border-border bg-card p-[18px]">
        <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase text-primary">
          Upcoming Activation
        </span>
        <h3 className="mb-1 text-[15px] font-bold text-card-foreground">{featured?.title}</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          {featured?.day} {featured?.month} • {featured?.time} • {featured?.location}
        </p>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{featured?.description}</p>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => openStream("r1")}
            className="flex-1 rounded-xl bg-primary py-3 text-[13px] font-bold text-primary-foreground"
          >
            Tune In Live
          </button>
          <button
            type="button"
            onClick={() => navigate("map")}
            className="flex-1 rounded-xl border border-primary py-3 text-[13px] font-bold text-primary"
          >
            View On Map
          </button>
        </div>
      </div>

      <SectionHeader>Upcoming Breaker Sessions</SectionHeader>
      {upcoming.map((event) => {
        const saved = savedEventIds.includes(event.id)
        return (
          <div
            key={event.id}
            className="mb-3 flex items-center justify-between gap-3.5 rounded-xl border border-transparent bg-surface-2 p-3 transition-colors hover:border-border"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-[50px] w-[50px] flex-col items-center justify-center rounded-lg bg-secondary text-xs font-bold leading-tight">
                <span>{event.month}</span>
                <span className="text-base">{event.day}</span>
              </div>
              <div>
                <h4 className="mb-0.5 text-sm font-bold">{event.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {event.location} • {event.time}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSavedEvent(event.id)}
              aria-label={saved ? "Remove saved event" : "Save event"}
              aria-pressed={saved}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary ${
                saved ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <BookmarkIcon className="h-5 w-5" />
            </button>
          </div>
        )
      })}

      <SectionHeader>Host Your Own</SectionHeader>
      <div className="mb-2 rounded-2xl border border-dashed border-border bg-secondary/60 p-[18px] text-center">
        <h3 className="mb-1 text-base font-bold">Don&apos;t see your city?</h3>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground text-pretty">
          Step up and host your own community event. Drop a pin and gather local interest.
        </p>
        <button
          type="button"
          onClick={() => {
            navigate("chat")
            showToast("Opened LFG / Propose a Jam channel")
          }}
          className="w-full rounded-xl border border-primary py-3 text-[13px] font-bold text-primary"
        >
          Propose a Jam
        </button>
      </div>
    </div>
  )
}
