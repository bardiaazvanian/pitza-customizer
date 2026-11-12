import { create } from 'zustand'
import { getCrust, getIngredient, getSize, MAX_QTY } from '../data/menu'
import { hashString, mulberry32 } from '../pizza/rng'

export type Screen = 'landing' | 'builder' | 'sequence' | 'cart' | 'checkout' | 'confirmation'

/** One physical piece of topping, placed once and frozen forever after. */
export interface Piece {
  /** distance from center as a fraction of the sauce radius */
  r: number
  /** degrees */
  a: number
  rot: number
  scale: number
  flip: boolean
}

export interface ToppingState {
  qty: number
  pieces: Piece[]
}

export type ToppingsMap = Record<string, ToppingState>

export interface CartPizza {
  id: string
  name: string
  sizeId: string
  crustId: string
  /** qty per ingredient, placements are not needed once boxed */
  toppings: Record<string, number>
  unitPrice: number
  count: number
}

export function pizzaPrice(sizeId: string, crustId: string, toppingCounts: Record<string, number>): number {
  const size = getSize(sizeId)
  const crust = getCrust(crustId)
  let total = size.basePrice + crust.price
  for (const [id, qty] of Object.entries(toppingCounts)) {
    total += qty * getIngredient(id).price
  }
  return Math.round(total * 100) / 100
}

export function pizzaName(toppingCounts: Record<string, number>): string {
  const display = Object.keys(toppingCounts)
    .filter((id) => toppingCounts[id] > 0 && id !== 'mozzarella')
    .sort((a, b) => getIngredient(a).layer - getIngredient(b).layer)
    .map((id) => getIngredient(id).name)
  if (display.length === 0) return 'Margherita'
  const head = display.slice(0, 2).join(' & ')
  return display.length > 2 ? `${head} +${display.length - 2}` : head
}

/**
 * Random scatter with minimum-distance rejection: organic placement that never
 * clumps into stacks, deterministic per batch, always inside the sauce circle.
 */
function makePieces(ingredientId: string, existing: Piece[], count: number, minDist: number): Piece[] {
  const rng = mulberry32(hashString(ingredientId) ^ Math.floor(Math.random() * 1e9))
  const pieces: Piece[] = []
  for (let i = 0; i < count; i++) {
    let r = 0.5
    let a = 0
    for (let tries = 0; tries < 10; tries++) {
      r = Math.sqrt(rng()) * 0.96
      a = rng() * 360
      const crowded = [...existing, ...pieces].some((p) => {
        const da = Math.min(Math.abs(p.a - a), 360 - Math.abs(p.a - a))
        const chord = Math.sqrt((p.r - r) ** 2 + 2 * p.r * r * (1 - Math.cos((da * Math.PI) / 180)))
        return chord < minDist
      })
      if (!crowded) break
    }
    pieces.push({ r, a, rot: rng() * 360, scale: 0.84 + rng() * 0.32, flip: rng() > 0.5 })
  }
  return pieces
}

/** Rejection radius as a fraction of the sauce circle, sized per ingredient. */
function spreadFor(ingredientId: string): number {
  const ing = getIngredient(ingredientId)
  return Math.min(0.2, Math.max(0.08, ing.scale * 7.5))
}

/** Build a full ToppingsMap (with placed pieces) from plain per-ingredient counts. */
export function buildToppings(counts: Record<string, number>): ToppingsMap {
  const map: ToppingsMap = {}
  for (const [id, qty] of Object.entries(counts)) {
    const ing = getIngredient(id)
    let pieces: Piece[] = []
    if (ing.piecesPerServing > 0) {
      for (let s = 0; s < qty; s++) {
        pieces = pieces.concat(makePieces(id, pieces, ing.piecesPerServing, spreadFor(id)))
      }
    }
    map[id] = { qty, pieces }
  }
  return map
}

interface StoreState {
  screen: Screen
  sizeId: string
  crustId: string
  toppings: ToppingsMap
  /** frozen copy so the baked pizza stays identical across sequence stages */
  frozenSizeId: string
  frozenCrustId: string
  frozenToppings: ToppingsMap | null
  cart: CartPizza[]
  lastAddedId: string | null
  orderNumber: string

  navigate: (screen: Screen) => void
  setSize: (id: string) => void
  setCrust: (id: string) => void
  addServing: (ingredientId: string) => void
  removeServing: (ingredientId: string) => void
  removeIngredient: (ingredientId: string) => void
  resetBuilder: () => void

