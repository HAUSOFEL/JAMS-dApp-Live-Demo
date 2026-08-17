// Domain types for the JAMS engine.
// These are intentionally shaped to map 1:1 onto Supabase tables so the mock
// data layer in `data.ts` can be swapped for real-time queries with no changes
// to the UI components that consume them.

export type TabId = "home" | "reels" | "profile" | "chat" | "map" | "blinks"

export type ModalId = "wallet" | "menu" | "creator" | "tip" | null

/** Maps to a `profiles` / `creators` row. */
export interface Creator {
  id: string
  handle: string
  displayName: string
  /** Single-letter / short avatar fallback used by the story + reel rings. */
  initials: string
  accentColor?: string
  /** Optional profile picture for the creator. */
  avatarUrl?: string
}

/** Maps to a `stories` view joined with live `streams`. Drives the IG-style rail. */
export interface Story {
  id: string
  creator: Creator
  isLive: boolean
  /** Optional link into a specific reel/stream when tapped. */
  streamId?: string
}

/** Maps to a `streams` row. Drives the endless Reels feed. */
export interface Reel {
  id: string
  creator: Creator
  title: string
  subtitle: string
  /** e.g. "Live Session", "Community Clip", "Scratch Session". */
  tag: string
  isLive: boolean
  viewers?: number
  likes: number
  /** Gradient used as the video poster placeholder until a real HLS/WebRTC feed is wired. */
  gradient: string
}

/** Maps to an `events` row. */
export interface JamEvent {
  id: string
  title: string
  location: string
  description: string
  month: string
  day: string
  time: string
  isFeatured?: boolean
}

/** Maps to an `event_locations` row for the unified interactive map. */
export interface MapMarker {
  id: string
  title: string
  description: string
  label: string
  /** Percentage coordinates within the map canvas (0-100). */
  x: number
  y: number
  variant: "live" | "hub"
  linkedStreamId?: string
  /** Human-readable schedule badge, e.g. "Today · 6:00 PM". */
  time?: string
}

/** Maps to a `chat_channels` row. */
export interface ChatChannel {
  id: string
  name: string
  description: string
  membersOnline?: number
  highlighted?: boolean
  icon?: string
}

/** Maps to a `crew_portals` row — embedded dApp browser / Blink endpoints. */
export interface CrewPortal {
  id: string
  name: string
  url: string
  description: string
}

/** A single tile in the Instagram-style creator profile grid. Maps to a `posts` row. */
export interface ProfilePost {
  id: string
  gradient: string
  likes: number
  isLive?: boolean
  isReel?: boolean
  /** Optional link into the Reels feed when tapped. */
  streamId?: string
}

/** Maps to a `profiles` row joined with aggregate counts. Drives the Creator Profile view. */
export interface CreatorProfile {
  creator: Creator
  bio: string
  crew?: string
  location?: string
  stats: { posts: number; followers: number; following: number }
  posts: ProfilePost[]
}

/** Maps to a `sponsors` row for the marquee ticker. */
export interface Sponsor {
  id: string
  name: string
  featured?: boolean
}


/** Maps to a realtime `stream_comments` row. */
export interface Comment {
  id: string
  author: string
  text: string
  createdAt: number
}

export interface WalletSession {
  address: string
  chain: string
  balanceSol: number
}
