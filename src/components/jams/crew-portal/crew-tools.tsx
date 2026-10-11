import { useJams } from "../jams-context"
import { EventManagement } from "./event-management"
import { OrganizerDashboard } from "./organizer-dashboard"
import { QrGateScanner } from "./qr-gate-scanner"

export function CrewTools() {
  const { crewTool, closeCrewTool } = useJams()
  if (crewTool === "scanner") return <QrGateScanner onClose={closeCrewTool} />
  if (crewTool === "events") return <EventManagement onClose={closeCrewTool} />
  if (crewTool === "dashboard") return <OrganizerDashboard onClose={closeCrewTool} />
  return null
}
