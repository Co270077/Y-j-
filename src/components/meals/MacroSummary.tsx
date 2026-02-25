interface MacroSummaryProps {
  calories: number
  protein: number
  carbs: number
  fat: number
  compact?: boolean
}

export default function MacroSummary({ calories, protein, carbs, fat, compact = false }: MacroSummaryProps) {
  if (compact) {
    return (
      <p className="text-[10px] text-text-muted">
        {calories} cal · P{protein}g · C{carbs}g · F{fat}g
      </p>
    )
  }

  const total = protein + carbs + fat
  const proteinPct = total > 0 ? (protein / total) * 100 : 0
  const carbsPct = total > 0 ? (carbs / total) * 100 : 0
  const fatPct = total > 0 ? (fat / total) * 100 : 0

  return (
    <div>
      {/* Macro bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-charcoal mb-2">
        <div className="bg-cat-workout transition-all" style={{ width: `${proteinPct}%` }} />
        <div className="bg-cat-supplement transition-all" style={{ width: `${carbsPct}%` }} />
        <div className="bg-cat-meal transition-all" style={{ width: `${fatPct}%` }} />
      </div>

      <div className="grid grid-cols-4 gap-1">
        <div className="text-center">
          <p className="text-sm font-bold text-cat-meal">{calories}</p>
          <p className="text-[10px] text-text-muted">Cal</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-cat-workout">{protein}g</p>
          <p className="text-[10px] text-text-muted">Protein</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-cat-supplement">{carbs}g</p>
          <p className="text-[10px] text-text-muted">Carbs</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-cat-meal">{fat}g</p>
          <p className="text-[10px] text-text-muted">Fat</p>
        </div>
      </div>
    </div>
  )
}
