import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion } from 'framer-motion'
import { Check, Pizza, RotateCcw } from 'lucide-react'
import { PizzaRender } from '../pizza/PizzaRender'
import { pizzaPrice, useStore, type ToppingsMap } from '../store/store'
import { formatPrice, getCrust, getIngredient, getSize } from '../data/menu'
import { Btn, Tray } from '../components/ui'

type Phase = 'prep' | 'enter' | 'bake' | 'out' | 'cut' | 'box' | 'done'

const BAKE_SECONDS = 9
const easeOut = [0.22, 1, 0.36, 1] as const

const CAPTIONS: Record<Phase, string> = {
  prep: 'Getting your pizza ready...',
  enter: 'Into the oven it goes',
  bake: `Baking at 450°C`,
  out: 'Out it comes. Look at that color.',
  cut: 'Slicing while it is hot',
  box: 'Boxing it up for you',
  done: 'YOUR PIZZA IS READY!',
}

export default function Sequence() {
  const sizeId = useStore((s) => s.frozenSizeId)
  const crustId = useStore((s) => s.frozenCrustId)
  const toppings = useStore((s) => s.frozenToppings)
  const navigate = useStore((s) => s.navigate)
  const createAnother = useStore((s) => s.createAnother)
  const addToOrder = useStore((s) => s.addToOrder)

  // dev-only: /?stage=cut|box freezes the sequence for inspection
  const devStage = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('stage') : null

  const [phase, setPhase] = useState<Phase>(() => (devStage === 'cut' || devStage === 'box' ? devStage : 'prep'))
  const [bake, setBake] = useState(() => (devStage ? 1 : 0))
  const [cutP, setCutP] = useState(() => (devStage === 'cut' || devStage === 'box' ? 1 : 0))
  const [sep, setSep] = useState(() => (devStage ? 1 : 0))
  const [doorOpen, setDoorOpen] = useState(true)
  const stops = useRef<(() => void)[]>([])

  const size = getSize(sizeId)
  const slices = size.slices
  const cuts = slices / 2

  useEffect(() => {
    if (devStage) return
    const timers: ReturnType<typeof setTimeout>[] = []
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms))

    if (phase === 'prep') {
      later(() => setPhase('enter'), 2100)
    } else if (phase === 'enter') {
      later(() => setDoorOpen(false), 1500)
      later(() => setPhase('bake'), 2700)
    } else if (phase === 'bake') {
      setDoorOpen(false)
      const ctrl = animate(0, 1, {
        duration: BAKE_SECONDS,
        ease: 'linear',
        onUpdate: (v) => setBake(v),
      })
      stops.current.push(() => ctrl.stop())
      later(() => setPhase('out'), BAKE_SECONDS * 1000 + 350)
    } else if (phase === 'out') {
      setDoorOpen(true)
      later(() => setPhase('cut'), 1900)
    } else if (phase === 'cut') {
      const lines = animate(0, 1, {
        duration: cuts * 0.9,
        ease: 'linear',
        onUpdate: (v) => setCutP(v),
      })
      stops.current.push(() => lines.stop())
      later(() => {
        const sepAnim = animate(0, 1, {
          type: 'spring',
          stiffness: 120,
          damping: 14,
          onUpdate: (v) => setSep(v),
        })
        stops.current.push(() => sepAnim.stop())
        later(() => setPhase('box'), 1500)
      }, cuts * 0.9 * 1000 + 250)
    } else if (phase === 'box') {
      later(() => setPhase('done'), 3400)
    }

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [phase, cuts])

  useEffect(() => () => stops.current.forEach((fn) => fn()), [])

  const skip = () => {
    stops.current.forEach((fn) => fn())
    stops.current = []
    setBake(1)
    setCutP(1)
    setSep(1)
    setDoorOpen(true)
    setPhase('done')
  }

  // during screen-exit animations frozen state is already cleared; render nothing
  if (!toppings) return null

  const counts: Record<string, number> = {}
  for (const [id, t] of Object.entries(toppings)) counts[id] = t.qty
  const total = pizzaPrice(sizeId, crustId, counts)

  const scene = phase === 'prep' ? 'prep' : phase === 'enter' || phase === 'bake' || phase === 'out' ? 'oven' : phase === 'cut' ? 'cut' : phase === 'box' ? 'box' : 'done'

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#20150C]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(85% 60% at 50% 30%, rgba(255,170,80,0.10), transparent 70%)' }} />

      {phase === 'prep' && (
        <button
          type="button"
          onClick={() => navigate('builder')}
          className="absolute left-4 top-4 z-30 flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-cream/10 px-4 text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:bg-cream/20"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Edit pizza
        </button>
      )}

      {phase !== 'done' && (
        <button
          type="button"
          onClick={skip}
          className="absolute right-4 top-4 z-30 min-h-[44px] cursor-pointer rounded-xl px-4 text-sm font-semibold text-cream/60 transition-colors hover:text-cream"
        >
          Skip
        </button>
      )}

      <div className="relative z-10 flex-1">
        <AnimatePresence mode="wait">
          {scene === 'prep' && (
            <motion.div
              key="prep"
              className="absolute inset-0 grid place-items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.4 } }}
            >
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: easeOut }}
                className="aspect-square w-[min(60vh,84vw,560px)]"
              >
                <Tray className="h-full w-full">
                  <PizzaRender sizeId={sizeId} crustId={crustId} toppings={toppings} className="h-full w-full drop-shadow-[0_18px_26px_rgba(0,0,0,0.5)]" />
                </Tray>
              </motion.div>
            </motion.div>
          )}

          {scene === 'oven' && (
            <motion.div
              key="oven"
              className="absolute inset-0 grid place-items-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.45 } }}
              transition={{ duration: 0.5 }}
            >
              <Oven
                sizeId={sizeId}
                crustId={crustId}
                toppings={toppings}
                bake={bake}
                phase={phase}
                doorOpen={doorOpen}
              />
            </motion.div>
          )}

          {scene === 'cut' && (
            <motion.div
              key="cut"
              className="absolute inset-0 grid place-items-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30, transition: { duration: 0.45 } }}
              transition={{ duration: 0.5 }}
            >
              <CutBoard sizeId={sizeId} crustId={crustId} toppings={toppings} cutP={cutP} sep={sep} />
            </motion.div>
          )}

          {scene === 'box' && (
            <motion.div
              key="box"
              className="absolute inset-0 grid place-items-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              transition={{ duration: 0.5 }}
            >
              <BoxScene sizeId={sizeId} crustId={crustId} toppings={toppings} sep={sep} freeze={!!devStage} />
            </motion.div>
          )}

          {scene === 'done' && (
            <motion.div
              key="done"
              className="absolute inset-0 overflow-y-auto scroll-slim"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
            >
              <DoneScene sizeId={sizeId} crustId={crustId} counts={counts} total={total} onCreateAnother={createAnother} onAddToOrder={addToOrder} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* stage indicator + caption */}
      <div className="relative z-20 flex flex-col items-center gap-3 px-4 pb-6 pt-2">
        <div className="flex items-center gap-2" aria-hidden="true">
          {(['prep', 'oven', 'cut', 'box', 'done'] as const).map((p, i) => {
            const order = ['prep', 'oven', 'cut', 'box', 'done']
            const active = order.indexOf(scene) >= i
            return <span key={p} className={`h-1.5 rounded-full transition-all duration-500 ${active ? 'w-8 bg-tomato' : 'w-3 bg-cream/20'}`} />
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className={`text-center font-display text-lg font-bold sm:text-xl ${phase === 'done' ? 'text-tomato' : 'text-cream/90'}`}
            aria-live="polite"
          >
            {CAPTIONS[phase]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------------- Oven ---------------- */
function Oven({
  sizeId,
  crustId,
  toppings,
  bake,
  phase,
  doorOpen,
}: {
  sizeId: string
  crustId: string
  toppings: ToppingsMap
  bake: number
  phase: Phase
  doorOpen: boolean
}) {
  const pizzaVisible = phase === 'enter' || phase === 'bake' || phase === 'out'
  return (
    <div className="relative w-[min(94vw,600px)]">
      <div
        className="rounded-[30px] p-4 sm:p-5"
        style={{
          background: 'linear-gradient(180deg, #5B5B62 0%, #47474E 30%, #3A3A41 100%)',
          boxShadow: '0 40px 80px -30px rgba(0,0,0,0.8), inset 0 2px 3px rgba(255,255,255,0.25), inset 0 -3px 8px rgba(0,0,0,0.5)',
        }}
      >
        {/* control strip */}
        <div className="flex items-center justify-between gap-3 px-1 pb-3">
          <div className="flex items-center gap-2.5">
            <Knob />
            <Knob />
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-[#1A1210] px-3.5 py-1.5 text-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-cream/40">Temp</span>
              <span className="font-display text-lg font-black leading-none text-tomato" style={{ textShadow: '0 0 12px rgba(216,67,31,0.7)' }}>
                {bake > 0.02 ? '450°C' : '72°C'}
              </span>
            </div>
            {phase === 'bake' && <TimerRing progress={bake} />}
          </div>
          <div className="flex items-center gap-2.5">
            <Knob />
            <Knob />
          </div>
        </div>

        {/* cavity + glass door */}
        <div className="relative" style={{ perspective: '1200px' }}>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] bg-[#160E08] shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
            {/* cavity back glow */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: phase === 'bake' ? [0.75, 1, 0.8] : phase === 'out' ? 0.55 : 0.3 }}
              transition={phase === 'bake' ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.8 }}
              style={{ background: 'radial-gradient(70% 90% at 50% 60%, rgba(255,140,40,0.65), rgba(150,50,12,0.32) 60%, transparent 82%)' }}
            />
            {/* heat shimmer */}
            {phase === 'bake' && (
              <svg className="absolute inset-0 h-full w-full opacity-25" aria-hidden="true">
                <defs>
                  <filter id="heat">
                    <feTurbulence type="fractalNoise" baseFrequency="0.015 0.09" numOctaves="2" result="n">
                      <animate attributeName="baseFrequency" values="0.015 0.09;0.03 0.12;0.015 0.09" dur="3.2s" repeatCount="indefinite" />
                    </feTurbulence>
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="26" />
                  </filter>
                </defs>
                <rect width="100%" height="100%" fill="rgba(255,150,60,0.5)" filter="url(#heat)" />
              </svg>
            )}
            {/* pizza inside */}
            {pizzaVisible && (
              <motion.div
                className="absolute inset-0 grid place-items-center"
                initial={{ y: '115%', scale: 1.15 }}
                animate={{ y: phase === 'out' ? '118%' : '0%', scale: phase === 'out' ? 1.15 : 1 }}
                transition={{ duration: phase === 'out' ? 1.1 : 1.25, ease: easeOut }}
              >
                <div className="w-[58%]">
                  <Tray className="aspect-square w-full">
                    <PizzaRender sizeId={sizeId} crustId={crustId} toppings={toppings} bake={bake} className="h-full w-full" />
                  </Tray>
                </div>
              </motion.div>
            )}
            {/* glass tint above pizza */}
            <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(255,220,160,0.13), transparent 40%), linear-gradient(0deg, rgba(0,0,0,0.35), transparent 55%)' }} />
          </div>

          {/* the door itself: steel frame + glass center so the bake stays visible */}
          <motion.div
            className="absolute inset-0 rounded-[22px]"
            style={{ transformOrigin: 'bottom center' }}
            animate={{ rotateX: doorOpen ? -78 : 0, opacity: doorOpen ? 0.85 : 1 }}
            transition={{ duration: 0.95, ease: easeOut }}
          >
            <div className="h-full w-full rounded-[22px] p-[7px]" style={{ boxShadow: '0 14px 30px -12px rgba(0,0,0,0.6)' }}>
              <div
                className="relative h-full w-full overflow-hidden rounded-[16px]"
                style={{
                  border: '11px solid #45454C',
                  background:
                    phase === 'bake' ? 'rgba(30,14,5,0.16)' : doorOpen ? 'rgba(14,10,8,0.12)' : 'rgba(14,10,8,0.45)',
                  boxShadow: 'inset 0 0 26px rgba(0,0,0,0.4), 0 0 0 3px #2C2C31',
                }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(155deg, rgba(255,255,255,0.15), transparent 38%, rgba(255,255,255,0.05) 60%, transparent 75%)' }} />
              </div>
            </div>
            {/* handle */}
            <div className="absolute -bottom-3 left-1/2 h-3.5 w-[46%] -translate-x-1/2 rounded-full" style={{ background: 'linear-gradient(180deg, #77777E, #3E3E44)', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }} />
          </motion.div>
        </div>

        {/* feet */}
        <div className="mx-6 mt-3 flex justify-between">
          <span className="h-2 w-10 rounded-b bg-[#232327]" />
          <span className="h-2 w-10 rounded-b bg-[#232327]" />
        </div>
      </div>

      {/* warm light spilling onto the counter while baking */}
      <motion.div
        className="pointer-events-none absolute -bottom-10 left-1/2 h-24 w-[86%] -translate-x-1/2 rounded-full"
        animate={{ opacity: phase === 'bake' ? 0.55 : 0 }}
        transition={{ duration: 1 }}
        style={{ background: 'radial-gradient(50% 100% at 50% 0%, rgba(255,150,50,0.5), transparent 75%)' }}
      />
    </div>
  )
}

function Knob() {
  return (
    <span
      className="block h-6 w-6 rounded-full sm:h-7 sm:w-7"
      style={{ background: 'radial-gradient(circle at 35% 30%, #6E6E76, #33333A 70%)', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.5)' }}
    />
  )
}

function TimerRing({ progress }: { progress: number }) {
  const R = 17
  const circ = 2 * Math.PI * R
  const remaining = Math.ceil((1 - progress) * BAKE_SECONDS)
  return (
    <div className="relative grid h-12 w-12 place-items-center" role="timer" aria-label={`Baking, ${remaining} seconds remaining`}>
      <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(246,238,223,0.15)" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={R}
          fill="none"
          stroke="#D8431F"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
        />
      </svg>
      <span className="relative font-display text-sm font-black tabular-nums text-cream">{remaining}</span>
    </div>
  )
}

/* ---------------- Cutting board ---------------- */

function CutBoard({
  sizeId,
  crustId,
  toppings,
  cutP,
  sep,
}: {
  sizeId: string
  crustId: string
  toppings: ToppingsMap
  cutP: number
  sep: number
}) {
  const size = getSize(sizeId)
  const cuts = size.slices / 2
  const lineK = Math.min(cuts - 1, Math.floor(cutP * cuts))
  const lineP = Math.min(1, Math.max(0, cutP * cuts - lineK))
  const angle = (lineK * (180 / cuts) * Math.PI) / 180
  const showCutter = cutP > 0 && cutP < 1
  const cutterX = 50 + (lineP - 0.5) * 88 * Math.cos(angle)
  const cutterY = 50 + (lineP - 0.5) * 88 * Math.sin(angle)

  return (
    <div className="relative grid place-items-center">
      {/* board */}
      <div
        className="relative grid aspect-square w-[min(66vh,88vw,600px)] place-items-center rounded-full"
        style={{
          background: 'radial-gradient(circle at 38% 30%, #C99B5F 0%, #B08044 55%, #96682F 100%)',
          boxShadow: '0 30px 60px -20px rgba(0,0,0,0.65), inset 0 3px 8px rgba(255,230,180,0.25), inset 0 -6px 16px rgba(60,30,5,0.4)',
        }}
      >
        <div className="absolute inset-[4%] rounded-full border-2 border-[#7A5423]/40" />
        <div className="relative aspect-square w-[86%]">
          <PizzaRender
            sizeId={sizeId}
            crustId={crustId}
            toppings={toppings}
            bake={1}
            cut={{ progress: cutP, separation: sep }}
            className="h-full w-full drop-shadow-[0_18px_26px_rgba(0,0,0,0.5)]"
          />
          {/* pizza cutter */}
          {showCutter && (
            <motion.div
              className="pointer-events-none absolute w-[30%]"
              style={{ left: `${cutterX}%`, top: `${cutterY}%`, x: '-50%', y: '-50%', rotate: (angle * 180) / Math.PI + 90 }}
            >
              <Cutter />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function Cutter() {
  return (
    <svg viewBox="0 0 100 150" className="h-auto w-full drop-shadow-[0_8px_10px_rgba(0,0,0,0.45)]" aria-hidden="true">
      <rect x="44" y="4" width="12" height="86" rx="6" fill="#2E2018" />
      <rect x="47" y="4" width="4" height="86" rx="2" fill="#4A3626" opacity="0.7" />
      <rect x="36" y="82" width="28" height="14" rx="5" fill="#8E8E96" />
      <circle cx="50" cy="112" r="30" fill="none" stroke="#B9BEC4" strokeWidth="9" />
      <circle cx="50" cy="112" r="30" fill="none" stroke="#7E858C" strokeWidth="3" strokeDasharray="6 9" />
      <circle cx="50" cy="112" r="7" fill="#D9DDE2" stroke="#7E858C" strokeWidth="2.5" />
    </svg>
  )
}

/* ---------------- Boxing ---------------- */

function BoxScene({ sizeId, crustId, toppings, sep, freeze = false }: { sizeId: string; crustId: string; toppings: ToppingsMap; sep: number; freeze?: boolean }) {
  const [stage, setStage] = useState<'move' | 'close' | 'closed'>('move')
  useEffect(() => {
    if (freeze) return
    const t1 = setTimeout(() => setStage('close'), 1500)
    const t2 = setTimeout(() => setStage('closed'), 2600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [freeze])

  return (
    <div className="grid place-items-center" style={{ perspective: '1400px' }}>
      <div className="relative w-[min(74vw,460px)]">
        {/* open lid standing behind the box */}
        <motion.div
          className="absolute inset-x-[2%] top-0 aspect-[10/7] rounded-2xl border-[6px] border-[#B98A4E] bg-[#D9A968]"
          style={{ transformOrigin: 'bottom center' }}
          animate={{ rotateX: stage === 'move' ? -104 : 0, opacity: stage === 'closed' ? 1 : 0.96 }}
          transition={{ duration: 1.0, ease: easeOut }}
        >
          <BoxBrand visible={stage === 'closed'} />
        </motion.div>

        {/* box bottom */}
        <div className="relative mt-[52%] rounded-2xl border-[6px] border-[#B98A4E] bg-[#D9A968] p-[3%]" style={{ boxShadow: '0 30px 60px -18px rgba(0,0,0,0.7)' }}>
          <div
            className="grid aspect-square w-full place-items-center rounded-xl"
            style={{
              background:
                'repeating-linear-gradient(0deg, rgba(216,67,31,0.10) 0 13px, transparent 13px 26px), repeating-linear-gradient(90deg, rgba(216,67,31,0.10) 0 13px, transparent 13px 26px), #FBF4E4',
            }}
          >
            {stage === 'move' && (
              <motion.div
                className="aspect-square w-full"
                initial={{ y: '-46%', scale: 1.02, opacity: 0 }}
                animate={{ y: '0%', scale: 0.94, opacity: 1 }}
                transition={{ duration: 1.1, ease: easeOut }}
              >
                <PizzaRender sizeId={sizeId} crustId={crustId} toppings={toppings} bake={1} cut={{ progress: 1, separation: sep }} className="h-full w-full drop-shadow-[0_14px_20px_rgba(30,18,8,0.4)]" />
              </motion.div>
            )}
          </div>
        </div>

        {/* steam wisps once closed */}
        {stage === 'closed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-none absolute -top-16 left-1/2 flex -translate-x-1/2 gap-6">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="block h-10 w-2.5 rounded-full bg-cream/25 blur-[3px]"
                animate={{ y: [0, -26], opacity: [0, 0.9, 0], scaleY: [0.7, 1.4] }}
                transition={{ duration: 2.1, repeat: Infinity, delay: i * 0.55, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function BoxBrand({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="grid h-full w-full place-items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.7, delay: 0.35 }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2.5">
          <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="29" cy="33" r="24" fill="#D8431F" />
            <circle cx="29" cy="33" r="19" fill="#F0B84B" />
            <circle cx="24" cy="28" r="4.5" fill="#D8431F" />
            <circle cx="34" cy="38" r="4" fill="#D8431F" />
            <path d="M 40 24 L 60 6 L 60 30 Q 50 34 43 30 Z" fill="#F0B84B" stroke="#D8431F" strokeWidth="3" strokeLinejoin="round" />
          </svg>
          <span className="font-display text-3xl font-black tracking-wide text-[#7A4A1E]">TONDA</span>
        </div>
        <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.34em] text-[#7A4A1E]/70">Pizza Studio · Baked with fire</span>
      </div>
    </motion.div>
  )
}

/* ---------------- Done ---------------- */

function DoneScene({
  sizeId,
  crustId,
  counts,
  total,
  onCreateAnother,
  onAddToOrder,
}: {
  sizeId: string
  crustId: string
  counts: Record<string, number>
  total: number
  onCreateAnother: () => void
  onAddToOrder: () => void
}) {
  const size = getSize(sizeId)
  const crust = getCrust(crustId)
  const cart = useStore((s) => s.cart)
  const sessionPizzas = cart.length
  const sessionTotal = cart.reduce((n, p) => n + p.unitPrice * p.count, 0)

  return (
    <div className="mx-auto grid min-h-full w-full max-w-4xl grid-cols-1 items-center gap-8 px-6 py-10 md:grid-cols-[1fr_1.1fr]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -4 }}
        animate={{ scale: 1, opacity: 1, rotate: -3 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.15 }}
        className="mx-auto w-[min(70vw,340px)]"
      >
        <div className="relative">
          <div className="relative rounded-2xl border-[6px] border-[#B98A4E] bg-[#D9A968] p-[4%]" style={{ boxShadow: '0 34px 60px -18px rgba(0,0,0,0.75)' }}>
            <div className="grid aspect-square w-full place-items-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2.5">
                  <svg width="44" height="44" viewBox="0 0 64 64" aria-hidden="true">
                    <circle cx="29" cy="33" r="24" fill="#D8431F" />
                    <circle cx="29" cy="33" r="19" fill="#F0B84B" />
                    <circle cx="24" cy="28" r="4.5" fill="#D8431F" />
                    <circle cx="34" cy="38" r="4" fill="#D8431F" />
                    <path d="M 40 24 L 60 6 L 60 30 Q 50 34 43 30 Z" fill="#F0B84B" stroke="#D8431F" strokeWidth="3" strokeLinejoin="round" />
                  </svg>
                  <span className="font-display text-4xl font-black tracking-wide text-[#7A4A1E]">TONDA</span>
                </div>
                <span className="mt-1.5 block text-[11px] font-bold uppercase tracking-[0.34em] text-[#7A4A1E]/70">Pizza Studio · Baked with fire</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.55, ease: easeOut }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-basil/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#8FCB87]">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Baked, sliced, boxed
          </span>
          <h1 className="mt-3 font-display text-4xl font-black leading-tight text-cream sm:text-5xl">Your pizza is ready!</h1>

          <div className="mt-5 rounded-2xl bg-cream/8 p-5 backdrop-blur-sm">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-xl font-bold text-cream">Order summary</h2>
              <span className="font-display text-2xl font-black text-tomato">{formatPrice(total)}</span>
            </div>
            <dl className="mt-3 space-y-1.5 text-sm text-cream/80">
              <div className="flex justify-between gap-4">
                <dt>Pizza</dt>
                <dd className="text-right font-semibold text-cream">
                  {size.name} · {crust.name}
                </dd>
              </div>
              {Object.keys(counts).length > 0 && (
                <div className="flex justify-between gap-4">
                  <dt>Toppings</dt>
                  <dd className="text-right font-semibold text-cream">
                    {Object.keys(counts)
                      .sort((a, b) => getIngredient(a).layer - getIngredient(b).layer)
                      .map((id) => `${getIngredient(id).name} ×${counts[id]}`)
                      .join(', ')}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt>Slices</dt>
                <dd className="text-right font-semibold text-cream">{size.slices}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Btn onClick={onCreateAnother} variant="outlineLight" className="flex-1">
              <Pizza className="h-4.5 w-4.5" aria-hidden="true" />
              Create Another Pizza
            </Btn>
            <Btn onClick={onAddToOrder} className="flex-1">
              Add To My Order
            </Btn>
          </div>

          {sessionPizzas > 0 && (
            <p className="mt-4 text-center text-sm text-cream/60">
              Already waiting in your order: {sessionPizzas} pizza{sessionPizzas > 1 ? 's' : ''} · {formatPrice(sessionTotal)}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
