import { useMemo, useState } from "react";
import { useCreatorProfile, useEvents, useReels } from "@/lib/jams/data";
import type { ProfilePost } from "@/lib/jams/types";
import { useJams } from "../jams-context";
import {
  BookmarkIcon,
  ChevronLeftIcon,
  EyeIcon,
  GridIcon,
  HeartIcon,
  PinIcon,
  ReelsIcon,
  SearchIcon,
  ShareIcon,
  TipIcon,
} from "../icons";

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

type ProfileTab = "grid" | "reels" | "collectibles" | "saved";

export function ProfileView({ creatorId, showBack = true }: { creatorId: string; showBack?: boolean }) {
  const profile = useCreatorProfile(creatorId);
  const reels = useReels();
  const events = useEvents();
  const {
    closeProfile,
    openStream,
    openModal,
    followedCreatorIds,
    toggleFollow,
    savedEventIds,
    toggleSavedEvent,
    showToast,
  } = useJams();
  const [tab, setTab] = useState<ProfileTab>("grid");

  const liveReel = useMemo(
    () => reels.find((r) => r.creator.id === creatorId && r.isLive),
    [reels, creatorId],
  );

  const isOwnProfile = creatorId === "me";
  const savedEvents = useMemo(
    () => (isOwnProfile ? events.filter((e) => savedEventIds.includes(e.id)) : []),
    [events, savedEventIds, isOwnProfile],
  );

  if (!profile) return null;

  const { creator, stats, posts } = profile;
  const following = followedCreatorIds.includes(creator.id);

  const visiblePosts: ProfilePost[] =
    tab === "grid"
      ? posts
      : tab === "reels"
        ? posts.filter((p: ProfilePost) => p.isReel)
        : [];

  const collectibles = [
    { id: "c1", name: "Founding Bboy", rarity: "legendary", color: "#F5C518" },
    { id: "c2", name: "Cypher King", rarity: "rare", color: "#DC2626" },
    { id: "c3", name: "Windmill Master", rarity: "legendary", color: "#F5C518" },
    { id: "c4", name: "Floor General", rarity: "rare", color: "#DC2626" },
    { id: "c5", name: "Jam Pioneer", rarity: "legendary", color: "#F5C518" },
    { id: "c6", name: "Beat Stomper", rarity: "rare", color: "#DC2626" },
    { id: "c7", name: "Culture Keeper", rarity: "legendary", color: "#F5C518" },
    { id: "c8", name: "Street Scholar", rarity: "rare", color: "#DC2626" },
    { id: "c9", name: "Golden Frame", rarity: "legendary", color: "#F5C518" },
  ]

  function handlePostTap(post: ProfilePost) {
    if (post.streamId) {
      openStream(post.streamId);
      return;
    }
    showToast(post.isReel ? "Opening reel..." : "Opening post...");
  }

  return (
    <div className="animate-slide-in-right absolute inset-0 z-30 flex flex-col bg-background">
      {/* Search bar */}
      <div className="shrink-0 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 backdrop-blur-md">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search creators, reels, or tags..."
            className="flex-1 border-0 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-3">
        {showBack ? (
          <button
            type="button"
            onClick={closeProfile}
            aria-label="Back"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        ) : null}
        {liveReel ? (
          <button
            type="button"
            onClick={() => openStream(liveReel.id)}
            className="flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-[10px] font-black uppercase text-live-foreground"
          >
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-live-foreground" />
            Live
          </button>
        ) : null}
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto pb-24">
        {/* Identity block */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => (liveReel ? openStream(liveReel.id) : showToast("No live story"))}
              aria-label={`${creator.displayName} story`}
              className={`relative h-[86px] w-[86px] shrink-0 rounded-full p-[3px] ${
                liveReel
                  ? "animate-pulse-ring bg-[linear-gradient(45deg,var(--live),var(--primary),var(--chart-3))]"
                  : "bg-secondary"
              }`}
            >
              <span
                className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-background ${
                  creator.avatarUrl ? "" : "bg-surface-2 text-3xl font-extrabold text-foreground"
                }`}
                style={
                  creator.avatarUrl
                    ? undefined
                    : creator.accentColor
                      ? { background: creator.accentColor, color: "var(--primary-foreground)" }
                      : undefined
                }
              >
                {creator.avatarUrl ? (
                  <img
                    src={creator.avatarUrl}
                    alt={creator.displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  creator.initials
                )}
              </span>
            </button>

            <dl className="flex flex-1 justify-between text-center">
              {[
                ["Posts", stats.posts],
                ["Followers", stats.followers],
                ["Following", stats.following],
              ].map(([label, value]) => (
                <div key={label as string} className="flex-1">
                  <dd className="text-base font-extrabold text-foreground">
                    {formatCount(value as number)}
                  </dd>
                  <dt className="text-[11px] text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Bio */}
          <div className="mt-3.5">
            <h2 className="text-sm font-bold text-foreground">{creator.displayName}</h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold text-muted-foreground">@{creator.handle}</p>
              {profile.crew ? (
                <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {profile.crew}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{profile.bio}</p>
            {profile.location ? (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <PinIcon className="h-3 w-3 text-primary" /> {profile.location}
              </p>
            ) : null}
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() =>
                isOwnProfile ? showToast("Profile editing coming soon") : toggleFollow(creator.id)
              }
              className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-colors ${
                isOwnProfile || following
                  ? "border border-border bg-secondary text-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {isOwnProfile ? "Edit Profile" : following ? "Following" : "Follow"}
            </button>
            <button
              type="button"
              onClick={() => openModal("tip")}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-primary px-4 py-2.5 text-[13px] font-bold text-primary"
            >
              <TipIcon className="h-4 w-4" /> Tip
            </button>
            <button
              type="button"
              onClick={async () => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  await navigator.clipboard.writeText(`https://jams.app/@${creator.handle}`);
                  showToast("Profile link copied");
                }
              }}
              aria-label="Share profile"
              className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-border bg-secondary text-foreground"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Highlights */}
          <div className="no-scrollbar mt-4 flex gap-3.5 overflow-x-auto pb-1">
            {["Jams", "Battles", "Workshops", "Sets"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => showToast(`${label} highlights coming soon`)}
                className="flex min-w-[62px] flex-col items-center gap-1.5"
              >
                <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-border bg-surface-2 text-[10px] font-bold uppercase text-muted-foreground">
                  {label.slice(0, 3)}
                </span>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex w-full flex-row items-center justify-around border-b border-white/10">
          {(
            [
              ["grid", "Posts", GridIcon],
              ["reels", "Reels", ReelsIcon],
              ["collectibles", "Collectibles", null],
              ["saved", "Saved", BookmarkIcon],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-label={label}
              aria-selected={tab === id}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium ${
                tab === id
                  ? "border-b-2 border-primary text-primary"
                  : "border-b-2 border-transparent text-muted-foreground"
              }`}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              {label}
            </button>
          ))}
        </div>

        {/* Collectibles */}
        {tab === "collectibles" ? (
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {collectibles.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 p-2.5"
                  style={{ backgroundColor: "#161B22" }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-lg text-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}33, ${item.color}11)`,
                      border: `1px solid ${item.color}55`,
                    }}
                  >
                    <span style={{ color: item.color }} className="text-lg font-black">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-center text-[9px] font-bold leading-tight text-foreground">
                    {item.name}
                  </p>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[7px] font-black uppercase"
                    style={{
                      color: item.color,
                      border: `1px solid ${item.color}44`,
                    }}
                  >
                    {item.rarity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : /* Saved events */
        tab === "saved" ? (
          savedEvents.length ? (
            <ul className="flex flex-col gap-2.5 p-4">
              {savedEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-[46px] w-[46px] flex-col items-center justify-center rounded-lg bg-secondary text-[11px] font-bold leading-tight text-foreground">
                      {event.month}
                      <span className="text-sm">{event.day}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold text-foreground">
                        {event.title}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {event.location} • {event.time}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSavedEvent(event.id)}
                    aria-label="Remove saved event"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-12 text-center text-xs text-muted-foreground">
              {isOwnProfile
                ? "Save events from the home feed and they'll collect here."
                : "This creator's saved jams are private."}
            </p>
          )
        ) : visiblePosts.length ? (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {visiblePosts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => handlePostTap(post)}
                className="group relative aspect-square overflow-hidden"
                aria-label={post.isLive ? "Open live stream" : "Open post"}
              >
                <span className="absolute inset-0" style={{ background: post.gradient }} />
                <span
                  className="absolute inset-0 opacity-30"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, transparent, transparent 8px, oklch(1 0 0 / 0.05) 8px, oklch(1 0 0 / 0.05) 16px)",
                  }}
                />
                {post.isLive ? (
                  <span className="absolute left-1 top-1 rounded bg-live px-1 py-0.5 text-[8px] font-black uppercase text-live-foreground">
                    Live
                  </span>
                ) : post.isReel ? (
                  <ReelsIcon className="absolute right-1 top-1 h-3.5 w-3.5 text-foreground/80" />
                ) : null}
                <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-4 text-[9px] font-semibold text-foreground">
                  <HeartIcon className="h-3 w-3" /> {formatCount(post.likes)}
                  {post.isLive ? (
                    <>
                      <EyeIcon className="ml-auto h-3 w-3" /> live
                    </>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="px-6 py-12 text-center text-xs text-muted-foreground">No reels posted yet.</p>
        )}
      </div>
    </div>
  );
}
