import * as m from 'motion/react-m'
import { scaleIn } from '../../motion/variants'
import { hapticLight } from '../../utils/haptics'
import { snappy } from '../../motion/transitions'

interface FABProps {
  onClick: () => void
  label: string
}

export default function FAB({ onClick, label }: FABProps) {
  return (
    <m.button
      variants={scaleIn}
      initial="initial"
      animate="animate"
      whileTap={{ scale: 0.97, transition: snappy }}
      onClick={() => { hapticLight(); onClick() }}
      aria-label={label}
      className="fixed bottom-[calc(4rem+16px+env(safe-area-inset-bottom,0px))] right-4 z-40 w-14 h-14 rounded-lg bg-white text-black flex items-center justify-center cursor-pointer"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </m.button>
  )
}
