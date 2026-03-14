import * as m from 'motion/react-m'
import { useCountUp } from '../../hooks/useCountUp'
import { snappy } from '../../motion/transitions'

interface MacroSummaryProps {
  calories: number
  protein: number
  carbs: number
  fat: number
  compact?: boolean
}

export default function MacroSummary({ calories, protein, carbs, fat, compact = false }: MacroSummaryProps) {
  const cal = Math.round(calories)
  const p = Math.round(protein)
  const c = Math.round(carbs)
  const f = Math.round(fat)

  const animatedCal = useCountUp(cal)
  const animatedP = useCountUp(p)
  const animatedC = useCountUp(c)
  const animatedF = useCountUp(f)

  if (compact) {
    return (
      <p className="text-[10px] text-text-muted">
        {animatedCal} cal · P{animatedP}g · C{animatedC}g · F{animatedF}g
      </p>
    )
  }

  const total = p + c + f
  const proteinPct = total > 0 ? (p / total) * 100 : 0
  const carbsPct = total > 0 ? (c / total) * 100 : 0
  const fatPct = total > 0 ? (f / total) * 100 : 0

  return (
    <div>
      {/* Macro bar */}
      <div className="flex h-2 overflow-hidden bg-gray-800 mb-2">
        <m.div className="bg-cat-workout" animate={{ width: `${proteinPct}%` }} transition={snappy} />
        <m.div className="bg-cat-supplement" animate={{ width: `${carbsPct}%` }} transition={snappy} />
        <m.div className="bg-cat-meal" animate={{ width: `${fatPct}%` }} transition={snappy} />
      </div>

      <div className="grid grid-cols-4 gap-1">
        <div className="text-center">
          <p className="text-sm font-bold text-white">{animatedCal}</p>
          <p className="text-[10px] text-text-muted">Cal</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-300">{animatedP}g</p>
          <p className="text-[10px] text-text-muted">Protein</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-300">{animatedC}g</p>
          <p className="text-[10px] text-text-muted">Carbs</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-300">{animatedF}g</p>
          <p className="text-[10px] text-text-muted">Fat</p>
        </div>
      </div>
    </div>
  )
}
