
import { useWallet } from "@/lib/jams/data"
import { useJams } from "./jams-context"
import { MenuIcon, PlusIcon } from "./icons"

export function TopNav() {
  const { navigate, openModal } = useJams()
  const wallet = useWallet()

  return (
    <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-border bg-surface/95 px-5 py-4 backdrop-blur">
      <button type="button" className="flex items-center gap-2.5" onClick={() => navigate("home")} aria-label="JAMS home">
        <span className="flex h-8 w-8 items-center justify-center bg-gradient-primary glow-primary rounded-lg text-base font-extrabold text-primary-foreground">
          J
        </span>
        <span className="text-lg font-bold tracking-[0.2em]">JAMS</span>
      </button>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => openModal("creator")}
          title="Create & Go Live"
          aria-label="Create and go live"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-primary transition-shadow hover:glow-primary"
        >
          <PlusIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => openModal("wallet")}
          className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold/50 hover:text-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
          <span>
            {wallet.address} ({wallet.chain})
          </span>
        </button>

        <button
          type="button"
          onClick={() => openModal("menu")}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:border-primary/50"
        >
          <MenuIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
