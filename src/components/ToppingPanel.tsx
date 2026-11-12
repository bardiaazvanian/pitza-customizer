import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { CATEGORY_LABELS, CATEGORY_ORDER, formatPrice, INGREDIENTS, MAX_QTY, type Category } from '../data/menu'
import { useStore } from '../store/store'
import { ToppingArt } from '../pizza/ToppingArt'

function IngredientThumb({ id }: { id: string }) {
  return (
    <svg viewBox="-58 -58 116 116" className="h-12 w-12 shrink-0" aria-hidden="true">
      {id === 'mozzarella' ? (
        <g>
          <circle r={46} fill="#F7DC8A" />
          <circle cx={-12} cy={-8} r={16} fill="#FCE9A8" />
          <circle cx={16} cy={14} r={12} fill="#FCE9A8" />
          <ellipse cx={10} cy={-16} rx={9} ry={6} fill="#C98E3E" opacity={0.4} />
          <ellipse cx={-18} cy={20} rx={7} ry={5} fill="#C98E3E" opacity={0.3} />
        </g>
      ) : (
        <g transform="scale(0.92)">
          <ToppingArt id={id} bake={0} variant={1} />
        </g>
      )}
    </svg>
  )
}

function IngredientCard({ id }: { id: string }) {
  const ing = INGREDIENTS.find((i) => i.id === id)!
  const qty = useStore((s) => s.toppings[id]?.qty ?? 0)
  const addServing = useStore((s) => s.addServing)
  const removeServing = useStore((s) => s.removeServing)
  const selected = qty > 0

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
        selected ? 'border-tomato/60 bg-paper shadow-[0_6px_16px_-8px_rgba(176,47,18,0.4)]' : 'border-ink/10 bg-paper/70 hover:border-ink/25'
      }`}
    >
      <IngredientThumb id={id} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-ink">{ing.name}</p>
        <p className="text-xs text-ink-soft">{formatPrice(ing.price)} / serving</p>
      </div>
      {qty === 0 ? (
        <button
          type="button"
          onClick={() => addServing(id)}
          className="flex h-11 min-w-[56px] cursor-pointer items-center justify-center gap-1 rounded-xl bg-ink px-3 text-xs font-bold uppercase tracking-wide text-cream transition-colors hover:bg-[#3a2c1e]"
          aria-label={`Add ${ing.name}`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      ) : (
        <div className="flex items-center gap-1" role="group" aria-label={`${ing.name} quantity`}>
          <button
            type="button"
            onClick={() => removeServing(id)}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-ink/15 bg-cream text-ink transition-colors hover:bg-cream-deep"
            aria-label={`Remove one serving of ${ing.name}`}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-6 text-center text-sm font-bold text-tomato">{qty}</span>
          <button
            type="button"
            onClick={() => addServing(id)}
            disabled={qty >= MAX_QTY}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-ink/15 bg-cream text-ink transition-colors hover:bg-cream-deep disabled:cursor-not-allowed disabled:opacity-35"
            aria-label={`Add one more serving of ${ing.name}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function ToppingPanel({ className = '' }: { className?: string }) {
  const [category, setCategory] = useState<Category>('cheese')
  return (
    <aside className={`scroll-slim flex min-h-0 flex-col overflow-y-auto border-ink/10 bg-cream-deep/60 ${className}`} aria-label="Ingredient library">
      <div className="sticky top-0 z-10 bg-cream-deep/95 px-5 pb-3 pt-5 backdrop-blur-sm">
        <h2 className="font-display text-xl font-bold text-ink">Ingredient market</h2>
        <p className="text-xs text-ink-soft">Tap to add servings, up to three each.</p>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Ingredient categories">
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                category === c ? 'bg-tomato text-cream' : 'bg-ink/8 text-ink-soft hover:bg-ink/15'
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-5 pb-6" role="tabpanel">
        {INGREDIENTS.filter((i) => i.category === category).map((i) => (
          <IngredientCard key={i.id} id={i.id} />
        ))}
      </div>
    </aside>
  )
}
