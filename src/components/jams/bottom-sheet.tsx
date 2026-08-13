
import { CloseIcon } from "./icons"

interface BottomSheetProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
}

export function BottomSheet({ open, title, description, onClose, children }: BottomSheetProps) {
  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="animate-slide-up rounded-t-3xl border-t border-border bg-surface-2 p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {description ? (
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
