import nacl from "tweetnacl"
import bs58 from "bs58"

const KEY = "jams.embeddedWallet"
export interface StoredWallet { address: string; secret: string; createdAt: number }

export function walletFromSecret(secret: Uint8Array): StoredWallet {
  const kp = secret.length === 32 ? nacl.sign.keyPair.fromSeed(secret) : nacl.sign.keyPair.fromSecretKey(secret)
  return { address: bs58.encode(kp.publicKey), secret: bs58.encode(kp.secretKey), createdAt: Date.now() }
}
export function generateWallet(): StoredWallet {
  return walletFromSecret(nacl.sign.keyPair().secretKey)
}
/** Accepts a Base58 key or a JSON byte array (Solana CLI format). Throws on invalid input. */
export function parseSecret(input: string): StoredWallet {
  const t = input.trim()
  const bytes = t.startsWith("[") ? Uint8Array.from(JSON.parse(t) as number[]) : bs58.decode(t)
  if (bytes.length !== 64 && bytes.length !== 32) throw new Error("Invalid key length")
  const w = walletFromSecret(bytes)
  if (bytes.length === 64 && bs58.encode(bytes.slice(32)) !== w.address) throw new Error("Key mismatch")
  return w
}

const listeners = new Set<() => void>()
let cache: StoredWallet | null | undefined
export function loadWallet(): StoredWallet | null {
  if (cache !== undefined) return cache
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    cache = raw ? (JSON.parse(raw) as StoredWallet) : null
    if (cache && !cache.address) cache = null
  } catch { cache = null }
  return cache
}
export function saveWallet(w: StoredWallet | null) {
  cache = w
  if (w) localStorage.setItem(KEY, JSON.stringify(w)); else localStorage.removeItem(KEY)
  listeners.forEach((l) => l())
}
export function getOrCreateWallet(): StoredWallet {
  const w = loadWallet()
  if (w) return w
  const n = generateWallet(); saveWallet(n); return n
}
export function subscribeWallet(l: () => void) { listeners.add(l); return () => { listeners.delete(l) } }
