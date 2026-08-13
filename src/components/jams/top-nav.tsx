
import { useWallet } from "@/lib/jams/data"
import { useJams } from "./jams-context"
import { MenuIcon, PlusIcon } from "./icons"

export function TopNav() {
  const { navigate, openModal } = useJams()
  const wallet = useWallet()

  return (
    <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-border bg-surface px-5 py-4">
      <button type="button" className="flex items-center gap-2.5" onClick={() => navigate("home")} aria-label="JAMS home">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-base font-extrabold text-primary-foreground">
          J
        </span>
        <span className="text-lg font-bold tracking-wider">JAMS</span>
      </button>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => openModal("creator")}
          title="Create & Go Live"
          aria-label="Create and go live"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary"
        >
          <PlusIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => openModal("wallet")}
          className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" aria-hidden="true" />
          <span>
            {wallet.address} ({wallet.chain})
          </span>
        </button>

        <button
          type="button"
          onClick={() => openModal("menu")}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <MenuIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
