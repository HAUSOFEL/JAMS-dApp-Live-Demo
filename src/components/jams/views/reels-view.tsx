
import { useEffect, useMemo, useRef, useState } from "react"
import { useReels } from "@/lib/jams/data"
import type { Reel } from "@/lib/jams/types"
import { useJams } from "../jams-context"
import { CommentsSheet } from "../reels/comments-sheet"
import { ReelCard } from "../reels/reel-card"

interface FeedItem {
  key: string
  reel: Reel
}

export function ReelsView() {
  const reels = useReels()
  const { focusedStreamId } = useJams()
  const [cycles, setCycles] = useState(2)
  const [commentsFor, setCommentsFor] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Order the source list so a focused stream (tapped from a story / map / home) leads.
  const ordered = useMemo(() => {
    if (!focusedStreamId) return reels
    const idx = reels.findIndex((r) => r.id === focusedStreamId)
    if (idx <= 0) return reels
    return [...reels.slice(idx), ...reels.slice(0, idx)]
  }, [reels, focusedStreamId])

  // Endless feed: repeat the ordered reels `cycles` times.
  const feed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = []
    for (let c = 0; c < cycles; c++) {
      for (const reel of ordered) {
        items.push({ key: `${reel.id}-${c}`, reel })
      }
    }
    return items
  }, [ordered, cycles])

  // Append another cycle when the sentinel scrolls into view -> endless scroll.
  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setCycles((c) => Math.min(c + 1, 20))
      },
      { threshold: 0.1 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="absolute inset-0 bg-black">
      <div className="no-scrollbar h-full w-full snap-y-mandatory overflow-y-scroll">
        {feed.map((item) => (
          <div key={item.key} className="h-full w-full snap-start">
            <ReelCard reel={item.reel} onOpenComments={() => setCommentsFor(item.reel.id)} />
          </div>
        ))}
        <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
      </div>

      <CommentsSheet streamId={commentsFor} onClose={() => setCommentsFor(null)} />
    </div>
  )
}
