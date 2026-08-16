
import { useSponsors } from "@/lib/jams/data"

export function SponsorTicker() {
  const sponsors = useSponsors()
  // Duplicate the list so the -50% translate loop is seamless.
  const loop = [...sponsors, ...sponsors]

  return (
    <div className="mb-6 w-full overflow-hidden border-y border-border/60 bg-secondary/60 py-2.5">
      <div className="inline-block animate-scroll-ticker whitespace-nowrap">
        {loop.map((sponsor, i) => (
          <span
            key={`${sponsor.id}-${i}`}
            className="inline-flex items-center gap-2 px-5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <span className="text-primary" aria-hidden="true">
              ●
            </span>
            {sponsor.label}: <span className="text-gold">{sponsor.highlight}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
