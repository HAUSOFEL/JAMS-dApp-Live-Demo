
import { useChannels } from "@/lib/jams/data"
import { useJams } from "../jams-context"
import { ChatIcon, ExternalLinkIcon } from "../icons"

export function ChatView() {
  const channels = useChannels()
  const { showToast } = useJams()

  return (
    <div className="animate-fade-in">
      {/* Dialect integration widget */}
      <div className="mb-4 rounded-2xl border border-border bg-surface-2 p-4">
        <div className="mb-3 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ChatIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Dialect Messaging</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-live" />
                Active
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Channel: <span className="font-semibold text-foreground">jams-waterloo</span> · 3 threads synced
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
            🔒 Wallet-to-wallet encryption
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
            On-chain verified
          </span>
        </div>

        <button
          type="button"
          onClick={() => showToast("Opening Dialect thread manager")}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-xs font-bold text-foreground transition-colors hover:bg-accent"
        >
          Manage Dialect Threads
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </button>
      </div>

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
