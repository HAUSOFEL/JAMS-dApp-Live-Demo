import meAvatar from "@/assets/me-avatar.jpg"
import type {
  ChatChannel,
  Creator,
  CreatorProfile,
  CrewPortal,
  JamEvent,
  MapMarker,
  ProfilePost,
  Reel,
  Sponsor,
  Story,
  WalletSession,
} from "./types"

// Seed data mirroring the shape of the eventual Supabase tables.
// Replace the `data.ts` hooks with real queries/subscriptions to go live.

const creators = {
  me: { id: "me", handle: "dancer_jams", displayName: "Alex JAMS", initials: "A", avatarUrl: meAvatar },
  kwb: { id: "kwb", handle: "kwbreakers", displayName: "KW Breakers", initials: "K" },
  aria: { id: "aria", handle: "bgirl_aria", displayName: "BGirl Aria", initials: "A", accentColor: "oklch(0.5 0.21 22)" },
  urban: { id: "urban", handle: "urban_cypher", displayName: "Urban Cypher", initials: "U" },
  flex: { id: "flex", handle: "bboyflex", displayName: "Bboy Flex", initials: "F" },
  shadow: { id: "shadow", handle: "dj_shadow", displayName: "DJ Shadow", initials: "D" },
  vans: { id: "vans", handle: "vans_undgrd", displayName: "Vans Undgrd", initials: "V" },
  to: { id: "to", handle: "to_cypher", displayName: "TO Cypher", initials: "TO" },
} satisfies Record<string, Creator>

export const mockStories: Story[] = [
  { id: "s1", creator: creators.kwb, isLive: true, streamId: "r1" },
  { id: "s2", creator: creators.aria, isLive: true, streamId: "r2" },
  { id: "s3", creator: creators.urban, isLive: true, streamId: "r3" },
  { id: "s4", creator: creators.shadow, isLive: false },
  { id: "s5", creator: creators.vans, isLive: false },
  { id: "s6", creator: creators.to, isLive: false },
]

export const mockReels: Reel[] = [
  {
    id: "r1",
    creator: creators.kwb,
    title: "KWB Live Activation",
    subtitle: "Waterloo Open Streets Stage 1",
    tag: "Live Session",
    isLive: true,
    viewers: 1200,
    likes: 3400,
    gradient: "linear-gradient(135deg, #220000, #111)",
  },
  {
    id: "r2",
    creator: creators.aria,
    title: "BGirl Aria Power Set",
    subtitle: "Main Stage • Windmill finals",
    tag: "Live Session",
    isLive: true,
    viewers: 842,
    likes: 2100,
    gradient: "linear-gradient(135deg, #2a1a00, #111)",
  },
  {
    id: "r3",
    creator: creators.flex,
    title: "Power-Move Masterclass",
    subtitle: "Uploaded by @bboyflex",
    tag: "Community Clip",
    isLive: false,
    likes: 980,
    gradient: "linear-gradient(135deg, #002211, #111)",
  },
  {
    id: "r4",
    creator: creators.shadow,
    title: "DJ Shadow Live Beat Set",
    subtitle: "Underground Vault Stage",
    tag: "Scratch Session",
    isLive: false,
    likes: 1550,
    gradient: "linear-gradient(135deg, #222200, #111)",
  },
]

export const mockEvents: JamEvent[] = [
  {
    id: "e1",
    title: "Waterloo Open Streets Jam",
    location: "Waterloo Public Square",
    description: "Main stage breaking session hosted by KWB with live DJ sets.",
    month: "AUG",
    day: "12",
    time: "2:00 PM - 8:00 PM",
    isFeatured: true,
  },
  {
    id: "e2",
    title: "Waterloo Cypher Jam",
    location: "Square One Stage",
    description: "Open cypher across all styles. Judges from the KW scene.",
    month: "AUG",
    day: "14",
    time: "4:00 PM",
  },
  {
    id: "e3",
    title: "Red Bull BC One Qualifiers",
    location: "Kitchener Youth Arts Center",
    description: "Regional qualifier bracket. Winner advances to nationals.",
    month: "AUG",
    day: "21",
    time: "6:00 PM",
  },
]

export const mockMapMarkers: MapMarker[] = [
  {
    id: "m1",
    title: "Waterloo Open Streets Stage 1",
    description: "Live breaking cypher competition with instant tipping stream.",
    label: "Stage 1: Live Cypher",
    x: 30,
    y: 34,
    variant: "live",
    linkedStreamId: "r1",
    time: "Live now · until 9:00 PM",
  },
  {
    id: "m2",
    title: "Kitchener Youth Arts Center",
    description: "Workshop and floor practice hub. Open to all levels.",
    label: "KWC Practice Hub",
    x: 68,
    y: 60,
    variant: "hub",
    time: "Today · 6:00 PM – 10:00 PM",
  },
  {
    id: "m3",
    title: "Toronto Cypher",
    description: "Underground concrete jam at the Square. Open to all styles.",
    label: "TO Cypher",
    x: 52,
    y: 78,
    variant: "hub",
    time: "Sat · 8:00 PM – Late",
  },
]

