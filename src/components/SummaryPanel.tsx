import { Trash2 } from 'lucide-react'
import { CRUSTS, formatPrice, getIngredient, getSize, SIZES } from '../data/menu'
import { pizzaPrice, useStore } from '../store/store'

export default function SummaryPanel({ className = '', onBaked }: { className?: string; onBaked?: () => void }) {
  const sizeId = useStore((s) => s.sizeId)
  const crustId = useStore((s) => s.crustId)
  const toppings = useStore((s) => s.toppings)
  const setSize = useStore((s) => s.setSize)
  const setCrust = useStore((s) => s.setCrust)
  const removeIngredient = useStore((s) => s.removeIngredient)
  const startBake = useStore((s) => s.startBake)

  const counts: Record<string, number> = {}
  for (const [id, t] of Object.entries(toppings)) counts[id] = t.qty
  const toppingIds = Object.keys(counts).sort((a, b) => getIngredient(a).layer - getIngredient(b).layer)
  const basePrice = getSize(sizeId).basePrice + (CRUSTS.find((c) => c.id === crustId)?.price ?? 0)
  const total = pizzaPrice(sizeId, crustId, counts)
  const canBake = toppingIds.length > 0

  return (
    <aside className={`scroll-slim flex min-h-0 flex-col overflow-y-auto border-ink/10 bg-paper ${className}`} aria-label="Order summary">
      <div className="sticky top-0 z-10 border-b border-ink/10 bg-paper/95 px-5 pb-3 pt-5 backdrop-blur-sm">
        <h2 className="font-display text-xl font-bold text-ink">Your tonda</h2>
        <p className="text-xs text-ink-soft">Everything updates as you build.</p>
      </div>

      <div className="flex flex-col gap-5 px-5 py-4">
        <section>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">Size</h3>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Pizza size">
            {SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={sizeId === s.id}
                onClick={() => setSize(s.id)}
                className={`cursor-pointer rounded-2xl border-2 px-2 py-2.5 text-center transition-colors ${
                  sizeId === s.id ? 'border-tomato bg-tomato/10' : 'border-ink/12 hover:border-ink/35'
                }`}
              >
                <span className="block text-[13px] font-bold text-ink">{s.name}</span>
                <span className="block text-[11px] text-ink-soft">{s.diameter}</span>
                <span className="mt-0.5 block text-[11px] font-semibold text-tomato">{formatPrice(s.basePrice)}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">Crust</h3>
          <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Crust">
            {CRUSTS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={crustId === c.id}
                onClick={() => setCrust(c.id)}
                className={`flex cursor-pointer items-center justify-between rounded-xl border-2 px-3.5 py-2.5 text-left transition-colors ${
                  crustId === c.id ? 'border-tomato bg-tomato/10' : 'border-ink/12 hover:border-ink/35'
                }`}
              >
                <span>
                  <span className="block text-[13.5px] font-semibold text-ink">{c.name}</span>
                  <span className="block text-[11px] text-ink-soft">{c.note}</span>
                </span>
                <span className="text-xs font-bold text-tomato">{c.price > 0 ? `+${formatPrice(c.price)}` : 'incl.'}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">Toppings</h3>
          <ul className="flex flex-col divide-y divide-ink/8">
            {toppingIds.map((id) => {
              const ing = getIngredient(id)
              const qty = counts[id]
              return (
                <li key={id} className="flex items-center gap-2 py-2">
                  <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">
                    {ing.name}
                    {id !== 'oregano' && <span className="text-ink-soft"> ×{qty}</span>}
                  </span>
                  <span className="text-[13px] font-semibold text-ink">{formatPrice(ing.price * qty)}</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(id)}
                    className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-ink-soft transition-colors hover:bg-tomato/10 hover:text-tomato"
                    aria-label={`Remove ${ing.name} entirely`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
            {toppingIds.length === 0 && (
              <li className="py-3 text-center text-[13px] text-ink-soft">
                Nothing on it yet. A naked dough is very avant-garde, but let us add something.
              </li>
            )}
          </ul>
        </section>
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-ink/10 bg-paper/95 px-5 pb-5 pt-4 backdrop-blur-sm">
        <div className="mb-1 flex items-center justify-between text-sm text-ink-soft">
          <span>Dough, sauce & crust</span>
          <span>{formatPrice(basePrice)}</span>
        </div>
        <div className="flex items-center justify-between font-display text-2xl font-black text-ink">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!canBake) return
            startBake()
            onBaked?.()
          }}
          disabled={!canBake}
          className="mt-3 flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-tomato px-6 py-3.5 text-[15px] font-bold uppercase tracking-[0.14em] text-cream shadow-[0_12px_26px_-8px_rgba(176,47,18,0.6)] transition-colors hover:bg-tomato-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          Bake My Pizza
        </button>
        {!canBake && <p className="mt-2 text-center text-xs text-ink-soft">Add at least one topping to fire up the oven.</p>}
      </div>
    </aside>
  )
}
