interface ConfirmationCardProps {
  icon: 'email' | 'check'
  title: string
  description: string
  buttonLabel: string
  onAction: () => void
}

const EmailIcon = () => (
  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

export function ConfirmationCard({ icon, title, description, buttonLabel, onAction }: ConfirmationCardProps) {
  const iconBg = icon === 'email' ? 'bg-blue-600/20' : 'bg-green-600/20'

  return (
    <div className="flex flex-col items-center py-4 gap-3">
      <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}>
        {icon === 'email' ? <EmailIcon /> : <CheckIcon />}
      </div>
      <p className="text-foreground font-semibold text-center">{title}</p>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 font-semibold font-body cursor-pointer whitespace-nowrap rounded-[10px] transition-all duration-150 py-3.5 px-6.5 text-[15px] bg-apex-voltage hover:bg-apex-voltage-ink text-white border border-transparent"
      >
        {buttonLabel}
      </button>
    </div>
  )
}
