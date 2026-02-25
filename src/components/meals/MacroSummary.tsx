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

  if (compact) {
    return (
      <p className="text-[10px] text-text-muted">
        {cal} cal · P{p}g · C{c}g · F{f}g
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
      <div className="flex h-2 rounded-full overflow-hidden bg-charcoal mb-2">
        <div className="bg-cat-workout transition-all" style={{ width: `${proteinPct}%` }} />
        <div className="bg-cat-supplement transition-all" style={{ width: `${carbsPct}%` }} />
        <div className="bg-cat-meal transition-all" style={{ width: `${fatPct}%` }} />
      </div>

      <div className="grid grid-cols-4 gap-1">
        <div className="text-center">
          <p className="text-sm font-bold text-cat-meal">{cal}</p>
          <p className="text-[10px] text-text-muted">Cal</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-cat-workout">{p}g</p>
          <p className="text-[10px] text-text-muted">Protein</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-cat-supplement">{c}g</p>
          <p className="text-[10px] text-text-muted">Carbs</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-cat-meal">{f}g</p>
          <p className="text-[10px] text-text-muted">Fat</p>
        </div>
      </div>
    </div>
  )
}
