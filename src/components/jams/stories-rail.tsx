
import { useStories } from "@/lib/jams/data"
import { useJams } from "./jams-context"

export function StoriesRail() {
  const stories = useStories()
  const { openStream, showToast } = useJams()

  return (
    <div className="no-scrollbar mb-4 flex gap-3.5 overflow-x-auto pb-4">
      {stories.map((story) => (
        <button
          key={story.id}
          type="button"
          onClick={() => {
            if (story.isLive && story.streamId) {
              openStream(story.streamId)
              showToast(`Joining ${story.creator.displayName}'s live stream...`)
            } else {
              showToast(`${story.creator.displayName} is offline`)
            }
          }}
          className="flex min-w-[68px] cursor-pointer flex-col items-center gap-1.5"
        >
          <div
            className={`relative h-[68px] w-[68px] rounded-full p-[3px] ${
              story.isLive
                ? "animate-pulse-ring bg-[linear-gradient(45deg,#ef4444,#eab308,#ec4899)]"
                : "bg-secondary"
            }`}
          >
            <div
              className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-surface bg-surface-2 text-2xl font-extrabold text-foreground"
              style={
                story.creator.accentColor
                  ? { background: story.creator.accentColor, color: "#000" }
                  : undefined
              }
            >
              {story.creator.initials}
            </div>
            {story.isLive ? (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-md border-2 border-surface bg-live px-1.5 py-0.5 text-[9px] font-black uppercase text-live-foreground">
                Live
              </span>
            ) : null}
          </div>
          <span className="max-w-[68px] truncate text-[11px] font-semibold text-muted-foreground">
            {story.creator.displayName}
          </span>
        </button>
      ))}
    </div>
  )
}
