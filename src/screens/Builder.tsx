import { useEffect, useState } from 'react'
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Flame, ShoppingBag } from 'lucide-react'
import { PizzaRender } from '../pizza/PizzaRender'
import { pizzaPrice, useStore } from '../store/store'
import { getSize, formatPrice } from '../data/menu'
import { Btn, Tray, Wordmark } from '../components/ui'
import ToppingPanel from '../components/ToppingPanel'
import SummaryPanel from '../components/SummaryPanel'

export default function Builder() {
  const sizeId = useStore((s) => s.sizeId)
  const crustId = useStore((s) => s.crustId)
  const toppings = useStore((s) => s.toppings)
  const cartCount = useStore((s) => s.cart.length)
  const navigate = useStore((s) => s.navigate)
  const startBake = useStore((s) => s.startBake)
  const [tab, setTab] = useState<'ingredients' | 'summary'>('ingredients')

  const pieceCount = Object.values(toppings).reduce((n, t) => n + t.pieces.length + (t.qty > 0 ? 1 : 0), 0)
  const controls = useAnimationControls()
  useEffect(() => {
    if (pieceCount > 0) void controls.start({ scale: [1, 1.02, 1], transition: { duration: 0.4, ease: 'easeOut' } })
  }, [pieceCount, controls])

  const counts: Record<string, number> = {}
  for (const [id, t] of Object.entries(toppings)) counts[id] = t.qty
  const total = pizzaPrice(sizeId, crustId, counts)
  const canBake = Object.keys(counts).length > 0

  return (
    <div className="flex min-h-full flex-col bg-cream lg:h-full">
      <header className="relative z-20 flex items-center justify-between border-b border-ink/10 bg-cream px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('landing')}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl text-ink transition-colors hover:bg-ink/8"
            aria-label="Back to start"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <Wordmark />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-ink/8 px-4 py-2 text-sm font-bold text-ink sm:block">{formatPrice(total)}</span>
          <button
            type="button"
            onClick={() => navigate('cart')}
            className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-ink/15 text-ink transition-colors hover:bg-ink/8"
            aria-label={`Open cart, ${cartCount} pizzas`}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-tomato px-1 text-[11px] font-bold text-cream">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      <div className="grid flex-1 lg:min-h-0 lg:grid-cols-[320px_1fr_350px]">
        <ToppingPanel className="hidden border-r lg:flex" />

        {/* workstation */}
        <section className="surface-wood relative flex min-h-[42vh] items-center justify-center overflow-hidden p-4 lg:min-h-0" aria-label="Pizza workstation">
          <span className="absolute left-4 top-4 z-10 rounded-full bg-ink/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/70 backdrop-blur-sm">
            The bench · {getSize(sizeId).name} · {getSize(sizeId).diameter}
          </span>
          <motion.div animate={controls} className="relative aspect-square w-[min(38vh,86vw)] lg:w-[min(64vh,92vw,600px)]">
            <Tray className="h-full w-full">
              <PizzaRender sizeId={sizeId} crustId={crustId} toppings={toppings} animate className="h-full w-full drop-shadow-[0_16px_24px_rgba(30,18,8,0.35)]" />
            </Tray>
          </motion.div>
        </section>

        {/* mobile quick bar: total + bake, sits between bench and sheet */}
        <div className="flex items-center justify-between gap-3 border-t border-ink/10 bg-paper px-4 py-2.5 lg:hidden">
          <span className="font-display text-lg font-black text-ink">{formatPrice(total)}</span>
          <Btn onClick={() => (canBake ? startBake() : setTab('summary'))} disabled={!canBake} className="min-h-[44px] px-6 py-2.5">
            <Flame className="h-4 w-4" aria-hidden="true" />
            Bake My Pizza
          </Btn>
        </div>

        <SummaryPanel className="hidden border-l lg:flex" />
      </div>

      {/* mobile sheet: ingredients + summary in tabs, page scrolls naturally */}
      <div className="z-30 border-t border-ink/10 bg-paper shadow-[0_-14px_30px_-14px_rgba(30,18,8,0.35)] lg:hidden">
        <div className="sticky top-0 z-30 grid grid-cols-2 shadow-[0_6px_14px_-8px_rgba(30,18,8,0.3)]" role="tablist" aria-label="Builder panels">
          {(['ingredients', 'summary'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`flex min-h-[52px] cursor-pointer items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.14em] transition-colors ${
                tab === t ? 'bg-paper text-tomato' : 'bg-cream-deep text-ink-soft'
              }`}
            >
              {t === 'ingredients' ? 'Ingredients' : `Summary · ${formatPrice(total)}`}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {tab === 'ingredients' ? <ToppingPanel className="border-0" /> : <SummaryPanel className="border-0" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

