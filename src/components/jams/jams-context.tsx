
import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { ModalId, TabId } from "@/lib/jams/types"

interface JamsContextValue {
  authed: boolean
  login: () => void
  logout: () => void

  activeTab: TabId
  navigate: (tab: TabId) => void

  /** When set, the Reels view opens focused on this stream id. */
  focusedStreamId: string | null
  openStream: (streamId: string) => void

  modal: ModalId
  openModal: (modal: Exclude<ModalId, null>) => void
  closeModal: () => void

  savedEventIds: string[]
  toggleSavedEvent: (id: string) => void

  toast: string | null
  showToast: (message: string) => void
}

const JamsContext = createContext<JamsContextValue | null>(null)

export function JamsProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>("home")
  const [focusedStreamId, setFocusedStreamId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalId>(null)
  const [savedEventIds, setSavedEventIds] = useState<string[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout((showToast as unknown as { _t?: number })._t)
    ;(showToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(null), 2500)
  }, [])

  const navigate = useCallback((tab: TabId) => {
    setActiveTab(tab)
  }, [])

  const openStream = useCallback((streamId: string) => {
    setFocusedStreamId(streamId)
    setActiveTab("reels")
  }, [])

  const login = useCallback(() => {
    setAuthed(true)
    setActiveTab("home")
  }, [])

  const logout = useCallback(() => {
    setAuthed(false)
    setModal(null)
    setActiveTab("home")
  }, [])

  const toggleSavedEvent = useCallback(
    (id: string) => {
      setSavedEventIds((prev) => {
        const has = prev.includes(id)
        showToast(has ? "Removed from saved events" : "Event saved to your profile")
        return has ? prev.filter((x) => x !== id) : [...prev, id]
      })
    },
    [showToast],
  )

  const value = useMemo<JamsContextValue>(
    () => ({
      authed,
      login,
      logout,
      activeTab,
      navigate,
      focusedStreamId,
      openStream,
      modal,
      openModal: (m) => setModal(m),
      closeModal: () => setModal(null),
      savedEventIds,
      toggleSavedEvent,
      toast,
      showToast,
    }),
    [authed, login, logout, activeTab, navigate, focusedStreamId, openStream, modal, savedEventIds, toggleSavedEvent, toast, showToast],
  )

  return <JamsContext.Provider value={value}>{children}</JamsContext.Provider>
}

export function useJams() {
  const ctx = useContext(JamsContext)
  if (!ctx) throw new Error("useJams must be used within a JamsProvider")
  return ctx
}
