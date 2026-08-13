
import { useWallet } from "@/lib/jams/data"
import { BottomSheet } from "./bottom-sheet"
import { useJams } from "./jams-context"

export function AppModals() {
  const { modal, closeModal, logout, navigate, showToast } = useJams()
  const wallet = useWallet()

  return (
    <>
      {/* Wallet Hub */}
      <BottomSheet
        open={modal === "wallet"}
        title="Solana Mobile Wallet Hub"
        description={`Connected via Privy / Seeker Seed Vault\nAddress: ${wallet.address}  •  Balance: ${wallet.balanceSol} SOL`}
        onClose={closeModal}
      >
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => showToast("Redirecting to MoonPay fiat ramp...")}
            className="w-full rounded-xl bg-[#6b21a8] px-4 py-3 text-sm font-bold text-white"
          >
            Buy SOL via MoonPay
          </button>
          <button
            type="button"
            onClick={() => showToast("Opening wallet manager...")}
            className="w-full rounded-xl border border-primary px-4 py-3 text-sm font-bold text-primary"
          >
            Switch / Manage Wallets
          </button>
          <button
            type="button"
            onClick={() => showToast("Profile opened")}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm font-bold text-foreground"
          >
            View Profile
          </button>
        </div>
      </BottomSheet>

      {/* System Menu */}
      <BottomSheet
        open={modal === "menu"}
        title="JAMS System Menu"
        description="Manage settings, preferences, or disconnect your session."
        onClose={closeModal}
      >
        <div className="flex flex-col gap-2.5">
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
        description="Broadcast a live stream session or drop content into the JAMS engine."
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
            Go Live (Cypher Stream)
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
            Drop Reel / Photo Clip
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
