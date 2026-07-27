import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export interface InfoModalProps {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

export function InfoModal({ open, title, children, onClose }: InfoModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl border border-card-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="info-modal-title" className="font-heading text-lg font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 overflow-y-auto pr-1 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#0066ff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0055d9]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
