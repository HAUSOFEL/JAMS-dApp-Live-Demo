import type { BattleBracket } from "@/lib/jams/types"
import { ROUND_LABELS } from "@/lib/jams/brackets"
import { MatchupCard } from "./matchup-card"

export function BracketTree({ bracket }: { bracket: BattleBracket }) {
  return <div className="overflow-x-auto pb-4" aria-label="Tournament progression">
    <div className="flex w-max gap-8 pr-2">
      {bracket.rounds.map((round, index) => <section key={round} className="relative w-[220px] shrink-0">
        <h3 className="mb-3 text-xs font-bold text-foreground">{ROUND_LABELS[round]}</h3>
        <div className="grid h-[832px] auto-rows-fr">
          {bracket.matches.filter(match => match.roundId === round).map(match => <div key={match.id} className="relative flex items-center">
            <div className="w-full"><MatchupCard match={match} compact /></div>
          </div>)}
        </div>
        {index < 2 ? <svg className="pointer-events-none absolute left-full top-7 h-[832px] w-8 text-border" viewBox="0 0 32 832" aria-hidden="true">
          {(index === 0 ? [0, 416] : [0]).map(offset => {
            const half = index === 0 ? 208 : 416
            return <path key={offset} d={`M0 ${offset + half / 2} H16 V${offset + half * 1.5} H0 M16 ${offset + half} H32`} fill="none" stroke="currentColor" strokeWidth="2" />
          })}
        </svg> : null}
      </section>)}
    </div>
  </div>
}