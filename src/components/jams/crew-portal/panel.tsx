import { CloseIcon } from "../icons"

interface CrewPanelProps {
  title: string
  subtitle?: string
  onClose: () => void
  /** Sticky tab row rendered under the header. */
  tabs?: React.ReactNode
  /** Pinned footer, e.g. a primary toggle/action. */
  footer?: React.ReactNode
  children: React.ReactNode
}

/**
 * Full-shell overlay used by every crew tool sub-view. Stays inside the phone
 * shell (absolute, not fixed) so it never covers the surrounding app chrome.
 */
export function CrewPanel({ title, subtitle, onClose, tabs, footer, children }: CrewPanelProps) {
  return (
    <div className="absolute inset-0 z-[80] flex flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-surface-2 px-4 py-3.5">
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </header>

      {tabs ? (
        <div className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto border-b border-border bg-surface-2 px-4 py-2.5">
          {tabs}
        </div>
      ) : null}

      <div className="no-scrollbar flex-1 overflow-y-auto p-4">{children}</div>

      {footer ? (
        <div className="shrink-0 border-t border-border bg-surface-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

export function CrewTab({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-secondary text-muted-foreground"
      }`}
    >
      {children}
    </button>
  )
}

export function CrewSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground">{children}</span>
  )
}
