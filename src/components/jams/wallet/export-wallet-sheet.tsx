import { useEffect, useState } from "react"
import { BottomSheet } from "../bottom-sheet"
import { useJams } from "../jams-context"
import { loadWallet } from "@/lib/jams/wallet"

export function ExportWalletSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useJams()
  const [agreed, setAgreed] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const wallet = open ? loadWallet() : null

  useEffect(() => {
    if (!open) { setAgreed(false); setRevealed(false) }
  }, [open])
  useEffect(() => {
    if (!revealed) return
    const t = setTimeout(() => setRevealed(false), 30000)
    return () => clearTimeout(t)
  }, [revealed])

  async function copy(text: string, msg: string) {
    await navigator.clipboard?.writeText(text)
    showToast(msg)
  }

  return (
    <BottomSheet open={open} title="Back up your wallet" description="Use this key to open your JAMS wallet in Phantom, Solflare or Backpack." onClose={onClose}>
      {!wallet ? (
        <p className="text-xs text-muted-foreground">No wallet on this device yet. Sign in to create one.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-accent/60 bg-accent/10 p-3 text-[11px] leading-relaxed text-foreground">
            <b className="text-accent">Keep this secret.</b> Anyone with this key controls your wallet, tickets and prizes. JAMS staff will never ask for it.
            Your key is saved only on this device — if you clear your browser without a backup, it's gone.
          </div>
          <div className="rounded-xl border border-border bg-secondary p-3">
            <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground">WALLET ADDRESS</p>
            <p className="break-all font-mono text-[11px] text-foreground">{wallet.address}</p>
            <button type="button" onClick={() => copy(wallet.address, "Address copied")} className="mt-1 text-[11px] font-bold text-primary">Copy address</button>
          </div>
          <label className="flex items-start gap-2 text-[11px] text-muted-foreground">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
            I understand that sharing this key lets someone take everything in my wallet.
          </label>
          <div className="rounded-xl border border-border bg-secondary p-3">
            <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground">PRIVATE KEY</p>
            <p className={`break-all font-mono text-[11px] text-foreground ${revealed ? "" : "select-none blur-sm"}`} aria-hidden={!revealed}>
              {revealed ? wallet.secret : "•".repeat(88)}
            </p>
            <div className="mt-2 flex gap-2">
              <button type="button" disabled={!agreed} onClick={() => setRevealed((v) => !v)} className="flex-1 rounded-lg bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground disabled:opacity-40">
                {revealed ? "Hide key" : "Reveal key"}
              </button>
              <button type="button" disabled={!agreed} onClick={() => copy(wallet.secret, "Private key copied — paste it somewhere safe")} className="flex-1 rounded-lg border border-gold/60 px-3 py-2 text-[11px] font-bold text-gold disabled:opacity-40">
                Copy key
              </button>
            </div>
          </div>
          <div className="text-[11px] leading-relaxed text-muted-foreground">
            <p className="font-bold text-foreground">Import into another wallet</p>
            <p><b>Phantom:</b> Menu → Add / Connect Wallet → Import Private Key → paste.</p>
            <p><b>Solflare:</b> Add Wallet → Import Private Key → paste.</p>
            <p><b>Backpack:</b> Settings → Add Wallet → Import → Private Key.</p>
          </div>
        </div>
      )}
    </BottomSheet>
  )
}
