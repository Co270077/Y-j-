import { useState } from 'react'
import Header from '../components/layout/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import MacroSummary from '../components/meals/MacroSummary'
import EatingWindowConfig from '../components/meals/EatingWindowConfig'
import MealTemplateEditor from '../components/meals/MealTemplateEditor'
import { useMealStore } from '../stores/mealStore'
import { useSettingsStore } from '../stores/settingsStore'
import { formatTimeDisplay } from '../utils/time'
import type { MealTemplate, EatingWindow } from '../db/types'
import { showToast } from '../components/ui/Toast'
import FAB from '../components/ui/FAB'

export default function MealsPage() {
  const [ewConfigOpen, setEwConfigOpen] = useState(false)
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MealTemplate | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const templates = useMealStore(s => s.templates)
  const addTemplate = useMealStore(s => s.addTemplate)
  const updateTemplate = useMealStore(s => s.updateTemplate)
  const deleteTemplate = useMealStore(s => s.deleteTemplate)
  const settings = useSettingsStore(s => s.settings)
  const setEatingWindow = useSettingsStore(s => s.setEatingWindow)

  const ew = settings?.eatingWindow

  const handleSaveEatingWindow = async (ew: EatingWindow) => {
    await setEatingWindow(ew)
    showToast('Eating window saved')
  }

  const handleSaveTemplate = async (data: Omit<MealTemplate, 'id' | 'createdAt'>) => {
    if (editingTemplate?.id) {
      await updateTemplate(editingTemplate.id, data)
      showToast('Meal template updated')
    } else {
      await addTemplate(data)
      showToast('Meal template created')
    }
    setEditingTemplate(null)
  }

  const handleDeleteRequest = () => {
    setConfirmDelete(true)
  }

  const handleDeleteConfirm = async () => {
    if (editingTemplate?.id) {
      await deleteTemplate(editingTemplate.id)
      showToast('Meal template deleted')
      setEditingTemplate(null)
      setTemplateEditorOpen(false)
      setConfirmDelete(false)
    }
  }

  // Calculate daily macro totals across all templates
  const dailyTotals = templates.reduce(
    (acc, tpl) => ({
      calories: acc.calories + tpl.totalCalories,
      protein: acc.protein + tpl.totalProtein,
      carbs: acc.carbs + tpl.totalCarbs,
      fat: acc.fat + tpl.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return (
    <>
      <Header
        title="Meals"
        subtitle={`${templates.length} template${templates.length !== 1 ? 's' : ''}`}
        rightAction={
          <button
            onClick={() => { setEditingTemplate(null); setTemplateEditorOpen(true) }}
            aria-label="Add new meal template"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-bamboo text-warm-white hover:bg-bamboo-dark transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        }
      />

      <div className="px-5 py-4 max-w-lg mx-auto flex flex-col gap-4">
        {/* Eating Window Card */}
        <Card onClick={() => setEwConfigOpen(true)}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Eating Window</p>
            <span className="text-[10px] text-bamboo font-medium">Edit</span>
          </div>
          {ew ? (
            <div>
              <p className="text-sm font-semibold text-text-primary">{ew.protocol}</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {formatTimeDisplay(ew.windowStart)} – {formatTimeDisplay(ew.windowEnd)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-text-muted">Tap to configure your fasting protocol</p>
          )}
        </Card>

        {/* Daily macro summary (if templates exist) */}
        {templates.length > 0 && (
          <Card>
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">Daily Totals</p>
            <MacroSummary
              calories={dailyTotals.calories}
              protein={dailyTotals.protein}
              carbs={dailyTotals.carbs}
              fat={dailyTotals.fat}
            />
          </Card>
        )}

        {/* Meal Templates */}
        <div>
          <h2 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">Meal Templates</h2>

          {templates.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-surface-raised flex items-center justify-center mb-3 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
              </div>
              <p className="text-sm text-text-muted">No meal templates yet</p>
              <p className="text-xs text-text-muted/60 mt-1">Create templates for your common meals</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => { setEditingTemplate(null); setTemplateEditorOpen(true) }}
              >
                Create first template
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {templates.map(tpl => (
                <Card key={tpl.id} onClick={() => { setEditingTemplate(tpl); setTemplateEditorOpen(true) }}>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{tpl.name}</h3>
                  <p className="text-xs text-text-muted mb-2">{tpl.foods.length} food{tpl.foods.length !== 1 ? 's' : ''}</p>
                  <MacroSummary
                    calories={tpl.totalCalories}
                    protein={tpl.totalProtein}
                    carbs={tpl.totalCarbs}
                    fat={tpl.totalFat}
                    compact
                  />
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <EatingWindowConfig
        isOpen={ewConfigOpen}
        onClose={() => setEwConfigOpen(false)}
        onSave={handleSaveEatingWindow}
        current={ew || null}
      />

      <MealTemplateEditor
        isOpen={templateEditorOpen}
        onClose={() => { setTemplateEditorOpen(false); setEditingTemplate(null) }}
        onSave={handleSaveTemplate}
        onDelete={editingTemplate ? handleDeleteRequest : undefined}
        initial={editingTemplate}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Template"
        message={`Delete "${editingTemplate?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(false)}
      />

      <FAB onClick={() => { setEditingTemplate(null); setTemplateEditorOpen(true) }} label="Log meal" />
    </>
  )
}
