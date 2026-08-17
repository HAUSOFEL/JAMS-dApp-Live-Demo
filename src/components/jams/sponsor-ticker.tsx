
import { useSponsors } from "@/lib/jams/data"

export function SponsorTicker() {
  const sponsors = useSponsors()
  // Duplicate the list so the -50% translate loop is seamless.
  const loop = [...sponsors, ...sponsors]

  return (
    <div className="mb-6 w-full overflow-hidden border-y border-border/60 bg-secondary/60 py-3">
      <div className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Community & Ecosystem Partners
      </div>
      <div className="inline-block animate-scroll-ticker whitespace-nowrap">
        {loop.map((sponsor, i) => (
          <span
            key={`${sponsor.id}-${i}`}
            className={`mx-2 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wide text-black shadow-sm ${
              sponsor.featured
                ? "border-gold bg-white"
                : "border-border/40 bg-white"
            }`}
          >
            {sponsor.featured && (
              <span className="text-gold" aria-hidden="true">
                ★
              </span>
            )}
            {sponsor.name}
          </span>
        ))}
      </div>
    </div>
  )
}
