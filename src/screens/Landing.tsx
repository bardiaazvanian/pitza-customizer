import { motion } from 'framer-motion'
import { Flame, Wheat } from 'lucide-react'
import { PizzaRender } from '../pizza/PizzaRender'
import { ToppingArt } from '../pizza/ToppingArt'
import { buildToppings } from '../store/store'
import { useStore } from '../store/store'
import { Btn, Wordmark } from '../components/ui'

const heroToppings = buildToppings({ mozzarella: 2, pepperoni: 2, mushroom: 1, basil: 1 })

const floaters = [
  { id: 'tomato', x: '-8%', y: '6%', size: 72, delay: 0, dur: 7 },
  { id: 'jalapeno', x: '104%', y: '18%', size: 56, delay: 1.2, dur: 8 },
  { id: 'basil', x: '96%', y: '86%', size: 62, delay: 0.6, dur: 7.5 },
  { id: 'black-olives', x: '-4%', y: '82%', size: 54, delay: 1.8, dur: 8.5 },
]

export default function Landing() {
  const navigate = useStore((s) => s.navigate)

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-cream">
      {/* warm vignette keeps focus on the center stage */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(90% 70% at 50% 38%, rgba(255,244,222,0.9), rgba(246,238,223,0) 70%)' }} />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <Wordmark />
        <span className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft sm:block">Handmade · Baked to order</span>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-10 px-6 pb-16 pt-4 md:grid-cols-2 md:gap-6 md:px-12 lg:pt-0">
        <div className="order-2 md:order-1">
          <h1 className="text-balance font-display text-[44px] font-black leading-[1.04] text-ink sm:text-6xl">
            Your pizza, from dough to box.
          </h1>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-soft">
            Choose your crust and toppings, then watch your pizza slide into the oven, bake, get sliced and boxed, right before your eyes.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-ink-soft">
            <span className="flex items-center gap-2">
              <Wheat className="h-4 w-4 text-crust" aria-hidden="true" />
              4 handmade crusts
            </span>
            <span className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-tomato" aria-hidden="true" />
              Stone-oven bake
            </span>
          </div>

          <div className="mt-9">
            <Btn onClick={() => navigate('builder')} className="px-9 py-4 text-base uppercase tracking-[0.12em]">
              Start Your Order
            </Btn>
            <p className="mt-3 text-xs text-ink-soft">No account needed. Build first, pay later.</p>
          </div>
        </div>

        {/* hero visual: pizza resting in an open box */}
        <div className="order-1 md:order-2">
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-[min(88vw,520px)]"
          >
            {/* open lid behind */}
            <div
              aria-hidden="true"
              className="absolute -top-[9%] left-[4%] h-[62%] w-[92%] rounded-2xl border-[6px] border-[#B98A4E] bg-[#D9A968]"
              style={{ transform: 'perspective(900px) rotateX(58deg)', transformOrigin: 'bottom center', boxShadow: '0 -10px 30px rgba(30,18,8,0.18)' }}
            />
            {/* box bottom with gingham paper */}
            <div
              className="relative rounded-3xl border-[7px] border-[#B98A4E] bg-[#D9A968] p-[5%]"
              style={{ boxShadow: '0 34px 60px -20px rgba(30,18,8,0.5)' }}
            >
              <div
                className="grid aspect-square w-full place-items-center rounded-2xl"
                style={{
                  background:
                    'repeating-linear-gradient(0deg, rgba(216,67,31,0.10) 0 14px, transparent 14px 28px), repeating-linear-gradient(90deg, rgba(216,67,31,0.10) 0 14px, transparent 14px 28px), #FBF4E4',
                }}
              >
                <PizzaRender sizeId="medium" crustId="classic" toppings={heroToppings} bake={1} className="h-[88%] w-[88%] drop-shadow-[0_18px_28px_rgba(30,18,8,0.35)]" />
              </div>
            </div>

            {/* floating ingredients: what you are about to pick */}
            {floaters.map((f) => (
              <motion.div
                key={f.id}
                aria-hidden="true"
                className="pointer-events-none absolute drop-shadow-[0_10px_14px_rgba(30,18,8,0.3)]"
                style={{ left: f.x, top: f.y, width: f.size }}
                animate={{ y: [0, -12, 0], rotate: [0, f.delay > 1 ? 8 : -8, 0] }}
                transition={{ duration: f.dur, repeat: Infinity, ease: 'easeInOut', delay: f.delay }}
              >
                <svg viewBox="-60 -60 120 120" width="100%" height="100%">
                  <g transform="scale(1.05)">
                    <ToppingArt id={f.id} bake={1} variant={1} />
                  </g>
                </svg>
              </motion.div>
            ))}
      </motion.div>
        </div>
      </main>
    </div>
  )
}
