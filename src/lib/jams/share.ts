/** Native share sheet when available, otherwise copy the link. Returns what happened. */
export async function shareLink(data: { title: string; text?: string; url: string }): Promise<"shared" | "copied" | "cancelled" | "failed"> {
  if (typeof navigator === "undefined") return "failed"
  if (navigator.share) {
    try {
      await navigator.share(data)
      return "shared"
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled"
    }
  }
  try {
    await navigator.clipboard.writeText(data.text ? `${data.text} ${data.url}` : data.url)
    return "copied"
  } catch {
    return "failed"
  }
}

export const shareToastText = (r: Awaited<ReturnType<typeof shareLink>>) =>
  r === "copied" ? "Link copied to clipboard" : r === "failed" ? "Couldn't share — try again" : null

export const appUrl = (path: string) =>
  `${typeof window !== "undefined" ? window.location.origin : "https://jams-live-dapp-demo.lovable.app"}${path}`
