import { mockProfiles } from "./mock-data"
import type { BattleBracket, BracketCompetitor, BracketMatch, BracketVote } from "./types"

export const ROUND_LABELS = { quarterfinals: "Quarterfinals", semifinals: "Semifinals", finals: "Finals" }

function competitor(creatorId: string, seed: number): BracketCompetitor {
  const profile = mockProfiles[creatorId]
  if (!profile) throw new Error(`Missing bracket creator: ${creatorId}`)
  return {
    id: creatorId, creatorId, seed,
    displayName: profile.creator.displayName,
    handle: profile.creator.handle,
    avatarUrl: profile.creator.avatarUrl,
    crewName: profile.crew,
  }
}

function seedBracket(id: string, category: string, ids: string[], prizePool: number): BattleBracket {
  const dancers = ids.map(competitor)
  const matches: BracketMatch[] = Array.from({ length: 4 }, (_, i) => ({
    id: `${id}-q${i + 1}`, roundId: "quarterfinals", matchNumber: i + 1,
    red: dancers[i * 2], blue: dancers[i * 2 + 1],
    score: { red: i < 2 ? 3 : 0, blue: i < 2 ? 1 : 0 },
    status: i < 2 ? "completed" : i === 2 ? "live" : "on_deck",
    winnerId: i < 2 ? dancers[i * 2]?.id : undefined,
    scheduledTime: ["6:00 PM", "6:10 PM", "6:20 PM", "6:30 PM"][i] ?? "6:00 PM",
  }))
  matches.push(
    { id: `${id}-s1`, roundId: "semifinals", matchNumber: 1, red: dancers[0], blue: dancers[2], sourceMatchIds: [`${id}-q1`, `${id}-q2`], score: { red: 0, blue: 0 }, status: "upcoming", scheduledTime: "6:45 PM" },
    { id: `${id}-s2`, roundId: "semifinals", matchNumber: 2, sourceMatchIds: [`${id}-q3`, `${id}-q4`], score: { red: 0, blue: 0 }, status: "upcoming", scheduledTime: "7:00 PM" },
    { id: `${id}-f1`, roundId: "finals", matchNumber: 1, sourceMatchIds: [`${id}-s1`, `${id}-s2`], score: { red: 0, blue: 0 }, status: "upcoming", scheduledTime: "7:30 PM" },
  )
  return { id, category, eventTitle: "Waterloo Open Streets Jam", currentStage: "quarterfinals", rounds: ["quarterfinals", "semifinals", "finals"], matches, prizePool, viewers: 142 }
}

// Sample tournament only: no hosted feed or official competitor identities.
export const initialBrackets = [
  seedBracket("bboy", "1v1 B-Boy", ["kwb", "urban", "flex", "shadow", "to", "me", "aria", "vans"], 750),
  seedBracket("bgirl", "1v1 B-Girl", ["aria", "vans", "urban", "to", "me", "shadow", "flex", "kwb"], 750),
]

/** A demo judge decision completes a match and propagates its winner exactly once. */
export function applyBracketVote(bracket: BattleBracket, matchId: string, vote: BracketVote): BattleBracket {
  const match = bracket.matches.find((item) => item.id === matchId)
  if (!match || match.status !== "live" || !match.red || !match.blue) return bracket
  if (vote === "tie") return { ...bracket, matches: bracket.matches.map((item) => item.id === matchId ? { ...item, extraRound: true } : item) }
  const winner = vote === "red" ? match.red : match.blue
  const matches = bracket.matches.map((item): BracketMatch => {
    if (item.id === matchId) return { ...item, status: "completed", winnerId: winner.id, extraRound: false, score: { red: vote === "red" ? 3 : 1, blue: vote === "blue" ? 3 : 1 } }
    if (item.sourceMatchIds?.includes(matchId)) {
      return { ...item, ...(item.sourceMatchIds[0] === matchId ? { red: winner } : { blue: winner }) }
    }
    return { ...item }
  })
  const ready = matches.filter((item) => item.status !== "completed" && item.red && item.blue)
  const next = ready[0]
  for (const item of matches) {
    if (item.status !== "completed") item.status = item.id === next?.id ? "live" : item.id === ready[1]?.id ? "on_deck" : "upcoming"
  }
  return { ...bracket, matches, currentStage: next?.roundId ?? "finals" }
}