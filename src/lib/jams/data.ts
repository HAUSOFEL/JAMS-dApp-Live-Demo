
import { useEffect, useState } from "react"
import {
  BLINK_ENDPOINT,
  mockChannels,
  mockEvents,
  mockMapMarkers,
  mockPortals,
  mockReels,
  mockSponsors,
  mockStories,
  mockWallet,
} from "./mock-data"
import type {
  ChatChannel,
  Comment,
  CrewPortal,
  JamEvent,
  MapMarker,
  Reel,
  Sponsor,
  Story,
  WalletSession,
} from "./types"

/**
 * ---------------------------------------------------------------------------
 * Supabase-ready data layer
 * ---------------------------------------------------------------------------
 * Every hook below returns typed data from the local mock seed. Each one has a
 * commented example of the Supabase query + realtime subscription that replaces
 * it. Because the return types are identical, none of the UI components need to
 * change when you connect the database.
 *
 * To go live:
 *   1. Add the Supabase integration (env: NEXT_PUBLIC_SUPABASE_URL,
 *      NEXT_PUBLIC_SUPABASE_ANON_KEY).
 *   2. Create `lib/supabase/client.ts` exporting a browser client.
 *   3. Uncomment the query/subscription blocks in each hook.
 */

export function useStories(): Story[] {
  const [stories, setStories] = useState<Story[]>(mockStories)

  useEffect(() => {
    // const supabase = createClient()
    // supabase.from("stories").select("*, creator:creators(*)").then(({ data }) => data && setStories(data))
    // const channel = supabase
    //   .channel("stories-live")
    //   .on("postgres_changes", { event: "*", schema: "public", table: "streams" }, refetch)
    //   .subscribe()
    // return () => { supabase.removeChannel(channel) }
    setStories(mockStories)
  }, [])

  return stories
}

export function useReels(): Reel[] {
  const [reels, setReels] = useState<Reel[]>(mockReels)

  useEffect(() => {
    // const supabase = createClient()
    // supabase.from("streams").select("*, creator:creators(*)").order("is_live", { ascending: false })
    //   .then(({ data }) => data && setReels(data))
    // Realtime viewer counts / like totals arrive via a `streams` subscription.
    setReels(mockReels)
  }, [])

  return reels
}

export function useEvents(): JamEvent[] {
  const [events, setEvents] = useState<JamEvent[]>(mockEvents)

  useEffect(() => {
    // supabase.from("events").select("*").order("day")
    setEvents(mockEvents)
  }, [])

  return events
}

export function useMapMarkers(): MapMarker[] {
  const [markers, setMarkers] = useState<MapMarker[]>(mockMapMarkers)

  useEffect(() => {
    // supabase.from("event_locations").select("*")
    setMarkers(mockMapMarkers)
  }, [])

  return markers
}

export function useChannels(): ChatChannel[] {
  const [channels, setChannels] = useState<ChatChannel[]>(mockChannels)

  useEffect(() => {
    // supabase.from("chat_channels").select("*")
    // presence counts come from a Supabase presence channel per room.
    setChannels(mockChannels)
  }, [])

  return channels
}

export function usePortals(): CrewPortal[] {
  const [portals] = useState<CrewPortal[]>(mockPortals)
  return portals
}

export function useSponsors(): Sponsor[] {
  const [sponsors] = useState<Sponsor[]>(mockSponsors)
  return sponsors
}

export function useWallet(): WalletSession {
  const [wallet] = useState<WalletSession>(mockWallet)
  return wallet
}

/**
 * Realtime comment stream for a given reel/stream. Currently stores comments in
 * local state; swap `postComment` for an insert and subscribe to inserts.
 */
export function useStreamComments(streamId: string | null) {
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    if (!streamId) return
    setComments([])
    // const supabase = createClient()
    // const channel = supabase
    //   .channel(`stream:${streamId}:comments`)
    //   .on("postgres_changes",
    //     { event: "INSERT", schema: "public", table: "stream_comments", filter: `stream_id=eq.${streamId}` },
    //     ({ new: row }) => setComments((c) => [...c, row as Comment]))
    //   .subscribe()
    // return () => { supabase.removeChannel(channel) }
  }, [streamId])

  function postComment(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const comment: Comment = {
      id: crypto.randomUUID(),
      author: `User_${Math.floor(Math.random() * 9999)}`,
      text: trimmed,
      createdAt: Date.now(),
    }
    // await supabase.from("stream_comments").insert({ stream_id: streamId, text: trimmed })
    setComments((c) => [...c, comment])
  }

  return { comments, postComment }
}

export { BLINK_ENDPOINT }
