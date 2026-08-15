import { useMemo, useState } from "react";
import { useCreatorProfile, useReels } from "@/lib/jams/data";
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
  ShareIcon,
  TipIcon,
} from "../icons";

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

type ProfileTab = "grid" | "reels" | "saved";

export function ProfileView({ creatorId, showBack = true }: { creatorId: string; showBack?: boolean }) {
  const profile = useCreatorProfile(creatorId);
  const reels = useReels();
  const { closeProfile, openStream, openModal, followedCreatorIds, toggleFollow, showToast } =
    useJams();
  const [tab, setTab] = useState<ProfileTab>("grid");

  const liveReel = useMemo(
    () => reels.find((r) => r.creator.id === creatorId && r.isLive),
    [reels, creatorId],
  );

  if (!profile) return null;

  const { creator, stats, posts } = profile;
  const following = followedCreatorIds.includes(creator.id);

  const visiblePosts: ProfilePost[] =
    tab === "grid" ? posts : tab === "reels" ? posts.filter((p: ProfilePost) => p.isReel) : [];

  function handlePostTap(post: ProfilePost) {
    if (post.streamId) {
      openStream(post.streamId);
      return;
    }
    showToast(post.isReel ? "Opening reel..." : "Opening post...");
  }

  return (
    <div className="animate-slide-in-right absolute inset-0 z-30 flex flex-col bg-background">
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
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">@{creator.handle}</p>
          {profile.crew ? (
            <p className="truncate text-[11px] text-muted-foreground">{profile.crew}</p>
          ) : null}
        </div>
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
                className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-background bg-surface-2 text-3xl font-extrabold text-foreground"
                style={
                  creator.accentColor
                    ? { background: creator.accentColor, color: "var(--primary-foreground)" }
                    : undefined
                }
              >
                {creator.initials}
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
            {profile.crew ? (
              <p className="text-[11px] font-semibold text-primary">{profile.crew}</p>
            ) : null}
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
              onClick={() => toggleFollow(creator.id)}
              className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-colors ${
                following
                  ? "border border-border bg-secondary text-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {following ? "Following" : "Follow"}
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
        <div className="mt-4 grid grid-cols-3 border-y border-border">
          {(
            [
              ["grid", "Posts", GridIcon],
              ["reels", "Reels", ReelsIcon],
              ["saved", "Saved", BookmarkIcon],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-label={label}
              aria-selected={tab === id}
              className={`flex items-center justify-center gap-1.5 py-3 text-[11px] font-semibold ${
                tab === id
                  ? "border-b-2 border-primary text-primary"
                  : "border-b-2 border-transparent text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {visiblePosts.length ? (
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
          <p className="px-6 py-12 text-center text-xs text-muted-foreground">
            {tab === "saved"
              ? "Saved posts from this creator will show up here."
              : "No reels posted yet."}
          </p>
        )}
      </div>
    </div>
  );
}
