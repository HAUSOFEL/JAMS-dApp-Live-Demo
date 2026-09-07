
import { useState } from "react"
import { useWallet } from "@/lib/jams/data"
import { BottomSheet } from "./bottom-sheet"
import { useJams } from "./jams-context"
import { BlinksIcon, CopyIcon, DashboardIcon, QrScanIcon, TicketIcon, WalletIcon } from "./icons"

export function AppModals() {
  const { modal, closeModal, logout, navigate, showToast } = useJams()
  const wallet = useWallet()
  const [showAccountDetails, setShowAccountDetails] = useState(false)

  async function copyAddress() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(wallet.address)
      showToast("Wallet address copied")
    }
  }

  const shortAddress = `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`
  const balanceUsd = (wallet.balanceSol * 148).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })

  return (
    <>
      {/* Crew Portal / System Menu */}
      <BottomSheet
        open={modal === "menu"}
        title="Crew Portal"
        description="Your account and crew organizer tools."
        onClose={closeModal}
      >
        <div className="flex flex-col gap-4">
          {/* My Account */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <WalletIcon className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground">MY ACCOUNT</span>
            </div>
            <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-secondary p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Balance</span>
                <span className="text-sm font-bold text-foreground">{balanceUsd}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">Account active</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAccountDetails((v) => !v)}
                  className="text-[11px] font-bold text-primary transition-colors hover:text-gold"
                >
                  {showAccountDetails ? "Hide details" : "Show details"}
                </button>
              </div>
              {showAccountDetails ? (
                <div className="flex flex-col gap-2 border-t border-border pt-2.5">
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
                    <span className="text-[11px] text-muted-foreground">{wallet.chain}</span>
                    <span className="text-[11px] font-bold text-foreground">{wallet.balanceSol} SOL</span>
                  </div>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                closeModal()
                logout()
                showToast("Signed out")
              }}
              className="w-full rounded-xl border border-live/50 px-4 py-2.5 text-xs font-bold text-live"
            >
              Sign out
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
        title="Send a tip"
        description="Show love to a dancer or creator. Goes straight to them."
        onClose={closeModal}
      >
        <div className="flex flex-col gap-2.5">
          {[
            { usd: 1, sol: 0.01 },
            { usd: 3, sol: 0.02 },
            { usd: 5, sol: 0.035 },
          ].map(({ usd, sol }) => (
            <button
              key={usd}
              type="button"
              onClick={() => {
                closeModal()
                showToast(`You sent a $${usd} tip`)
              }}
              className="flex w-full items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              <span>Send a tip — ${usd}</span>
              <span className="text-[11px] font-semibold opacity-70">{sol} SOL</span>
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  )
}
