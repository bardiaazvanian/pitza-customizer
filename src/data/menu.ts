export type Category = 'cheese' | 'meat' | 'vegetables' | 'fresh'

export interface Ingredient {
  id: string
  name: string
  category: Category
  price: number
  /** pieces dropped per one serving */
  piecesPerServing: number
  /** piece size relative to pizza radius (piece art is drawn ~100 units wide) */
  scale: number
  /** render order: lower renders first (underneath) */
  layer: number
  /** max radial distance from center, fraction of sauce radius */
  spread?: number
}

export const INGREDIENTS: Ingredient[] = [
  // Cheese (mozzarella is the melt layer, handled specially)
  { id: 'mozzarella', name: 'Mozzarella', category: 'cheese', price: 1.5, piecesPerServing: 0, scale: 0, layer: 10 },
  { id: 'parmesan', name: 'Parmesan', category: 'cheese', price: 1.0, piecesPerServing: 9, scale: 0.06, layer: 40 },
  { id: 'cheddar', name: 'Cheddar', category: 'cheese', price: 1.2, piecesPerServing: 9, scale: 0.058, layer: 40 },
  { id: 'feta', name: 'Feta', category: 'cheese', price: 1.4, piecesPerServing: 8, scale: 0.062, layer: 40 },
  // Meat
  { id: 'pepperoni', name: 'Pepperoni', category: 'meat', price: 2.0, piecesPerServing: 8, scale: 0.115, layer: 30 },
  { id: 'chicken', name: 'Chicken', category: 'meat', price: 2.2, piecesPerServing: 7, scale: 0.095, layer: 30 },
  { id: 'sausage', name: 'Sausage', category: 'meat', price: 2.2, piecesPerServing: 9, scale: 0.062, layer: 30 },
  { id: 'bacon', name: 'Bacon', category: 'meat', price: 2.4, piecesPerServing: 6, scale: 0.11, layer: 30 },
  // Vegetables
  { id: 'green-pepper', name: 'Green Bell Pepper', category: 'vegetables', price: 1.0, piecesPerServing: 8, scale: 0.085, layer: 50 },
  { id: 'red-onion', name: 'Red Onion', category: 'vegetables', price: 0.8, piecesPerServing: 9, scale: 0.078, layer: 50 },
  { id: 'mushroom', name: 'Mushroom', category: 'vegetables', price: 1.0, piecesPerServing: 7, scale: 0.082, layer: 50 },
  { id: 'black-olives', name: 'Black Olives', category: 'vegetables', price: 0.9, piecesPerServing: 9, scale: 0.05, layer: 55 },
  { id: 'tomato', name: 'Tomato', category: 'vegetables', price: 0.9, piecesPerServing: 6, scale: 0.09, layer: 45 },
  { id: 'jalapeno', name: 'Jalapeño', category: 'vegetables', price: 0.9, piecesPerServing: 8, scale: 0.048, layer: 55 },
  // Fresh
  { id: 'basil', name: 'Basil', category: 'fresh', price: 0.6, piecesPerServing: 7, scale: 0.075, layer: 60 },
  { id: 'arugula', name: 'Arugula', category: 'fresh', price: 0.7, piecesPerServing: 8, scale: 0.068, layer: 65 },
  { id: 'oregano', name: 'Oregano', category: 'fresh', price: 0.4, piecesPerServing: 1, scale: 0, layer: 70 },
]

export const CATEGORY_LABELS: Record<Category, string> = {
  cheese: 'Cheese',
  meat: 'Meat',
  vegetables: 'Vegetables',
  fresh: 'Fresh',
}

export const CATEGORY_ORDER: Category[] = ['cheese', 'meat', 'vegetables', 'fresh']

export function getIngredient(id: string): Ingredient {
  const found = INGREDIENTS.find((i) => i.id === id)
  if (!found) throw new Error(`Unknown ingredient: ${id}`)
  return found
}

export interface Size {
  id: string
  name: string
  diameter: string
  basePrice: number
  /** pizza display scale relative to medium */
  scale: number
  slices: number
}

export const SIZES: Size[] = [
  { id: 'small', name: 'Small', diameter: '26 cm', basePrice: 9.9, scale: 0.82, slices: 6 },
  { id: 'medium', name: 'Medium', diameter: '32 cm', basePrice: 12.9, scale: 1, slices: 8 },
  { id: 'large', name: 'Large', diameter: '40 cm', basePrice: 15.9, scale: 1.14, slices: 8 },
]

export interface Crust {
  id: string
  name: string
  price: number
  note: string
}

export const CRUSTS: Crust[] = [
  { id: 'classic', name: 'Classic Hand-Tossed', price: 0, note: 'Airy rim, golden bake' },
  { id: 'thin', name: 'Roman Thin', price: 0, note: 'Crisp and crackly' },
  { id: 'stuffed', name: 'Cheese-Stuffed', price: 2.5, note: 'Molten mozzarella rim' },
  { id: 'wholegrain', name: 'Whole Grain', price: 1.0, note: 'Rustic, nutty, seeded' },
]

export function getSize(id: string): Size {
  const found = SIZES.find((s) => s.id === id)
  if (!found) throw new Error(`Unknown size: ${id}`)
  return found
}

export function getCrust(id: string): Crust {
  const found = CRUSTS.find((c) => c.id === id)
  if (!found) throw new Error(`Unknown crust: ${id}`)
  return found
}

export const MAX_QTY = 3

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`
}
