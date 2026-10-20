import { useEffect, useState } from "react"
import type { MapMarker } from "@/lib/jams/types"
import { useJams } from "../jams-context"
import { EventDetail } from "./event-detail"
import { EventPassClaim } from "./event-pass-claim"

export function EventDetailOverlay() {
  const { activeEvent, closeEvent, showToast } = useJams()
  const [claimMarker, setClaimMarker] = useState<MapMarker | null>(null)

  useEffect(() => {
    if (!activeEvent) return
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (claimMarker) setClaimMarker(null)
      else closeEvent()
    }
    window.addEventListener("keydown", dismiss)
    return () => window.removeEventListener("keydown", dismiss)
  }, [activeEvent, claimMarker, closeEvent])

  if (!activeEvent) return null

  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activeEvent.title}, Kitchener-Waterloo, ON`)}`

  return (
    <div className="absolute inset-0 z-[45]" data-event-detail>
      <EventDetail key={activeEvent.id} marker={activeEvent} onClose={closeEvent} onClaim={setClaimMarker} directionsHref={directionsHref} />
      {claimMarker ? <EventPassClaim key={claimMarker.id} marker={claimMarker} onClose={() => setClaimMarker(null)} onToast={showToast} /> : null}
    </div>
  )
}