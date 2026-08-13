
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

      <div className="relative h-[260px] overflow-hidden rounded-2xl border border-border bg-[#111]">
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

      {/* One-click economy */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          One-Click Economy
        </h3>
        <h4 className="mb-1.5 text-[15px] font-bold">Active cNFT Passes</h4>
        <p className="mb-3.5 text-xs text-muted-foreground">
          Manage active tickets, governance votes, and sponsor reward drops directly on-chain.
        </p>
        <button
          type="button"
          onClick={() => showToast("On-chain Solana state refreshed")}
          className="w-full rounded-xl bg-primary py-3 text-[13px] font-bold text-primary-foreground"
        >
          Refresh On-Chain State
        </button>
      </div>

      {/* Shareable social ticketing */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Shareable Social Ticketing
        </h3>
        <h4 className="mb-1.5 text-[15px] font-bold">Blink Action Endpoint</h4>
        <p className="mb-3 text-xs text-muted-foreground">
          Generate a Blink URL adhering to the Solana Actions Specification to embed registration directly into social
          channels.
        </p>
        <div className="mb-3 break-all rounded-lg bg-surface p-2.5 font-mono text-[11px] text-primary">
          {BLINK_ENDPOINT}
        </div>
        <button
          type="button"
          onClick={copyBlink}
          className="w-full rounded-xl border border-primary py-3 text-[13px] font-bold text-primary"
        >
          Copy Blink Action URL
        </button>
      </div>
    </div>
  )
}
