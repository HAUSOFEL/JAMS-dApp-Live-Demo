
import { useState } from "react"
import type { Reel } from "@/lib/jams/types"
import { useJams } from "../jams-context"
import { CommentIcon, EyeIcon, HeartIcon, ShareIcon, TipIcon } from "../icons"

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return `${n}`
}

interface ReelCardProps {
  reel: Reel
  onOpenComments: () => void
}

export function ReelCard({ reel, onOpenComments }: ReelCardProps) {
  const { openProfile, openModal, showToast } = useJams()
  const [liked, setLiked] = useState(false)

  async function handleShare() {
    const shareData = { title: `JAMS • ${reel.title}`, url: typeof window !== "undefined" ? window.location.href : "" }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        /* dismissed */
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url)
      showToast("Reel link copied to clipboard")
    }
  }

  return (
    <section
      className="relative flex h-full w-full shrink-0 snap-start items-center justify-center overflow-hidden bg-[#111]"
      aria-label={reel.title}
    >
      {/* Poster placeholder — swap for an HLS/WebRTC <video> when live feeds are wired. */}
      <div className="absolute inset-0 opacity-50" style={{ background: reel.gradient }} aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "repeating-linear-gradient(45deg, #111, #111 10px, #1a1a1a 10px, #1a1a1a 20px)",
        }}
        aria-hidden="true"
      />

      {/* Live indicator */}
      {reel.isLive ? (
        <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur">
          <span className="h-2 w-2 animate-pulse-live rounded-full bg-live" aria-hidden="true" />
          LIVE
          {reel.viewers ? (
            <span className="ml-1.5 flex items-center gap-1 text-[#aaa]">
              <EyeIcon className="h-3.5 w-3.5" /> {formatCount(reel.viewers)}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Meta */}
      <div className="absolute bottom-28 left-4 z-[5] max-w-[240px]">
        <span className="mb-2 inline-block rounded-xl border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground">
          {reel.isLive ? "Live Session" : reel.tag}
        </span>
        <button
          type="button"
          onClick={() => openProfile(reel.creator.id)}
          className="mb-1 block text-[13px] font-bold text-foreground"
        >
          @{reel.creator.handle}
        </button>
        <h3 className="mb-1 text-[15px] font-bold text-white">{reel.title}</h3>
        <p className="text-xs text-[#aaa]">{reel.subtitle}</p>
      </div>

      {/* Sidebar actions */}
      <div className="absolute bottom-28 right-4 z-[5] flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => openProfile(reel.creator.id)}
          title={`${reel.creator.displayName} profile`}
          aria-label={`${reel.creator.displayName} profile`}
          className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-secondary text-sm font-bold text-white"
          style={reel.creator.accentColor ? { background: reel.creator.accentColor } : undefined}
        >
          {reel.creator.avatarUrl ? (
            <img
              src={reel.creator.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
              width={44}
              height={44}
            />
          ) : (
            reel.creator.initials
          )}
        </button>

        <SideAction
          label="Like"
          count={formatCount(reel.likes + (liked ? 1 : 0))}
          active={liked}
          onClick={() => setLiked((v) => !v)}
        >
          <HeartIcon className={`h-5 w-5 ${liked ? "text-live" : "text-white"}`} />
        </SideAction>

        <SideAction label="Comments" onClick={onOpenComments}>
          <CommentIcon className="h-5 w-5 text-white" />
        </SideAction>

        <SideAction label="Share" onClick={handleShare}>
          <ShareIcon className="h-5 w-5 text-white" />
        </SideAction>

        <SideAction label="Tip" onClick={() => openModal("tip")} highlighted>
          <TipIcon className="h-5 w-5 text-primary-foreground" />
        </SideAction>
      </div>
    </section>
  )
}

function SideAction({
  label,
  count,
  active,
  highlighted,
  onClick,
  children,
}: {
  label: string
  count?: string
  active?: boolean
  highlighted?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={active} className="flex flex-col items-center gap-1 text-white">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-90 ${
          highlighted ? "bg-primary" : "bg-black/40 backdrop-blur"
        }`}
      >
        {children}
      </span>
      {count ? <span className="text-[10px] font-semibold">{count}</span> : null}
    </button>
  )
}