export const mockChannels: ChatChannel[] = [
  {
    id: "c1",
    name: "waterloo-open-streets",
    description: "Live event chat & updates",
    membersOnline: 142,
    icon: "#",
  },
  {
    id: "c2",
    name: "Red Bull BC One Qualifiers",
    description: "Active room • qualifier bracket talk",
    membersOnline: 89,
    icon: "#",
  },
  {
    id: "c3",
    name: "LFG / Propose a Jam",
    description: "Drop a pin, request a host & build hype",
    highlighted: true,
    icon: "📍",
  },
]

export const mockPortals: CrewPortal[] = [
  {
    id: "p1",
    name: "KW Breakers Inc.",
    url: "https://www.kwbreakers.com",
    description:
      "Kitchener-Waterloo's premier breaking crew offering event entertainment, breaking workshops, and underground jams.",
  },
]

export const mockSponsors: Sponsor[] = [
  { id: "sp1", label: "Official Partner", highlight: "Red Bull" },
  { id: "sp2", label: "Collab", highlight: "Solana Culture" },
  { id: "sp3", label: "Powered By", highlight: "Vans Underground" },
  { id: "sp4", label: "Community", highlight: "Kitchener Arts Council" },
]

// Gradient palette reused for profile grid tiles until real thumbnails are wired.
const gridGradients = [
  "linear-gradient(135deg, #220000, #111)",
  "linear-gradient(135deg, #2a1a00, #111)",
  "linear-gradient(135deg, #002211, #111)",
  "linear-gradient(135deg, #222200, #111)",
  "linear-gradient(135deg, #1a0022, #111)",
  "linear-gradient(135deg, #001a2a, #111)",
]

function buildPosts(seed: number, count: number, liveStreamId?: string): ProfilePost[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p-${seed}-${i}`,
    gradient: gridGradients[(seed + i) % gridGradients.length]!,
    likes: 120 + ((seed * 37 + i * 53) % 4000),
    isReel: (i + seed) % 3 === 0,
    isLive: i === 0 && Boolean(liveStreamId),
    ...(i === 0 && liveStreamId ? { streamId: liveStreamId } : {}),
  }))
}

export const mockProfiles: Record<string, CreatorProfile> = {
  me: {
    creator: creators.me,
    crew: "JAMS Crew",
    location: "Kitchener–Waterloo, ON",
    bio: "Dancer, event host, and JAMS early user. Tracking the local scene one jam at a time.",
    stats: { posts: 47, followers: 1240, following: 210 },
    posts: buildPosts(8, 9),
  },
  kwb: {
    creator: creators.kwb,
    crew: "KW Breakers Inc.",
    location: "Kitchener–Waterloo, ON",
    bio: "Region's premier breaking crew. Live activations, workshops & underground jams. Powered on Solana.",
    stats: { posts: 128, followers: 24800, following: 92 },
    posts: buildPosts(1, 12, "r1"),
  },
  aria: {
    creator: creators.aria,
    crew: "KW Breakers Inc.",
    location: "Waterloo, ON",
    bio: "BGirl • Windmill specialist • 3x regional finalist. Catch me on the main stage.",
    stats: { posts: 96, followers: 18200, following: 140 },
    posts: buildPosts(2, 12, "r2"),
  },
  urban: {
    creator: creators.urban,
    location: "Toronto, ON",
    bio: "Documenting the cypher. Clips, sets & street culture across the 6ix.",
    stats: { posts: 210, followers: 41500, following: 310 },
    posts: buildPosts(3, 12, "r3"),
  },
  flex: {
    creator: creators.flex,
    location: "Kitchener, ON",
    bio: "Bboy Flex • Power-move masterclass host. Teaching the next gen.",
    stats: { posts: 74, followers: 9600, following: 88 },
    posts: buildPosts(4, 9),
  },
  shadow: {
    creator: creators.shadow,
    location: "Waterloo, ON",
    bio: "DJ Shadow • Scratch sessions & live beat sets for the underground vault.",
    stats: { posts: 152, followers: 15300, following: 64 },
    posts: buildPosts(5, 12),
  },
  vans: {
    creator: creators.vans,
    location: "Global",
    bio: "Vans Underground — official partner of the JAMS engine.",
    stats: { posts: 63, followers: 88200, following: 12 },
    posts: buildPosts(6, 9),
  },
  to: {
    creator: creators.to,
    location: "Toronto, ON",
    bio: "TO Cypher collective. Concrete jams at the Square, open to all styles.",
    stats: { posts: 118, followers: 12700, following: 205 },
    posts: buildPosts(7, 12),
  },
}

export const mockWallet: WalletSession = {
  address: "8x2P...3719",
  chain: "Solana",
  balanceSol: 2.45,
}

export const BLINK_ENDPOINT = "https://jams.app/api/actions/jam/ticket"
