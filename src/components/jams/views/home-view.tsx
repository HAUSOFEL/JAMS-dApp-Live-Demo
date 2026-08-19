
import { useEvents } from "@/lib/jams/data"
import { useJams } from "../jams-context"
import { SponsorTicker } from "../sponsor-ticker"
import { StoriesRail } from "../stories-rail"

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{children}</h2>
  )
}

export function HomeView() {
  const events = useEvents()
  const { navigate, openStream, showToast } = useJams()

  const featured = events.find((e) => e.isFeatured) ?? events[0]

  return (
    <div className="animate-fade-in">
      <SectionHeader>Live Feed &amp; Stories</SectionHeader>
      <StoriesRail />

      <SectionHeader>Featured Activation</SectionHeader>
      <div className="surface-card mb-5 rounded-2xl p-[18px]">
        <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold">
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
            className="bg-gradient-primary flex-1 rounded-xl py-3 text-[13px] font-bold text-primary-foreground transition-shadow hover:glow-primary"
          >
            Tune In Live
          </button>
          <button
            type="button"
            onClick={() => navigate("map")}
            className="flex-1 rounded-xl border border-primary/60 py-3 text-[13px] font-bold text-primary transition-all hover:border-primary hover:glow-primary"
          >
            View On Map
          </button>
        </div>
      </div>

      <SponsorTicker />

      <SectionHeader>Host Your Own</SectionHeader>
      <div className="mb-2 rounded-2xl border border-dashed border-border bg-[#091B36]/60 p-[18px] text-center">
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
          className="w-full rounded-xl border border-primary/60 py-3 text-[13px] font-bold text-primary transition-all hover:border-primary hover:glow-primary"
        >
          Propose a Jam
        </button>
      </div>
    </div>
  )
}

