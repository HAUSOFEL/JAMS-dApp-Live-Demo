
import { useChannels } from "@/lib/jams/data"
import { useJams } from "../jams-context"

export function ChatView() {
  const channels = useChannels()
  const { showToast } = useJams()

  return (
    <div className="animate-fade-in">
      <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Community Channels
      </h2>

      {channels.map((channel) => (
        <button
          key={channel.id}
          type="button"
          onClick={() => showToast(`Joined ${channel.name}`)}
          className={`mb-2.5 flex w-full items-center gap-3.5 rounded-2xl border bg-surface-2 p-4 text-left transition-colors hover:bg-accent ${
            channel.highlighted ? "border-l-[3px] border-l-primary border-y-border border-r-border" : "border-border"
          }`}
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold ${
              channel.highlighted ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}
          >
            {channel.icon}
          </span>
          <span className="flex-1">
            <span
              className={`mb-1 block text-sm font-bold ${channel.highlighted ? "text-primary" : "text-foreground"}`}
            >
              {channel.name}
            </span>
            <span className="block text-xs text-muted-foreground">
              {channel.description}
              {channel.membersOnline ? ` • ${channel.membersOnline} online` : ""}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
