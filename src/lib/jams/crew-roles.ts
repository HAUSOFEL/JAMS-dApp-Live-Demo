export type CrewRoleId = "organizer" | "judge" | "dj_mc" | "gate" | "dancer"

/** What the role's pinned hero action opens. */
export type CrewRoleHero = "dashboard" | "events" | "scanner" | "brackets"

export interface CrewRole {
  id: CrewRoleId
  title: string
  description: string
  tags: string[]
  hero: CrewRoleHero
  heroLabel: string
}

export const CREW_ROLES: CrewRole[] = [
  { id: "organizer", title: "Head Organizer", description: "Run the whole event: brackets, prizes, staff and schedule.", tags: ["Master Control", "Prize Vault"], hero: "dashboard", heroLabel: "Open Organizer Dashboard" },
  { id: "judge", title: "Judge / Official", description: "Score live battles with 1-tap votes.", tags: ["1-Tap Judging", "Live Brackets"], hero: "dashboard", heroLabel: "Open Judges Panel" },
  { id: "dj_mc", title: "DJ / MC", description: "Call battles to stage and keep the night on time.", tags: ["Stage Cues", "Run-of-Show"], hero: "events", heroLabel: "Open Stage & DJ Cues" },
  { id: "gate", title: "Door / Gate Staff", description: "Check in tickets and register walk-ups at the door.", tags: ["Camera Scanner", "Walk-Ups"], hero: "scanner", heroLabel: "Open QR Gate Scanner" },
  { id: "dancer", title: "Dancer / Competitor", description: "Follow your battles, tickets and bracket progress.", tags: ["My Battles", "Tickets"], hero: "brackets", heroLabel: "View Live Brackets" },
]

export function isCrewRole(value: unknown): value is CrewRoleId {
  return CREW_ROLES.some((r) => r.id === value)
}

export function getCrewRole(id: CrewRoleId): CrewRole {
  return CREW_ROLES.find((r) => r.id === id) ?? CREW_ROLES[0]!
}
