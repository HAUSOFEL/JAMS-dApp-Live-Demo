
import { useState } from "react"
import { BLINK_ENDPOINT, usePortals } from "@/lib/jams/data"
import { useJams } from "../jams-context"
import { ExternalLinkIcon, RefreshIcon } from "../icons"

export function BlinksView() {
  const portals = usePortals()
  const { showToast } = useJams()
  const portal = portals[0]
  const [iframeKey, setIframeKey] = useState(0)

  async function copyBlink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(BLINK_ENDPOINT)
      showToast("Blink Action URL copied")
    }
  }

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      {/* Embedded crew portal browser */}
      <div className="-mx-4 -mt-4 flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2.5">
        <span className="text-xs text-muted-foreground">
          <a href={portal?.url} target="_blank" rel="noreferrer" className="text-primary">
            {portal?.name}
          </a>{" "}
          (Embedded Portal)
        </span>
        <button
          type="button"
          onClick={() => {
            setIframeKey((k) => k + 1)
            showToast("Reloaded embedded portal")
          }}
          aria-label="Reload portal"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <RefreshIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="relative h-[260px] overflow-hidden rounded-2xl border border-border bg-[#051329]">
        <iframe
          key={iframeKey}
          src={portal?.url}
          title={`${portal?.name} embedded portal`}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
        <a
          href={portal?.url}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[11px] font-bold text-primary-foreground"
        >
          Open Full Site <ExternalLinkIcon className="h-3.5 w-3.5" />
        </a>
      </div>
      <p className="-mt-1 text-xs leading-relaxed text-muted-foreground">{portal?.description}</p>

      {/* Tickets */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Tickets
        </h3>
        <h4 className="mb-1.5 text-[15px] font-bold">Your active tickets</h4>
        <p className="mb-3.5 text-xs text-muted-foreground">
          Tickets, crew votes, and sponsor rewards all live here. Pull down anytime for the latest.
        </p>
        <button
          type="button"
          onClick={() => showToast("Everything is up to date")}
          className="w-full rounded-xl bg-primary py-3 text-[13px] font-bold text-primary-foreground"
        >
          Refresh
        </button>
      </div>

      {/* Share */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Share
        </h3>
        <h4 className="mb-1.5 text-[15px] font-bold">Share link</h4>
        <p className="mb-3 text-xs text-muted-foreground">
          Post this link anywhere and people can grab a ticket without leaving the page.
        </p>
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={copyBlink}
            className="flex-1 rounded-xl bg-primary py-3 text-[13px] font-bold text-primary-foreground"
          >
            Copy link
          </button>
          <button
            type="button"
            onClick={shareBlink}
            className="flex-1 rounded-xl border border-primary py-3 text-[13px] font-bold text-primary"
          >
            Share
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowTech((v) => !v)}
          className="text-[11px] font-bold text-muted-foreground underline"
        >
          {showTech ? "Hide technical details" : "Show technical details"}
        </button>
        {showTech ? (
          <div className="mt-2.5 break-all rounded-lg bg-surface p-2.5 font-mono text-[11px] text-primary">
            {BLINK_ENDPOINT}
          </div>
        ) : null}
      </div>
    </div>
  )
}
