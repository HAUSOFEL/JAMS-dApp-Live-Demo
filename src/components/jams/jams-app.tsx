
import { BottomNav } from "./bottom-nav"
import { JamsProvider, useJams } from "./jams-context"
import { AppModals } from "./modals"
import { Toast } from "./toast"
import { TopNav } from "./top-nav"
import { BlinksView } from "./views/blinks-view"
import { ChatView } from "./views/chat-view"
import { HomeView } from "./views/home-view"
import { LoginView } from "./views/login-view"
import { MapView } from "./views/map-view"
import { ProfileView } from "./views/profile-view"
import { ReelsView } from "./views/reels-view"

/** Views that render their own full-bleed layout (no padded scroll wrapper). */
const FULL_BLEED = new Set(["reels", "map", "profile"])

function ActiveView() {
  const { activeTab } = useJams()

  if (FULL_BLEED.has(activeTab)) {
    if (activeTab === "profile") {
      return <ProfileView creatorId="me" showBack={false} />
    }
    return activeTab === "reels" ? <ReelsView /> : <MapView />
  }

  return (
    <div className="no-scrollbar absolute inset-0 overflow-y-auto p-4 pb-24">
      {activeTab === "home" ? <HomeView /> : null}
      {activeTab === "chat" ? <ChatView /> : null}
      {activeTab === "blinks" ? <BlinksView /> : null}
    </div>
  )
}

function Shell() {
  const { authed, profileCreatorId } = useJams()

  return (
    <div className="relative flex h-[840px] w-full max-w-[412px] flex-col overflow-hidden rounded-[36px] border-[6px] border-foreground/80 bg-surface shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
      {authed ? <TopNav /> : null}

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {authed ? <ActiveView /> : <LoginView />}
        {authed && profileCreatorId ? <ProfileView creatorId={profileCreatorId} /> : null}
      </div>

      {authed ? <BottomNav /> : null}

      <AppModals />
      <Toast />
    </div>
  )
}

export function JamsApp() {
  return (
    <JamsProvider>
      <Shell />
    </JamsProvider>
  )
}
