import { useSyncExternalStore } from "react"
import type { ProfilePost } from "./types"

// Session-only store for content the signed-in dancer uploads from Creator Studio.
// Files stay on the device (object URLs); nothing is sent to a server yet.
let uploads: ProfilePost[] = []
const listeners = new Set<() => void>()
const EMPTY: ProfilePost[] = []

export function addUpload(post: ProfilePost) {
  uploads = [post, ...uploads]
  listeners.forEach((l) => l())
}

export function useUploads() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => uploads,
    () => EMPTY,
  )
}
