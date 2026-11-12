import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { PizzaRender } from '../pizza/PizzaRender'
import { buildToppings, useStore } from '../store/store'
import { formatPrice, getCrust, getIngredient, getSize, CRUSTS } from '../data/menu'
import { Btn, Wordmark } from '../components/ui'

/* ---------------- Cart ---------------- */

function MiniPizza({ counts, sizeId, crustId }: { counts: Record<string, number>; sizeId: string; crustId: string }) {
  const toppings = useMemo(() => buildToppings(counts), [counts])
  return (
    <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-cream-deep/70 p-1.5">
      <PizzaRender sizeId={sizeId} crustId={crustId} toppings={toppings} bake={1} className="h-full w-full" />
    </div>
  )
}

export function CartScreen() {
  const cart = useStore((s) => s.cart)
  const navigate = useStore((s) => s.navigate)
  const updateCartCount = useStore((s) => s.updateCartCount)
  const removeCartPizza = useStore((s) => s.removeCartPizza)

  const subtotal = cart.reduce((n, p) => n + p.unitPrice * p.count, 0)

  return (
    <div className="flex min-h-full flex-col bg-cream">
      <header className="flex items-center justify-between border-b border-ink/10 px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('builder')}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl text-ink transition-colors hover:bg-ink/8"
            aria-label="Back to the pizza builder"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <Wordmark />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-6">
        <h1 className="font-display text-3xl font-black text-ink sm:text-4xl">Your order</h1>

        {cart.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10 grid place-items-center text-center">
            <svg viewBox="0 0 120 84" className="w-44" aria-hidden="true">
              <rect x="8" y="30" width="104" height="46" rx="8" fill="#D9A968" stroke="#B98A4E" strokeWidth="4" />
              <path d="M 8 30 L 60 6 L 112 30" fill="none" stroke="#B98A4E" strokeWidth="4" strokeLinejoin="round" />
              <circle cx="60" cy="53" r="12" fill="none" stroke="#B98A4E" strokeWidth="3" strokeDasharray="4 5" />
            </svg>
            <p className="mt-4 font-display text-xl font-bold text-ink">The box is empty</p>
            <p className="mt-1 max-w-xs text-sm text-ink-soft">No pizzas yet. The oven is hot and the dough is waiting.</p>
            <Btn onClick={() => navigate('builder')} className="mt-5">
              Build a Pizza
            </Btn>
          </motion.div>
        ) : (
          <>
            <ul className="mt-6 flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {cart.map((p) => {
                  const size = getSize(p.sizeId)
                  const crust = getCrust(p.crustId)
                  const toppingText =
                    Object.keys(p.toppings)
                      .sort((a, b) => getIngredient(a).layer - getIngredient(b).layer)
                      .map((id) => getIngredient(id).name)
                      .join(', ') || 'Just sauce'
                  return (
                    <motion.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
                      className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-paper p-4 shadow-[0_8px_20px_-12px_rgba(30,18,8,0.3)]"
                    >
                      <MiniPizza counts={p.toppings} sizeId={p.sizeId} crustId={p.crustId} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h2 className="truncate font-display text-lg font-bold text-ink">{p.name}</h2>
                          <span className="shrink-0 font-display text-lg font-black text-ink">{formatPrice(p.unitPrice * p.count)}</span>
                        </div>
                        <p className="text-[13px] text-ink-soft">
                          {size.name} · {crust.name}
                        </p>
                        <p className="mt-0.5 truncate text-[13px] text-ink-soft">{toppingText}</p>
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="flex items-center gap-1" role="group" aria-label={`Quantity of ${p.name}`}>
                            <button
                              type="button"
                              onClick={() => updateCartCount(p.id, -1)}
                              className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-ink/15 bg-cream text-ink transition-colors hover:bg-cream-deep"
                              aria-label="One pizza less"
                            >
                              <Minus className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold tabular-nums text-ink">{p.count}</span>
                            <button
                              type="button"
                              onClick={() => updateCartCount(p.id, 1)}
                              className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-ink/15 bg-cream text-ink transition-colors hover:bg-cream-deep"
                              aria-label="One pizza more"
                            >
                              <Plus className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCartPizza(p.id)}
                            className="ml-auto flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-tomato/10 hover:text-tomato"
                            aria-label={`Remove ${p.name} from order`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>

            <motion.div layout className="mt-8 rounded-2xl bg-ink p-5 text-cream">
              <div className="flex items-center justify-between text-sm text-cream/70">
                <span>
                  {cart.reduce((n, p) => n + p.count, 0)} pizza{cart.reduce((n, p) => n + p.count, 0) > 1 ? 's' : ''} in the box
                </span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-display text-2xl font-black">Total</span>
                <span className="font-display text-3xl font-black text-tomato" style={{ color: '#F0B84B' }}>
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Btn onClick={() => navigate('builder')} variant="outlineLight" className="flex-1">
                  Build Another Pizza
                </Btn>
                <Btn onClick={() => navigate('checkout')} className="flex-1">
                  Continue to Checkout
                </Btn>
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  )
}

/* ---------------- Checkout ---------------- */

export function CheckoutScreen() {
  const cart = useStore((s) => s.cart)
  const navigate = useStore((s) => s.navigate)
  const placeOrder = useStore((s) => s.placeOrder)
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const subtotal = cart.reduce((n, p) => n + p.unitPrice * p.count, 0)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (form.name.trim().length < 2) next.name = 'Tell us who this is for.'
    if (!/^[\d\s+()-]{6,}$/.test(form.phone.trim())) next.phone = 'We need a phone number to call when it is ready.'
    if (form.address.trim().length < 6) next.address = 'Where should the pizza go?'
    setErrors(next)
    if (Object.keys(next).length === 0) placeOrder()
  }

  const field = (key: keyof typeof form, label: string, placeholder: string, textarea = false) => (
    <div>
      <label htmlFor={`ck-${key}`} className="mb-1 block text-[13px] font-semibold text-ink">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={`ck-${key}`}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          rows={2}
          className="w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink/35 focus:border-tomato focus:outline-none"
        />
      ) : (
        <input
          id={`ck-${key}`}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          type={key === 'phone' ? 'tel' : 'text'}
          aria-invalid={!!errors[key]}
          className="w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink/35 focus:border-tomato focus:outline-none aria-invalid:border-tomato"
        />
      )}
      {errors[key] && <p className="mt-1 text-xs font-medium text-tomato">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="flex min-h-full flex-col bg-cream">
      <header className="flex items-center justify-between border-b border-ink/10 px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('cart')}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl text-ink transition-colors hover:bg-ink/8"
            aria-label="Back to cart"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <Wordmark />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 gap-8 px-4 py-8 md:grid-cols-[1.2fr_1fr] md:px-6">
        <div>
          <h1 className="font-display text-3xl font-black text-ink">Delivery details</h1>
          <p className="mt-1 text-sm text-ink-soft">Frontend demo: no payment is taken and nothing is sent anywhere.</p>
          {cart.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-ink/10 bg-paper p-6 text-center">
              <p className="font-display text-lg font-bold text-ink">Nothing to check out</p>
              <p className="mt-1 text-sm text-ink-soft">Your cart emptied itself. Magic, or hungry buttons.</p>
              <Btn onClick={() => navigate('builder')} className="mt-4">
                Build a Pizza
              </Btn>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
              {field('name', 'Name', 'Your Name')}
              {field('phone', 'Phone', '+1 555 010 0000')}
              {field('address', 'Address', 'Street, number, city')}
              {field('notes', 'Notes for the pizzaiolo (optional)', 'Extra crispy, ring the bell twice', true)}
              <Btn type="submit" className="mt-2 min-h-[52px] w-full">
                Place Order · {formatPrice(subtotal)}
              </Btn>
            </form>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-ink/10 bg-paper p-5 md:sticky md:top-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <ShoppingBag className="h-5 w-5 text-tomato" aria-hidden="true" />
            In the box
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-ink/8">
            {cart.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate text-ink">
                  {p.count} × {p.name}
                </span>
                <span className="shrink-0 font-semibold text-ink">{formatPrice(p.unitPrice * p.count)}</span>
              </li>
            ))}
            {cart.length === 0 && <li className="py-2 text-sm text-ink-soft">Empty.</li>}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
            <span className="font-display text-lg font-black text-ink">Total</span>
            <span className="font-display text-xl font-black text-tomato">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-soft">
            Every pizza is baked, sliced and boxed to order. Choose from {CRUSTS.length} crusts any time you order again.
          </p>
        </aside>
      </main>
    </div>
  )
}

/* ---------------- Confirmation ---------------- */

export function ConfirmationScreen() {
  const orderNumber = useStore((s) => s.orderNumber)
  const navigate = useStore((s) => s.navigate)

  return (
    <div className="grid min-h-full place-items-center bg-cream px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
          className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-basil/15"
        >
          <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
            <path d="M 12 25 L 21 34 L 36 15" fill="none" stroke="#3E7D38" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
        <h1 className="mt-6 font-display text-4xl font-black text-ink">Order placed!</h1>
        <p className="mt-2 text-ink-soft">
          Order <span className="font-bold text-ink">{orderNumber}</span> is heading to the kitchen. This is a demo checkout, so no oven was harmed and no card was charged.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Btn onClick={() => navigate('builder')} variant="outline">
            Build Another Pizza
          </Btn>
          <Btn onClick={() => navigate('landing')}>Back to Start</Btn>
        </div>
      </motion.div>
    </div>
  )
}
