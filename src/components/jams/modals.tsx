
import { useWallet } from "@/lib/jams/data"
import { BottomSheet } from "./bottom-sheet"
import { useJams } from "./jams-context"
import { BlinksIcon, CopyIcon, DashboardIcon, QrScanIcon, TicketIcon, WalletIcon } from "./icons"

export function AppModals() {
  const { modal, closeModal, logout, navigate, showToast } = useJams()
  const wallet = useWallet()

  async function copyAddress() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(wallet.address)
      showToast("Wallet address copied")
    }
  }

  const shortAddress = `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`

  return (
    <>
      {/* Crew Portal / System Menu */}
      <BottomSheet
        open={modal === "menu"}
        title="Crew Portal"
        description="Your connected wallet and crew organizer tools."
        onClose={closeModal}
      >
        <div className="flex flex-col gap-4">
          {/* Connected Wallet */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <WalletIcon className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground">CONNECTED WALLET</span>
            </div>
            <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-secondary p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-foreground">{shortAddress}</span>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-gold"
                >
                  <CopyIcon className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">{wallet.chain}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{wallet.balanceSol} SOL</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                closeModal()
                logout()
                showToast("Wallet disconnected")
              }}
              className="w-full rounded-xl border border-live/50 px-4 py-2.5 text-xs font-bold text-live"
            >
              Disconnect / Switch Wallet
            </button>
          </div>

          {/* Crew tools */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground">CREW TOOLS</span>
            <button
              type="button"
              onClick={() => {
                closeModal()
                navigate("blinks")
              }}
              className="flex items-center gap-3 rounded-xl border border-primary/60 bg-primary/10 px-4 py-3 text-left text-sm font-bold text-primary"
            >
              <BlinksIcon className="h-4 w-4" />
              Crew Portal Home
            </button>
            <button
              type="button"
              onClick={() => showToast("Opening Organizer Dashboard...")}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left text-sm font-bold text-foreground"
            >
              <DashboardIcon className="h-4 w-4 text-gold" />
              Organizer Dashboard
            </button>
            <button
              type="button"
              onClick={() => showToast("Opening Event Management...")}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left text-sm font-bold text-foreground"
            >
              <TicketIcon className="h-4 w-4 text-gold" />
              Event Management
            </button>
            <button
              type="button"
              onClick={() => showToast("Launching QR Gate Scanner...")}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left text-sm font-bold text-foreground"
            >
              <QrScanIcon className="h-4 w-4 text-gold" />
              QR Gate Scanner
            </button>
          </div>

          <button
            type="button"
            onClick={() => showToast("Opening settings...")}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm font-bold text-foreground"
          >
            App Settings
          </button>
          <button
            type="button"
            onClick={() => {
              logout()
              showToast("Disconnected")
            }}
            className="w-full rounded-xl border border-live/50 px-4 py-3 text-sm font-bold text-live"
          >
            Disconnect / Log out
          </button>
        </div>
      </BottomSheet>

      {/* Creator Studio */}
      <BottomSheet
        open={modal === "creator"}
        title="Creator Studio"
        description="Broadcast a live stream or upload content below."
        onClose={closeModal}
      >
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              closeModal()
              navigate("reels")
              showToast("Initializing live cypher stream on Solana...")
            }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-secondary px-4 py-4 text-left text-sm font-bold text-foreground transition-colors hover:border-primary"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-live" aria-hidden="true" />
            Go Live Now!
          </button>
          <button
            type="button"
            onClick={() => {
              closeModal()
              showToast("Opening device file picker...")
            }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-secondary px-4 py-4 text-left text-sm font-bold text-foreground transition-colors hover:border-primary"
          >
            <span className="text-primary" aria-hidden="true">
              ▲
            </span>
            Upload Content now
          </button>
        </div>
      </BottomSheet>

      {/* Tip Modal */}
      <BottomSheet
        open={modal === "tip"}
        title="Tip Breaker / Creator"
        description="Send an instant SOL tip via a Solana Blink transaction."
        onClose={closeModal}
      >
        <div className="flex flex-col gap-2.5">
          {[0.01, 0.1, 0.5].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                closeModal()
                showToast(`Tip of ${amount} SOL sent successfully`)
              }}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Send {amount} SOL Tip
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  )
}
