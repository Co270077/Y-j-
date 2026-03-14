import * as m from 'motion/react-m'
import { snappy } from '../../motion/transitions'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      {label && <span className="text-sm text-text-secondary">{label}</span>}
      <m.button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        animate={{
          backgroundColor: checked ? 'var(--color-white)' : 'var(--color-surface-overlay)',
        }}
        transition={snappy}
        whileTap={{ scale: 0.97, transition: snappy }}
        className="relative w-11 h-6 rounded-full cursor-pointer"
      >
        <m.span
          animate={{ x: checked ? 20 : 0 }}
          transition={snappy}
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-sm bg-black"
        />
      </m.button>
    </label>
  )
}