  startBake: () => void
  addToOrder: () => void
  createAnother: () => void
  updateCartCount: (id: string, delta: number) => void
  removeCartPizza: (id: string) => void
  placeOrder: () => void
}

export const useStore = create<StoreState>((set, get) => ({
  screen: 'landing',
  sizeId: 'medium',
  crustId: 'classic',
  toppings: { mozzarella: { qty: 1, pieces: [] } },
  frozenSizeId: 'medium',
  frozenCrustId: 'classic',
  frozenToppings: null,
  cart: [],
  lastAddedId: null,
  orderNumber: '',

  navigate: (screen) => set({ screen }),

  setSize: (id) => set({ sizeId: id }),
  setCrust: (id) => set({ crustId: id }),

  addServing: (ingredientId) => {
    const ing = getIngredient(ingredientId)
    const current = get().toppings[ingredientId]
    const qty = (current?.qty ?? 0) + 1
    if (qty > MAX_QTY) return
    let pieces = current?.pieces ?? []
    if (ing.piecesPerServing > 0) {
      pieces = [...pieces, ...makePieces(ingredientId, pieces, ing.piecesPerServing, spreadFor(ingredientId))]
    }
    set({ toppings: { ...get().toppings, [ingredientId]: { qty, pieces } } })
  },

  removeServing: (ingredientId) => {
    const ing = getIngredient(ingredientId)
    const current = get().toppings[ingredientId]
    if (!current || current.qty <= 0) return
    const qty = current.qty - 1
    const pieces = ing.piecesPerServing > 0 ? current.pieces.slice(0, qty * ing.piecesPerServing) : []
    const next = { ...get().toppings }
    if (qty === 0) delete next[ingredientId]
    else next[ingredientId] = { qty, pieces }
    set({ toppings: next })
  },

  removeIngredient: (ingredientId) => {
    const next = { ...get().toppings }
    delete next[ingredientId]
    set({ toppings: next })
  },

  resetBuilder: () =>
    set({
      sizeId: 'medium',
      crustId: 'classic',
      toppings: { mozzarella: { qty: 1, pieces: [] } },
      frozenToppings: null,
    }),

  startBake: () => {
    const { sizeId, crustId, toppings } = get()
    set({ frozenSizeId: sizeId, frozenCrustId: crustId, frozenToppings: toppings, screen: 'sequence' })
  },

  addToOrder: () => {
    const { sizeId, crustId, toppings } = get()
    const counts: Record<string, number> = {}
    for (const [ingId, state] of Object.entries(toppings)) counts[ingId] = state.qty
    const pizza: CartPizza = {
      id: `pizza-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      name: pizzaName(counts),
      sizeId,
      crustId,
      toppings: counts,
      unitPrice: pizzaPrice(sizeId, crustId, counts),
      count: 1,
    }
    set({ cart: [...get().cart, pizza], lastAddedId: pizza.id, screen: 'cart' })
  },

  createAnother: () => {
    // the boxed pizza stays in the order; the bench starts fresh
    const { sizeId, crustId, toppings } = get()
    const counts: Record<string, number> = {}
    for (const [ingId, state] of Object.entries(toppings)) counts[ingId] = state.qty
    const pizza: CartPizza = {
      id: `pizza-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      name: pizzaName(counts),
      sizeId,
      crustId,
      toppings: counts,
      unitPrice: pizzaPrice(sizeId, crustId, counts),
      count: 1,
    }
    set({
      cart: [...get().cart, pizza],
      sizeId: 'medium',
      crustId: 'classic',
      toppings: { mozzarella: { qty: 1, pieces: [] } },
      frozenToppings: null,
      screen: 'builder',
    })
  },

  updateCartCount: (id, delta) => {
    const cart = get()
      .cart.map((p) => (p.id === id ? { ...p, count: Math.max(0, p.count + delta) } : p))
      .filter((p) => p.count > 0)
    set({ cart })
  },

  removeCartPizza: (id) => set({ cart: get().cart.filter((p) => p.id !== id) }),

  placeOrder: () => {
    const num = `TD-${Math.floor(1000 + Math.random() * 9000)}`
    set({ orderNumber: num, cart: [], screen: 'confirmation' })
  },
}))
