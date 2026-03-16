import { useState, useCallback, useEffect, useRef } from 'react'
import * as m from 'motion/react-m'
import { AnimatePresence } from 'motion/react'
import Header from '../components/layout/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SwipeActionRow from '../components/ui/SwipeActionRow'
import MacroSummary from '../components/meals/MacroSummary'
import EatingWindowConfig from '../components/meals/EatingWindowConfig'
import MealTemplateEditor from '../components/meals/MealTemplateEditor'
import { useMealStore } from '../stores/mealStore'
import { useSettingsStore } from '../stores/settingsStore'
import { formatTimeDisplay } from '../utils/time'
import type { MealTemplate, EatingWindow } from '../db/types'
import { showToast, showToastWithAction } from '../components/ui/Toast'
import FAB from '../components/ui/FAB'
import { slideUp } from '../motion/variants'
import { snappy } from '../motion/transitions'

const listStagger = {
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0 },
  },
}

export default function MealsPage() {
  const [ewConfigOpen, setEwConfigOpen] = useState(false)
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MealTemplate | null>(null)
  const [expandedTemplateId, setExpandedTemplateId] = useState<number | null>(null)
  const [hiddenTemplateIds, setHiddenTemplateIds] = useState<Set<number>>(new Set())
  const pendingDelete = useRef<{ templateId: number; timer: ReturnType<typeof setTimeout> } | null>(null)

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

  const toggleExpand = (id: number) => {
    setExpandedTemplateId(prev => prev === id ? null : id)
  }

  const handleSwipeDeleteTemplate = useCallback((tpl: MealTemplate) => {
    if (!tpl.id) return

    // Commit any existing pending delete immediately
    if (pendingDelete.current) {
      clearTimeout(pendingDelete.current.timer)
      deleteTemplate(pendingDelete.current.templateId)
      pendingDelete.current = null
    }

    const templateId = tpl.id
    setHiddenTemplateIds(prev => new Set([...prev, templateId]))

    const undoFn = () => {
      if (pendingDelete.current?.templateId === templateId) {
        clearTimeout(pendingDelete.current.timer)
        pendingDelete.current = null
      }
      setHiddenTemplateIds(prev => {
        const next = new Set(prev)
        next.delete(templateId)
        return next
      })
    }

    const timer = setTimeout(() => {
      deleteTemplate(templateId)
      pendingDelete.current = null
      setHiddenTemplateIds(prev => {
        const next = new Set(prev)
        next.delete(templateId)
        return next
      })
    }, 5000)

    pendingDelete.current = { templateId, timer }
    showToastWithAction('Meal template deleted', 'Undo', undoFn, 5000)
  }, [deleteTemplate])

  // Commit pending delete on unmount
  useEffect(() => {
    return () => {
      if (pendingDelete.current) {
        clearTimeout(pendingDelete.current.timer)
        deleteTemplate(pendingDelete.current.templateId)
        pendingDelete.current = null
      }
    }
  }, [deleteTemplate])

  const visibleTemplates = templates.filter(t => t.id == null || !hiddenTemplateIds.has(t.id))

  // Compute macro totals from foods (fallback if total fields are missing)
  const getMacros = (tpl: MealTemplate) => ({
    calories: tpl.totalCalories ?? tpl.foods.reduce((s, f) => s + (f.calories || 0), 0),
    protein: tpl.totalProtein ?? tpl.foods.reduce((s, f) => s + (f.protein || 0), 0),
    carbs: tpl.totalCarbs ?? tpl.foods.reduce((s, f) => s + (f.carbs || 0), 0),
    fat: tpl.totalFat ?? tpl.foods.reduce((s, f) => s + (f.fat || 0), 0),
  })

  // Calculate daily macro totals across all visible templates
  const dailyTotals = visibleTemplates.reduce(
    (acc, tpl) => {
      const m = getMacros(tpl)
      return {
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return (
    <>
      <Header
        title="Meals"
        subtitle={`${visibleTemplates.length} template${visibleTemplates.length !== 1 ? 's' : ''}`}
        rightAction={
          <button
            onClick={() => { setEditingTemplate(null); setTemplateEditorOpen(true) }}
            aria-label="Add new meal template"
            className="w-9 h-9 flex items-center justify-center rounded-sm bg-white text-black hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        }
      />

      <m.div className="px-5 py-4 max-w-lg mx-auto flex flex-col gap-4" variants={listStagger} initial="initial" animate="animate">
        {/* Eating Window Card — not swipeable (summary card) */}
        <m.div variants={slideUp}>
        <Card onClick={() => setEwConfigOpen(true)}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Eating Window</p>
            <span className="text-[10px] text-white font-medium">Edit</span>
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
        </m.div>

        {/* Daily macro summary — not swipeable (summary card) */}
        {visibleTemplates.length > 0 && (
          <m.div variants={slideUp}>
            <Card>
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">Daily Totals</p>
              <MacroSummary
                calories={dailyTotals.calories}
                protein={dailyTotals.protein}
                carbs={dailyTotals.carbs}
                fat={dailyTotals.fat}
              />
            </Card>
          </m.div>
        )}

        {/* Meal Templates */}
        <m.div variants={slideUp}>
          <h2 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">Meal Templates</h2>

          {visibleTemplates.length === 0 ? (
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
            <m.div className="flex flex-col gap-3" variants={listStagger} initial="initial" animate="animate">
              {visibleTemplates.map((tpl, index) => {
                const isExpanded = expandedTemplateId === tpl.id

                return (
                  <m.div key={tpl.id} variants={index < 10 ? slideUp : undefined}>
                    <SwipeActionRow onDelete={() => handleSwipeDeleteTemplate(tpl)}>
                      <Card
                        onClick={() => tpl.id && toggleExpand(tpl.id)}
                        className={isExpanded ? 'shadow-lg' : ''}
                      >
                        <h3 className="text-sm font-semibold text-text-primary mb-1">{tpl.name}</h3>
                        <p className="text-xs text-text-muted mb-2">{tpl.foods.length} food{tpl.foods.length !== 1 ? 's' : ''}</p>

                        {/* Collapsed: compact macro summary */}
                        {!isExpanded && (() => {
                          const m = getMacros(tpl)
                          return (
                            <MacroSummary
                              calories={m.calories}
                              protein={m.protein}
                              carbs={m.carbs}
                              fat={m.fat}
                              compact
                            />
                          )
                        })()}

                        {/* Expanded: full food list + macro detail + edit button */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <m.div
                              key="expanded"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1, transition: snappy }}
                              exit={{ height: 0, opacity: 0, transition: snappy }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div className="flex flex-col gap-1 mb-3">
                                {tpl.foods.map((food) => (
                                  <div key={food.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-cat-meal" />
                                      <span className="text-xs text-text-secondary">{food.name}</span>
                                    </div>
                                    <span className="text-[10px] text-text-muted tabular-nums">
                                      {food.calories}kcal · {food.protein}g P
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {(() => {
                                const m = getMacros(tpl)
                                return (
                                  <MacroSummary
                                    calories={m.calories}
                                    protein={m.protein}
                                    carbs={m.carbs}
                                    fat={m.fat}
                                  />
                                )
                              })()}
                              <div className="mt-3">
                                <m.button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingTemplate(tpl)
                                    setTemplateEditorOpen(true)
                                  }}
                                  whileTap={{ scale: 0.97, transition: snappy }}
                                  className="flex items-center gap-1.5 text-[10px] text-text-muted hover:text-white transition-colors font-medium uppercase tracking-wider cursor-pointer"
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  Edit
                                </m.button>
                              </div>
                            </m.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </SwipeActionRow>
                  </m.div>
                )
              })}
            </m.div>
          )}
        </m.div>
      </m.div>

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
        onDelete={editingTemplate ? () => {
          if (editingTemplate?.id) {
            handleSwipeDeleteTemplate(editingTemplate)
            setTemplateEditorOpen(false)
            setEditingTemplate(null)
          }
        } : undefined}
        initial={editingTemplate}
      />

      <FAB onClick={() => { setEditingTemplate(null); setTemplateEditorOpen(true) }} label="Log meal" />
    </>
  )
}
