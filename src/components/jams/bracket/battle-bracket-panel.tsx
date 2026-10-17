import { useEffect, useRef, useState } from "react"
import { Eye, List, Network, Trophy, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUND_LABELS } from "@/lib/jams/brackets"
import { useJams } from "../jams-context"
import { MatchupCard } from "./matchup-card"
import { BracketTree } from "./bracket-tree"

export function BattleBracketDrawer() {
  const { brackets, bracketOpen, closeBrackets } = useJams()
  const [category, setCategory] = useState("bboy")
  const [view, setView] = useState<"cards" | "tree">("cards")
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!bracketOpen) return
    const previous = document.activeElement
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeBrackets()
    }
    document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("keydown", onKey); if (previous instanceof HTMLElement) previous.focus() }
  }, [bracketOpen, closeBrackets])
  const bracket = brackets.find(item => item.id === category)
  if (!bracketOpen || !bracket) return null
  const completed = bracket.matches.filter(match => match.status === "completed").length
  const final = bracket.matches.find(match => match.roundId === "finals")
  const champion = final?.winnerId ? [final.red, final.blue].find(dancer => dancer?.id === final.winnerId) : undefined
  return <section role="dialog" aria-modal="true" aria-label="Live Battle Brackets" className="absolute inset-0 z-[80] flex flex-col overflow-hidden bg-background motion-safe:animate-slide-up">
    <header className="shrink-0 border-b border-border bg-surface px-4 pb-4 pt-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase text-gold">Sample tournament</p><h2 className="mt-1 text-xl font-extrabold">Live Brackets</h2><p className="mt-1 text-xs text-muted-foreground">{bracket.eventTitle}</p></div>
        <Button ref={closeRef} variant="secondary" size="icon" onClick={closeBrackets} aria-label="Close brackets"><X /></Button>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground"><span>{completed} / {bracket.matches.length} battles completed</span><span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {bracket.viewers}</span></div>
      <div className="mt-2 flex gap-1" aria-label={`${completed} of ${bracket.matches.length} battles completed`}>{bracket.matches.map(match => <span key={match.id} className={`h-1 flex-1 rounded-full ${match.status === "completed" ? "bg-gold" : match.status === "live" ? "bg-accent" : "bg-border"}`} />)}</div>
    </header>
    <div className="shrink-0 border-b border-border px-4 py-3">
      <div className="flex gap-2">{brackets.map(item => <Button key={item.id} size="sm" variant={item.id === category ? "default" : "secondary"} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.category}</Button>)}</div>
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
        <Button size="sm" variant="ghost" aria-pressed={view === "cards"} onClick={() => setView("cards")} className={view === "cards" ? "bg-surface text-foreground" : "text-muted-foreground"}><List /> Matchup Cards</Button>
        <Button size="sm" variant="ghost" aria-pressed={view === "tree"} onClick={() => setView("tree")} className={view === "tree" ? "bg-surface text-foreground" : "text-muted-foreground"}><Network /> Tournament Tree</Button>
      </div>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
      <div className="mb-4 flex items-center justify-between"><span className="text-xs font-bold">{champion ? "Champion crowned" : ROUND_LABELS[bracket.currentStage]}</span><span className="flex items-center gap-1 text-xs font-bold text-gold"><Trophy className="h-3.5 w-3.5" /> ${bracket.prizePool} prize pool</span></div>
      {champion ? <p className="mb-4 border-y border-gold/40 py-3 text-center text-sm font-bold text-gold">{champion.displayName} · 1st place</p> : null}
      {view === "tree" ? <BracketTree bracket={bracket} /> : <div className="space-y-5">{bracket.rounds.map(round => <section key={round}><h3 className="mb-2 text-[11px] font-bold uppercase text-muted-foreground">{ROUND_LABELS[round]}</h3><div className="space-y-3">{bracket.matches.filter(match => match.roundId === round).map(match => <MatchupCard key={match.id} match={match} />)}</div></section>)}</div>}
    </div>
  </section>
}