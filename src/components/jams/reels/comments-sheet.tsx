
import { useEffect, useRef, useState } from "react"
import { useStreamComments } from "@/lib/jams/data"
import { CloseIcon } from "../icons"

interface CommentsSheetProps {
  streamId: string | null
  onClose: () => void
}

export function CommentsSheet({ streamId, onClose }: CommentsSheetProps) {
  const { comments, postComment } = useStreamComments(streamId)
  const [value, setValue] = useState("")
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight })
  }, [comments])

  if (!streamId) return null

  function submit() {
    if (!value.trim()) return
    postComment(value)
    setValue("")
  }

  return (
    <div className="absolute inset-x-0 bottom-[70px] z-[100] flex h-1/2 flex-col rounded-t-2xl border-t border-border bg-[rgba(5,19,41,0.95)] p-4 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border pb-2.5 text-sm font-bold">
        <h4>Live Stream Comments</h4>
        <button type="button" onClick={onClose} aria-label="Close comments" className="text-white">
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div ref={feedRef} className="no-scrollbar flex-1 overflow-y-auto py-2.5 text-[13px]">
        {comments.length === 0 ? (
          <p className="mt-5 text-center text-sm text-muted-foreground">Drop a vibe in the chat...</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="mb-2">
              <strong className="text-primary">{c.author}:</strong>{" "}
              <span className="text-foreground">{c.text}</span>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2.5 pt-2.5">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) submit()
          }}
          placeholder="Say something..."
          aria-label="Write a comment"
          className="flex-1 rounded-full bg-secondary px-4 py-2.5 text-[13px] text-white outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-full bg-primary px-4 text-[13px] font-bold text-primary-foreground"
        >
          Post
        </button>
      </div>
    </div>
  )
}
