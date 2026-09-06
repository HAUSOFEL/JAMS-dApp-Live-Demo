import { useEffect, useState } from "react"
import type { DancerProfile } from "@/lib/jams/types"
import { useJams } from "../jams-context"

const STYLES = ["Breaking", "House", "Popping", "Hip Hop", "Locking", "All Styles"]
const CITIES = ["Kitchener–Waterloo", "Toronto", "Hamilton", "Montreal", "Vancouver"]

/**
 * Three-step first-run welcome. Purely presentational onboarding: answers are
 * stored through the Jams context (localStorage today, Cloud later).
 */
export function WelcomeFlow() {
  const { welcomeOpen, closeWelcome, saveDancerProfile, dancerProfile, navigate, showToast } = useJams()
  const [step, setStep] = useState(0)
  const [styles, setStyles] = useState<string[]>([])
  const [city, setCity] = useState("")
  const [displayName, setDisplayName] = useState("")

  useEffect(() => {
    if (!welcomeOpen) return
    setStep(0)
    setStyles(dancerProfile?.styles ?? [])
    setCity(dancerProfile?.city ?? "")
    setDisplayName(dancerProfile?.displayName ?? "")
  }, [welcomeOpen, dancerProfile])

  if (!welcomeOpen) return null

  function toggleStyle(style: string) {
    setStyles((prev) => (prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]))
  }

  function finish() {
    const profile: DancerProfile = {
      displayName: displayName.trim() || "New Dancer",
      styles: styles.length ? styles : ["All Styles"],
      city: city || CITIES[0],
    }
    saveDancerProfile(profile)
    setStep(3)
  }

  const canContinue = step === 0 ? styles.length > 0 : step === 1 ? Boolean(city) : true

  return (
    <div className="absolute inset-0 z-[90] flex flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between px-5 pt-5">
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1 w-8 rounded-full ${i <= Math.min(step, 2) ? "bg-primary" : "bg-secondary"}`}
            />
          ))}
        </div>
        {step < 3 ? (
          <button
            type="button"
            onClick={() => {
              closeWelcome()
              showToast("You can finish setup later from your profile")
            }}
            className="text-xs font-semibold text-muted-foreground"
          >
            Skip
          </button>
        ) : null}
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pt-8">
        {step === 0 ? (
          <>
            <h1 className="text-2xl font-extrabold text-foreground">What do you dance?</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Pick as many as you like.</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {STYLES.map((style) => {
                const on = styles.includes(style)
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleStyle(style)}
                    aria-pressed={on}
                    className={`rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
                      on
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-secondary text-foreground"
                    }`}
                  >
                    {style}
                  </button>
                )
              })}
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <h1 className="text-2xl font-extrabold text-foreground">Where are you dancing?</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              We&apos;ll open the map and feed near you.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              {CITIES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCity(option)}
                  aria-pressed={city === option}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-bold transition-colors ${
                    city === option
                      ? "border border-primary bg-primary/10 text-primary"
                      : "border border-border bg-secondary text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h1 className="text-2xl font-extrabold text-foreground">What should we call you?</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This is the name other dancers see.
            </p>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your dancer name"
              aria-label="Display name"
              className="mt-6 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              You can change this any time from your profile.
            </p>
          </>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col items-center pt-10 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary text-4xl font-extrabold text-primary-foreground">
              ✓
            </span>
            <h1 className="mt-6 text-2xl font-extrabold text-foreground">You&apos;re in</h1>
            <p className="mt-2 text-sm text-muted-foreground text-balance">
              Your feed is tuned for {styles.slice(0, 2).join(" & ") || "all styles"} around{" "}
              {city || CITIES[0]}.
            </p>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 px-6 pb-8 pt-4">
        {step === 3 ? (
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                closeWelcome()
                navigate("map")
                showToast("Showing jams near you")
              }}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
            >
              Find a jam near me
            </button>
            <button
              type="button"
              onClick={closeWelcome}
              className="w-full rounded-xl border border-border py-3.5 text-sm font-bold text-foreground"
            >
              Browse the feed
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => (step === 2 ? finish() : setStep(step + 1))}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            {step === 2 ? "Finish" : "Continue"}
          </button>
        )}
      </div>
    </div>
  )
}
