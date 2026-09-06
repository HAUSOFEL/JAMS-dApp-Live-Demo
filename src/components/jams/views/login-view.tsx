
import { useState } from "react"
import { useJams } from "../jams-context"

export function LoginView() {
  const { login, showToast } = useJams()
  const [email, setEmail] = useState("")
  const [emailOpen, setEmailOpen] = useState(false)

  function handleLogin(message = "Welcome to JAMS") {
    login()
    showToast(message)
  }

  return (
    <div className="no-scrollbar absolute inset-0 z-20 flex flex-col items-center justify-center overflow-y-auto bg-surface px-10 py-8 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-4xl font-extrabold text-primary-foreground">
        J
      </div>
      <h1 className="mb-2 text-2xl font-extrabold">JAMS</h1>
      <p className="mb-8 text-sm text-muted-foreground text-balance">
        Find jams, battles and workshops near you.
      </p>

      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={() => handleLogin()}
          className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-bold text-background"
        >
          Continue with Apple
        </button>
        <button
          type="button"
          onClick={() => handleLogin()}
          className="w-full rounded-xl bg-[#4285F4] px-4 py-3 text-sm font-bold text-white"
        >
          Continue with Google
        </button>

        {emailOpen ? (
          <div className="flex flex-col gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email address"
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <button
              type="button"
              onClick={() => handleLogin("Welcome to JAMS")}
              disabled={!email.includes("@")}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEmailOpen(true)}
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground"
          >
            Continue with email
          </button>
        )}
      </div>

      <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground text-balance">
        No crypto setup needed — your tickets and collectibles are handled for you.
      </p>
      <button
        type="button"
        onClick={() => handleLogin("Wallet connected")}
        className="mt-2 text-[11px] font-semibold text-muted-foreground underline underline-offset-4"
      >
        Advanced: use my own wallet
      </button>
    </div>
  )
}
