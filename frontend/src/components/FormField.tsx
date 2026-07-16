import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  wrapperClassName?: string
}

export function FormField({ label, wrapperClassName = 'mb-4', ...inputProps }: FormFieldProps) {
  return (
    <div className={wrapperClassName}>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <input
        {...inputProps}
        className="w-full bg-secondary text-foreground placeholder-muted-foreground px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )
}
