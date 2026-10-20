
import { useEvents, useMapMarkers } from "@/lib/jams/data"
import { useJams } from "../jams-context"
import { SponsorTicker } from "../sponsor-ticker"
import { StoriesRail } from "../stories-rail"
import { Button } from "@/components/ui/button"
import { Network } from "lucide-react"

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{children}</h2>
  )
}

export function HomeView() {
  const events = useEvents()
  const markers = useMapMarkers()
  const { navigate, openEvent, openStream, showToast, openWelcome, dancerProfile, openBrackets, brackets, openModal } = useJams()
  const liveMatch = brackets[0]?.matches.find(match => match.status === "live")

  const featured = events.find((e) => e.isFeatured) ?? events[0]
  const featuredMarker = markers.find((marker) => marker.id === featured?.mapMarkerId)

  return (
    <div className="animate-fade-in">
      {dancerProfile ? null : (
        <div className="mb-5 rounded-2xl border border-gold/40 bg-gold/10 p-[18px]">
          <h3 className="mb-1 text-[15px] font-bold text-foreground">New here?</h3>
          <p className="mb-3.5 text-xs leading-relaxed text-muted-foreground">
            Take three quick steps so we can show jams near you, in your styles.
          </p>
          <button
            type="button"
            onClick={openWelcome}
            className="w-full rounded-xl bg-gold py-3 text-[13px] font-bold text-background"
          >
            Set up my profile
          </button>
        </div>
      )}

      <SectionHeader>Live Feed &amp; Stories</SectionHeader>
      <StoriesRail />

      <SectionHeader>Featured Activation</SectionHeader>
      <div className="surface-card mb-5 rounded-2xl p-[18px]">
        <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold">
          Upcoming Activation
        </span>
        <h3 className="mb-1 text-[15px] font-bold text-card-foreground">
          {featuredMarker ? <Button variant="link" onClick={() => openEvent(featuredMarker)} className="h-auto w-full justify-start whitespace-normal p-0 text-left text-[15px] font-bold text-card-foreground">{featured?.title}</Button> : featured?.title}
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          {featured?.day} {featured?.month} • {featured?.time} • {featured?.location}
        </p>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{featured?.description}</p>
        {featuredMarker ? <Button variant="link" onClick={() => openEvent(featuredMarker)} className="mb-3 h-auto p-0 text-xs text-gold">View event details →</Button> : null}
        {liveMatch ? <div className="mb-3 flex items-start gap-2 text-[11px] text-foreground"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent motion-safe:animate-pulse-live" /><span>Live: {liveMatch.red?.displayName} vs {liveMatch.blue?.displayName}</span></div> : null}
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
        <Button onClick={openBrackets} variant="outline" className="mt-2.5 h-11 w-full border-gold/50 text-gold hover:bg-gold/10 hover:text-gold"><Network /> Live Brackets</Button>
      </div>

      <SponsorTicker />

      <SectionHeader>Host Your Own</SectionHeader>
      <div className="mb-2 rounded-2xl border border-dashed border-border bg-secondary/60 p-[18px] text-center">
        <h3 className="mb-1 text-base font-bold">Don&apos;t see your city?</h3>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground text-pretty">
          Step up and host your own community event. Drop a pin and gather local interest.
        </p>
        <button
          type="button"
          onClick={() => openModal("propose")}
          className="w-full rounded-xl border border-primary/60 py-3 text-[13px] font-bold text-primary transition-all hover:border-primary hover:glow-primary"
        >
          Propose a Jam
        </button>
      </div>
    </div>
  )
}

