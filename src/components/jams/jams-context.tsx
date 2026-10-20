import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { BattleBracket, BracketVote, ClaimedPass, DancerProfile, MapMarker, ModalId, TabId } from "@/lib/jams/types";
import { applyBracketVote, initialBrackets } from "@/lib/jams/brackets";

const PROFILE_KEY = "jams.dancerProfile";
const PASSES_KEY = "jams.claimedPasses";

interface JamsContextValue {
  authed: boolean;
  login: () => void;
  logout: () => void;

  activeTab: TabId;
  navigate: (tab: TabId) => void;
  activeEvent: MapMarker | null;
  openEvent: (event: MapMarker) => void;
  closeEvent: () => void;

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

  /** First-run welcome flow. */
  dancerProfile: DancerProfile | null;
  welcomeOpen: boolean;
  openWelcome: () => void;
  closeWelcome: () => void;
  saveDancerProfile: (profile: DancerProfile) => void;

  /** Tickets the dancer has claimed. */
  claimedPasses: ClaimedPass[];
  addClaimedPass: (pass: ClaimedPass) => void;

  crewTool: CrewToolId;
  openCrewTool: (tool: Exclude<CrewToolId, null>) => void;
  closeCrewTool: () => void;

  brackets: BattleBracket[];
  bracketOpen: boolean;
  openBrackets: () => void;
  closeBrackets: () => void;
  judgeBracket: (bracketId: string, matchId: string, vote: BracketVote) => void;

  toast: string | null;
  showToast: (message: string) => void;
}

export type CrewToolId = "scanner" | "events" | "dashboard" | null;

const JamsContext = createContext<JamsContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — state stays in memory for this session */
  }
}

export function JamsProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [activeEvent, setActiveEvent] = useState<MapMarker | null>(null);
  const [focusedStreamId, setFocusedStreamId] = useState<string | null>(null);
  const [profileCreatorId, setProfileCreatorId] = useState<string | null>(null);
  const [followedCreatorIds, setFollowedCreatorIds] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalId>(null);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [dancerProfile, setDancerProfile] = useState<DancerProfile | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [claimedPasses, setClaimedPasses] = useState<ClaimedPass[]>([]);
  const [crewTool, setCrewTool] = useState<CrewToolId>(null);
  const [brackets, setBrackets] = useState(initialBrackets);
  const [bracketOpen, setBracketOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Hydrate saved answers/tickets after mount so SSR markup stays stable.
  useEffect(() => {
    setDancerProfile(readStorage<DancerProfile | null>(PROFILE_KEY, null));
    setClaimedPasses(readStorage<ClaimedPass[]>(PASSES_KEY, []));
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout((showToast as unknown as { _t?: number })._t);
    (showToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(null), 2500);
  }, []);

  const navigate = useCallback((tab: TabId) => {
    setActiveEvent(null);
    setProfileCreatorId(null);
    setActiveTab(tab);
  }, []);

  const openStream = useCallback((streamId: string) => {
    setActiveEvent(null);
    setProfileCreatorId(null);
    setFocusedStreamId(streamId);
    setActiveTab("reels");
  }, []);

  const openProfile = useCallback((creatorId: string) => {
    setActiveEvent(null);
    setModal(null);
    setBracketOpen(false);
    setProfileCreatorId(creatorId);
  }, []);

  const closeProfile = useCallback(() => setProfileCreatorId(null), []);
  const openEvent = useCallback((event: MapMarker) => {
    setProfileCreatorId(null);
    setModal(null);
    setActiveEvent(event);
  }, []);
  const closeEvent = useCallback(() => setActiveEvent(null), []);

  const login = useCallback(() => {
    setAuthed(true);
    setActiveTab("home");
    // First-timers get the short welcome flow; returning dancers go straight in.
    setWelcomeOpen(readStorage<DancerProfile | null>(PROFILE_KEY, null) === null);
  }, []);

  const logout = useCallback(() => {
    setActiveEvent(null);
    setAuthed(false);
    setModal(null);
    setProfileCreatorId(null);
    setWelcomeOpen(false);
    setBracketOpen(false);
    setCrewTool(null);
    setActiveTab("home");
  }, []);

  const openWelcome = useCallback(() => {
    setModal(null);
    setWelcomeOpen(true);
  }, []);

  const closeWelcome = useCallback(() => setWelcomeOpen(false), []);

  const saveDancerProfile = useCallback((profile: DancerProfile) => {
    setDancerProfile(profile);
    writeStorage(PROFILE_KEY, profile);
  }, []);

  const addClaimedPass = useCallback((pass: ClaimedPass) => {
    setClaimedPasses((prev) => {
      const next = [pass, ...prev.filter((p) => p.id !== pass.id)];
      writeStorage(PASSES_KEY, next);
      return next;
    });
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
      activeEvent,
      openEvent,
      closeEvent,
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
      dancerProfile,
      welcomeOpen,
      openWelcome,
      closeWelcome,
      saveDancerProfile,
      claimedPasses,
      addClaimedPass,
      crewTool,
      openCrewTool: (t) => {
        setModal(null);
        setCrewTool(t);
      },
      closeCrewTool: () => setCrewTool(null),
      brackets,
      bracketOpen,
      openBrackets: () => { setModal(null); setBracketOpen(true); },
      closeBrackets: () => setBracketOpen(false),
      judgeBracket: (bracketId, matchId, vote) => {
        setBrackets((prev) => prev.map((bracket) => bracket.id === bracketId ? applyBracketVote(bracket, matchId, vote) : bracket));
        showToast(vote === "tie" ? "One more round!" : "Demo result updated — winner advances");
      },
      toast,
      showToast,
    }),
    [
      authed,
      login,
      logout,
      activeTab,
      navigate,
      activeEvent,
      openEvent,
      closeEvent,
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
      dancerProfile,
      welcomeOpen,
      openWelcome,
      closeWelcome,
      saveDancerProfile,
      claimedPasses,
      addClaimedPass,
      crewTool,
      brackets,
      bracketOpen,
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
