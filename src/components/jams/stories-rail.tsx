import { useJams } from "./jams-context";

export function StoriesRail() {
  const { stories, openProfile, openStream, showToast } = useJams();

  return (
    <div className="relative">
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 py-3">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className={`relative h-[68px] w-[68px] rounded-full p-[3px] ${story.isLive ? "animate-pulse-ring bg-[linear-gradient(45deg,var(--live),var(--primary),var(--chart-3))]" : "bg-[#051329]"}`}>
              {/* Avatar tap opens the creator profile overlay. */}
              <button
                type="button"
                onClick={() => openProfile(story.creator.id)}
                aria-label={`${story.creator.displayName} profile`}
                className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-[#091B36] bg-[#091B36] text-2xl font-extrabold text-foreground"
                style={story.creator.accentColor ? { background: story.creator.accentColor, color: "var(--primary-foreground)" } : undefined}
              >
                {story.creator.initials}
              </button>
              {/* Live badge jumps straight into the stream. */}
              {story.isLive ? (
                <button
                  type="button"
                  onClick={() => {
                    if (story.streamId) {
                      openStream(story.streamId);
                      showToast(`Joining ${story.creator.displayName}'s live stream...`);
                    } else {
                      showToast(`${story.creator.displayName} is offline`);
                    }
                  }}
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-md border-2 border-[#091B36] bg-live px-1.5 py-0.5 text-[9px] font-black uppercase text-live-foreground"
                >
                  Live
                </button>
              ) : null}
            </div>
            <span className="max-w-[72px] truncate text-[11px] font-bold text-foreground">
              {story.creator.displayName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
