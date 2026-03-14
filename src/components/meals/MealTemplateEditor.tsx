import { useState, useEffect } from 'react'
import BottomSheet from '../ui/BottomSheet'
import Input from '../ui/Input'
import Button from '../ui/Button'
import type { MealTemplate, FoodItem } from '../../db/types'
import { generateId } from '../../utils/ids'

interface MealTemplateEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (template: Omit<MealTemplate, 'id' | 'createdAt'>) => void
  onDelete?: () => void
  initial?: MealTemplate | null
}

export default function MealTemplateEditor({ isOpen, onClose, onSave, onDelete, initial }: MealTemplateEditorProps) {
  const [name, setName] = useState('')
  const [foods, setFoods] = useState<FoodItem[]>([])

  // Food being added
  const [addingFood, setAddingFood] = useState(false)
  const [foodName, setFoodName] = useState('')
  const [foodCalories, setFoodCalories] = useState('')
  const [foodProtein, setFoodProtein] = useState('')
  const [foodCarbs, setFoodCarbs] = useState('')
  const [foodFat, setFoodFat] = useState('')

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setFoods(initial.foods)
    } else {
      setName('')
      setFoods([])
    }
    setAddingFood(false)
    setFoodName('')
    setFoodCalories('')
    setFoodProtein('')
    setFoodCarbs('')
    setFoodFat('')
  }, [initial, isOpen])

  const resetFoodForm = () => {
    setAddingFood(false)
    setFoodName('')
    setFoodCalories('')
    setFoodProtein('')
    setFoodCarbs('')
    setFoodFat('')
  }

  const addFood = () => {
    if (!foodName.trim()) return
    setFoods(prev => [...prev, {
      id: generateId(),
      name: foodName.trim(),
      calories: Number(foodCalories) || 0,
      protein: Number(foodProtein) || 0,
      carbs: Number(foodCarbs) || 0,
      fat: Number(foodFat) || 0,
    }])
    resetFoodForm()
  }

  const removeFood = (id: string) => {
    setFoods(prev => prev.filter(f => f.id !== id))
  }

  const totals = foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      foods,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
    })
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Meal' : 'New Meal Template'} detent="full">
      <div className="flex flex-col gap-5">
        <Input label="Meal Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Breakfast Bowl" />

        {/* Foods list */}
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-2">Foods</label>
          {foods.map(f => (
            <div key={f.id} className="flex items-center gap-2 mb-2 p-2.5 bg-black rounded-[var(--radius-md)]">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">{f.name}</p>
                <p className="text-[10px] text-text-muted">{Math.round(f.calories)} cal · P{Math.round(f.protein)}g · C{Math.round(f.carbs)}g · F{Math.round(f.fat)}g</p>
              </div>
              <button onClick={() => removeFood(f.id)} className="text-text-muted hover:text-danger transition-colors cursor-pointer p-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          {addingFood ? (
            <div className="p-3 bg-black rounded-[var(--radius-md)] flex flex-col gap-2 mt-2">
              <Input placeholder="Food name" value={foodName} onChange={e => setFoodName(e.target.value)} />
              <div className="grid grid-cols-4 gap-2">
                <Input placeholder="Cal" type="number" value={foodCalories} onChange={e => setFoodCalories(e.target.value)} />
                <Input placeholder="P (g)" type="number" value={foodProtein} onChange={e => setFoodProtein(e.target.value)} />
                <Input placeholder="C (g)" type="number" value={foodCarbs} onChange={e => setFoodCarbs(e.target.value)} />
                <Input placeholder="F (g)" type="number" value={foodFat} onChange={e => setFoodFat(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={resetFoodForm}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={addFood} disabled={!foodName.trim()}>Add</Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setAddingFood(true)} fullWidth className="mt-2">
              + Add Food
            </Button>
          )}
        </div>

        {/* Macro summary */}
        {foods.length > 0 && (
          <div className="grid grid-cols-4 gap-2 p-3 bg-black rounded-[var(--radius-md)]">
            <div className="text-center">
              <p className="text-xs font-semibold text-white">{Math.round(totals.calories)}</p>
              <p className="text-[10px] text-text-muted">Cal</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-text-primary">{Math.round(totals.protein)}g</p>
              <p className="text-[10px] text-text-muted">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-text-primary">{Math.round(totals.carbs)}g</p>
              <p className="text-[10px] text-text-muted">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-text-primary">{Math.round(totals.fat)}g</p>
              <p className="text-[10px] text-text-muted">Fat</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {initial && onDelete && <Button variant="danger" size="md" onClick={onDelete}>Delete</Button>}
          <div className="flex-1" />
          <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={!name.trim()}>
            {initial ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
