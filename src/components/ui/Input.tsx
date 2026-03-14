import { type InputHTMLAttributes, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, className = '', id: externalId, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = externalId || generatedId

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">{label}</label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2.5 text-sm
          bg-surface-raised border border-gray-700
          rounded-[var(--radius-md)]
          text-text-primary placeholder:text-text-muted
          outline-none focus:border-white/40
          transition-colors
          ${className}
        `}
        {...props}
      />
    </div>
  )
}
