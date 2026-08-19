import { useStories } from "@/lib/jams/data";
import { useJams } from "./jams-context";

export function StoriesRail() {
  const stories = useStories();
  const { openProfile, openStream, showToast } = useJams();

  return (
    <div className="no-scrollbar mb-4 flex gap-3.5 overflow-x-auto pb-4">
      {stories.map((story) => (
        <div key={story.id} className="flex min-w-[68px] flex-col items-center gap-1.5">
          <div
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

          {/* Handle tap also opens the profile. */}
          <button
            type="button"
            onClick={() => openProfile(story.creator.id)}
            className="max-w-[68px] truncate text-[11px] font-semibold text-muted-foreground"
          >
            {story.creator.displayName}
          </button>
        </div>
      ))}
    </div>
  );
}
