
import { useJams } from "./jams-context"

export function Toast() {
  const { toast } = useJams()

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none absolute bottom-24 left-1/2 z-[100] -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-surface-2 px-4 py-2.5 text-xs font-semibold text-foreground shadow-lg transition-all duration-300 ${
        toast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {toast ?? ""}
    </div>
  )
}
