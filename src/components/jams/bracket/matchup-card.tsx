import { Trophy, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUND_LABELS } from "@/lib/jams/brackets"
import type { BracketCompetitor, BracketMatch } from "@/lib/jams/types"
import { useJams } from "../jams-context"

export function MatchStatus({ match }: { match: BracketMatch }) {
  const label = { live: "Live Now", on_deck: "On Deck", completed: "Completed", upcoming: "Upcoming" }[match.status]
  return <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${match.status === "live" ? "text-accent" : match.status === "upcoming" ? "text-muted-foreground" : "text-gold"}`}>
    {match.status === "live" ? <span className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pulse-live" /> : match.status === "completed" ? <Trophy className="h-3 w-3" /> : null}
    {label}
  </span>
}

function Dancer({ dancer, corner, winner, compact, source }: { dancer?: BracketCompetitor; corner: "red" | "blue"; winner: boolean; compact: boolean; source?: string }) {
  const { openProfile } = useJams()
  if (!dancer) return <div className={`flex min-w-0 items-center gap-2 ${compact ? "py-2" : "flex-col py-4 text-center"}`}>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">?</span>
    <span className="text-[11px] text-muted-foreground">{source ?? "Awaiting winner"}</span>
  </div>
  return <Button variant="ghost" onClick={() => openProfile(dancer.creatorId)} aria-label={`View @${dancer.handle}`} className={`h-auto min-w-0 justify-start whitespace-normal px-1 hover:bg-secondary ${compact ? "gap-2 py-2" : "flex-col gap-2 py-3 text-center"}`}>
    <span className={`relative flex shrink-0 items-center justify-center rounded-full border-2 bg-secondary ${compact ? "h-9 w-9" : "h-14 w-14"} ${winner ? "border-gold" : corner === "red" ? "border-accent" : "border-primary"}`}>
      {dancer.avatarUrl ? <img src={dancer.avatarUrl} alt={dancer.displayName} className="h-full w-full rounded-full object-cover" /> : <span>{dancer.displayName.slice(0, 1)}</span>}
      {winner ? <Trophy className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gold p-0.5 text-gold-foreground" /> : null}
    </span>
    <span className="min-w-0">
      <span className={`block break-words text-xs font-bold ${winner ? "text-gold" : "text-foreground"}`}>{dancer.displayName}</span>
      <span className="block break-all text-[10px] font-normal text-muted-foreground">@{dancer.handle}</span>
      {!compact && dancer.crewName ? <span className="mt-1 block text-[9px] font-normal text-muted-foreground">{dancer.crewName}</span> : null}
    </span>
  </Button>
}

export function MatchupCard({ match, compact = false }: { match: BracketMatch; compact?: boolean }) {
  return <article aria-label={`${ROUND_LABELS[match.roundId]} match ${match.matchNumber}`} className={`min-w-0 rounded-lg border bg-card p-3 ${match.status === "live" ? "border-accent/70" : match.winnerId ? "border-gold/40" : "border-border"}`}>
    <div className="flex items-center justify-between gap-1"><span className="text-[10px] text-muted-foreground">{compact ? `Battle ${match.matchNumber}` : `${ROUND_LABELS[match.roundId]} · ${match.matchNumber}`}</span><MatchStatus match={match} /></div>
    <div className={compact ? "mt-1" : "mt-2 grid grid-cols-[1fr_28px_1fr] items-start"}>
      <Dancer dancer={match.red} corner="red" winner={Boolean(match.winnerId && match.winnerId === match.red?.id)} compact={compact} source={match.sourceMatchIds ? `Winner ${match.sourceMatchIds[0].split("-")[1]?.toUpperCase()}` : undefined} />
      {!compact ? <span className="pt-8 text-center text-[10px] font-bold text-muted-foreground">VS</span> : null}
      <Dancer dancer={match.blue} corner="blue" winner={Boolean(match.winnerId && match.winnerId === match.blue?.id)} compact={compact} source={match.sourceMatchIds ? `Winner ${match.sourceMatchIds[1].split("-")[1]?.toUpperCase()}` : undefined} />
    </div>
    <div className="flex items-center justify-between gap-2 border-t border-border pt-2 text-[10px] text-muted-foreground">
      {match.status === "completed" ? <span className="font-bold text-gold">{match.score.red} – {match.score.blue} · Final votes</span> : <span>{match.extraRound ? "One more round" : match.scheduledTime}</span>}
      {match.status === "live" ? <span className="flex items-center gap-1 text-accent"><Volume2 className="h-3 w-3" /> On stage</span> : null}
    </div>
  </article>
}