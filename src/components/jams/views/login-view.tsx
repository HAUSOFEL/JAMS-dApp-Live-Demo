
import { useJams } from "../jams-context"

export function LoginView() {
  const { login, showToast } = useJams()

  function handleLogin() {
    login()
    showToast("Successfully signed in via Privy")
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface px-10 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-4xl font-extrabold text-primary-foreground">
        J
      </div>
      <h1 className="mb-2 text-2xl font-extrabold">JAMS Engine</h1>
      <p className="mb-8 text-sm text-muted-foreground text-balance">
        Decentralized Urban Culture &amp; Live Activations
      </p>

      <div className="flex w-full flex-col gap-3.5">
        <button
          type="button"
          onClick={handleLogin}
          className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-bold text-background"
        >
          Sign in with Apple
        </button>
        <button
          type="button"
          onClick={handleLogin}
          className="w-full rounded-xl bg-[#4285F4] px-4 py-3 text-sm font-bold text-white"
        >
          Sign in with Google
        </button>
        <div className="my-1 text-xs text-muted-foreground">or</div>
        <button
          type="button"
          onClick={handleLogin}
          className="w-full rounded-xl border border-primary bg-transparent px-4 py-3 text-sm font-bold text-primary"
        >
          Connect via Privy / Solana Wallet
        </button>
      </div>
    </div>
  )
}
