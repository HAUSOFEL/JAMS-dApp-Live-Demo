// Sample follow graph built from existing creators. Demo-only, kept on this device.
import { mockProfiles } from "./mock-data"
import type { Creator } from "./types"

export const allCreators = (): Creator[] => Object.values(mockProfiles).map((p) => p.creator)

/** Creators who keep their follow lists private (sample). */
export const PRIVATE_LIST_CREATORS = new Set(["shadow"])

/** Deterministic sample lists: who follows X, and who X follows. */
export function sampleFollowers(id: string): string[] {
  const ids = allCreators().map((c) => c.id).filter((c) => c !== id)
  return ids.filter((_, i) => (i + id.length) % 3 !== 0)
}
export function sampleFollowing(id: string): string[] {
  const ids = allCreators().map((c) => c.id).filter((c) => c !== id)
  return ids.filter((_, i) => (i + id.length) % 2 === 0)
}

/** Lists are visible to the owner always; to others only if not private. */
export function canViewLists(ownerId: string, viewerId: string, ownerPrivate: boolean) {
  return ownerId === viewerId || !ownerPrivate
}

/** Current-session sample relationships shared by profiles and connection sheets. */
export function followingIds(ownerId: string, myFollowing: string[], removedFollowers: string[]): string[] {
  if (ownerId === "me") return myFollowing
  const ids = sampleFollowing(ownerId).filter((id) => id !== "me")
  return sampleFollowers("me").includes(ownerId) && !removedFollowers.includes(ownerId) ? [...ids, "me"] : ids
}

export function followerIds(ownerId: string, myFollowing: string[], removedFollowers: string[]): string[] {
  if (ownerId === "me") return sampleFollowers("me").filter((id) => !removedFollowers.includes(id))
  const ids = sampleFollowers(ownerId).filter((id) => id !== "me")
  return myFollowing.includes(ownerId) ? [...ids, "me"] : ids
}

export function toggleFollowing(ids: string[], creatorId: string): string[] {
  if (creatorId === "me") return ids
  return ids.includes(creatorId) ? ids.filter((id) => id !== creatorId) : [...ids, creatorId]
}
