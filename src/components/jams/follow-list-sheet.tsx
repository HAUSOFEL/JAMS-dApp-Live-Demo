import { useEffect, useMemo, useState } from "react"
import { allCreators, canViewLists, followerIds, followingIds, PRIVATE_LIST_CREATORS } from "@/lib/jams/follow-graph"
import { Button } from "@/components/ui/button"
import { useProfileEdits } from "@/lib/jams/stores"
import { useJams } from "./jams-context"
import { ChevronLeftIcon, SearchIcon } from "./icons"

export type FollowTab = "followers" | "following"

export function FollowListSheet({ ownerId, initialTab, onClose }: { ownerId: string; initialTab: FollowTab; onClose: () => void }) {
  const { followedCreatorIds, toggleFollow, openProfile, removedFollowerIds, removeFollower } = useJams()
  const [edits] = useProfileEdits()
  const [tab, setTab] = useState<FollowTab>(initialTab)
  const [q, setQ] = useState("")
  const isOwn = ownerId === "me"
  const isPrivate = isOwn ? !!edits?.privateFollowLists : PRIVATE_LIST_CREATORS.has(ownerId)
  const visible = canViewLists(ownerId, "me", isPrivate)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const creators = useMemo(() => new Map(allCreators().map((c) => [c.id, c])), [])
  const myFollowers = new Set(followerIds("me", followedCreatorIds, removedFollowerIds))
  const ids = useMemo(() => {
    return tab === "followers" ? followerIds(ownerId, followedCreatorIds, removedFollowerIds) : followingIds(ownerId, followedCreatorIds, removedFollowerIds)
  }, [tab, ownerId, removedFollowerIds, followedCreatorIds])
  const rows = ids.map((id) => creators.get(id)).filter((c): c is NonNullable<typeof c> => !!c)
    .filter((c) => !q || `${c.displayName} ${c.handle}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div role="dialog" aria-modal="true" aria-label="Followers and following" className="absolute inset-0 z-50 flex flex-col bg-background animate-in slide-in-from-bottom-4 fade-in duration-200">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <button type="button" onClick={onClose} aria-label="Back" className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-bold text-foreground">{isOwn ? "Your connections" : "Connections"}</h2>
      </header>
      <div role="tablist" className="flex shrink-0 border-b border-border">
        {(["followers", "following"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-bold capitalize ${tab === t ? "border-b-2 border-accent text-foreground" : "text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>
      {!visible ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <span className="text-3xl">🔒</span>
          <p className="text-sm font-bold text-foreground">This list is private</p>
          <p className="text-xs text-muted-foreground">This dancer has chosen to keep who they follow and who follows them private.</p>
        </div>
      ) : (
        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-24 pt-3">
          {isOwn && isPrivate ? <p className="mb-2 text-[11px] text-muted-foreground">🔒 Your lists are hidden from other dancers.</p> : null}
          <label className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60" />
          </label>
          {rows.length === 0 ? <p className="py-10 text-center text-xs text-muted-foreground">No dancers here yet.</p> : null}
          <p className="mb-2 text-[11px] text-muted-foreground">Sample connections · Changes last for this session.</p>
          <ul className="space-y-1">
            {rows.map((c) => {
              const following = isOwn && tab === "following" ? true : followedCreatorIds.includes(c.id)
              return (
                <li key={c.id} className="flex items-center gap-3 rounded-xl py-2">
                  <button type="button" onClick={() => { onClose(); openProfile(c.id) }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-xs font-extrabold text-foreground">
                      {c.avatarUrl ? <img src={c.avatarUrl} alt="" className="h-full w-full object-cover" /> : c.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-foreground">{c.handle}</span>
                      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="truncate">{c.displayName}</span>
                        {myFollowers.has(c.id) ? <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-foreground">Follows you</span> : null}
                      </span>
                    </span>
                  </button>
                  {c.id === "me" ? null : isOwn && tab === "followers" ? (
                    <Button type="button" size="sm" variant="secondary" aria-label={`Remove @${c.handle} from followers`} onClick={() => removeFollower(c.id)}>Remove</Button>
                  ) : isOwn && tab === "following" ? (
                    <Button type="button" size="sm" variant="secondary" aria-label={`Unfollow @${c.handle}`} onClick={() => toggleFollow(c.id)}>Unfollow</Button>
                  ) : (
                    <Button type="button" size="sm" variant={following ? "secondary" : "default"} onClick={() => toggleFollow(c.id)}>
                      {following ? "Following" : "Follow"}
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
