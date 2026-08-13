import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ModalId, TabId } from "@/lib/jams/types";

interface JamsContextValue {
  authed: boolean;
  login: () => void;
  logout: () => void;

  activeTab: TabId;
  navigate: (tab: TabId) => void;

  /** When set, the Reels view opens focused on this stream id. */
  focusedStreamId: string | null;
  openStream: (streamId: string) => void;

  /** When set, the Instagram-style creator profile overlay is shown. */
  profileCreatorId: string | null;
  openProfile: (creatorId: string) => void;
  closeProfile: () => void;

  followedCreatorIds: string[];
  toggleFollow: (creatorId: string) => void;

  modal: ModalId;
  openModal: (modal: Exclude<ModalId, null>) => void;
  closeModal: () => void;

  savedEventIds: string[];
  toggleSavedEvent: (id: string) => void;

  toast: string | null;
  showToast: (message: string) => void;
}

const JamsContext = createContext<JamsContextValue | null>(null);

export function JamsProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [focusedStreamId, setFocusedStreamId] = useState<string | null>(null);
  const [profileCreatorId, setProfileCreatorId] = useState<string | null>(null);
  const [followedCreatorIds, setFollowedCreatorIds] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalId>(null);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout((showToast as unknown as { _t?: number })._t);
    (showToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(null), 2500);
  }, []);

  const navigate = useCallback((tab: TabId) => {
    setProfileCreatorId(null);
    setActiveTab(tab);
  }, []);

  const openStream = useCallback((streamId: string) => {
    setProfileCreatorId(null);
    setFocusedStreamId(streamId);
    setActiveTab("reels");
  }, []);

  const openProfile = useCallback((creatorId: string) => {
    setModal(null);
    setProfileCreatorId(creatorId);
  }, []);

  const closeProfile = useCallback(() => setProfileCreatorId(null), []);

  const login = useCallback(() => {
    setAuthed(true);
    setActiveTab("home");
  }, []);

  const logout = useCallback(() => {
    setAuthed(false);
    setModal(null);
    setProfileCreatorId(null);
    setActiveTab("home");
  }, []);

  const toggleFollow = useCallback(
    (creatorId: string) => {
      setFollowedCreatorIds((prev) => {
        const has = prev.includes(creatorId);
        showToast(has ? "Unfollowed creator" : "Following creator");
        return has ? prev.filter((x) => x !== creatorId) : [...prev, creatorId];
      });
    },
    [showToast],
  );

  const toggleSavedEvent = useCallback(
    (id: string) => {
      setSavedEventIds((prev) => {
        const has = prev.includes(id);
        showToast(has ? "Removed from saved events" : "Event saved to your profile");
        return has ? prev.filter((x) => x !== id) : [...prev, id];
      });
    },
    [showToast],
  );

  const value = useMemo<JamsContextValue>(
    () => ({
      authed,
      login,
      logout,
      activeTab,
      navigate,
      focusedStreamId,
      openStream,
      profileCreatorId,
      openProfile,
      closeProfile,
      followedCreatorIds,
      toggleFollow,
      modal,
      openModal: (m) => setModal(m),
      closeModal: () => setModal(null),
      savedEventIds,
      toggleSavedEvent,
      toast,
      showToast,
    }),
    [
      authed,
      login,
      logout,
      activeTab,
      navigate,
      focusedStreamId,
      openStream,
      profileCreatorId,
      openProfile,
      closeProfile,
      followedCreatorIds,
      toggleFollow,
      modal,
      savedEventIds,
      toggleSavedEvent,
      toast,
      showToast,
    ],
  );

  return <JamsContext.Provider value={value}>{children}</JamsContext.Provider>;
}

export function useJams() {
  const ctx = useContext(JamsContext);
  if (!ctx) throw new Error("useJams must be used within a JamsProvider");
  return ctx;
}
