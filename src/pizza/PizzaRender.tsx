import { useId, useMemo } from 'react'
import { getIngredient } from '../data/menu'
import type { ToppingsMap } from '../store/store'
import { mixColor } from './color'
import { mulberry32 } from './rng'
import { ToppingArt } from './ToppingArt'

export interface CutState {
  /** 0..1 through the whole cutting process (all diameter cuts) */
  progress: number
  /** 0..1 how far slices have drifted apart */
  separation: number
}

interface PizzaRenderProps {
  sizeId: string
  crustId: string
  toppings: ToppingsMap
  bake?: number
  cut?: CutState
  className?: string
  /** play the drop-in pop when a topping piece first appears (builder only) */
  animate?: boolean
}

const C = 500
const R_OUT = 460

/** Sauce radius per crust style. */
const CRUST_GEOM: Record<string, { sauce: number; ring: number }> = {
  classic: { sauce: 396, ring: 64 },
  thin: { sauce: 428, ring: 32 },
  stuffed: { sauce: 386, ring: 74 },
  wholegrain: { sauce: 396, ring: 64 },
}

const CRUST_COLORS: Record<string, { fresh: string; baked: string; edge: string; edgeBaked: string }> = {
  classic: { fresh: '#E9C57E', baked: '#CE9349', edge: '#D8A75D', edgeBaked: '#B37B36' },
  thin: { fresh: '#E5BC74', baked: '#C78840', edge: '#D39950', edgeBaked: '#AD6F2E' },
  stuffed: { fresh: '#E9C57E', baked: '#CE9349', edge: '#D8A75D', edgeBaked: '#B37B36' },
  wholegrain: { fresh: '#D2A35F', baked: '#B0823E', edge: '#BC8B47', edgeBaked: '#96692C' },
}

/** Smooth closed blob via Catmull-Rom, for organic sauce and cheese shapes. */
function blobPath(rng: () => number, r: number, wobble: number, cx = C, cy = C, points = 10): string {
  const pts: [number, number][] = []
  for (let i = 0; i < points; i++) {
    const a = ((i * 360) / points + (rng() * 14 - 7)) * (Math.PI / 180)
    const rr = r * (1 + (rng() * 2 - 1) * wobble)
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr])
  }
  const n = pts.length
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d + ' Z'
}

function wedgePath(startDeg: number, endDeg: number, r: number): string {
  const rad = (d: number) => ((d - 90) * Math.PI) / 180
  const x1 = C + Math.cos(rad(startDeg)) * r
  const y1 = C + Math.sin(rad(startDeg)) * r
  const x2 = C + Math.cos(rad(endDeg)) * r
  const y2 = C + Math.sin(rad(endDeg)) * r
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${C} ${C} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`
}

export function PizzaRender({ sizeId, crustId, toppings, bake = 0, cut, className, animate = false }: PizzaRenderProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const geom = CRUST_GEOM[crustId] ?? CRUST_GEOM.classic
  const colors = CRUST_COLORS[crustId] ?? CRUST_COLORS.classic
  const slices = sizeId === 'small' ? 6 : 8

  // Stable shapes: dough wobble, sauce, cheese blobs and spots never reshuffle.
  const shapes = useMemo(() => {
    const rng = mulberry32(1234567)
    const doughD = blobPath(rng, R_OUT, 0.012, C, C, 14)
    const sauceD = blobPath(rng, geom.sauce, 0.02, C, C, 12)
    const saucePatches = Array.from({ length: 8 }, () => {
      const a = rng() * 360
      const rr = rng() * geom.sauce * 0.8
      return { x: C + Math.cos((a * Math.PI) / 180) * rr, y: C + Math.sin((a * Math.PI) / 180) * rr, rx: 26 + rng() * 40, ry: 20 + rng() * 30, rot: rng() * 180 }
    })
    // mozzarella melt: one blob per serving (max 3), each a bit further out
    const cheeseBlobs = [0, 1, 2].map((i) => ({
      d: blobPath(rng, geom.sauce * (0.93 + i * 0.03), 0.03, C + (i - 1) * 12, C + (i - 1) * 9, 12),
      poolD: blobPath(rng, geom.sauce * (0.34 + i * 0.12), 0.16, C + (i - 1) * 130, C + (i - 1) * -90, 9),
    }))
    const brownedSpots = Array.from({ length: 14 }, () => {
      const a = rng() * 360
      const rr = rng() * geom.sauce * 0.9
      return { x: C + Math.cos((a * Math.PI) / 180) * rr, y: C + Math.sin((a * Math.PI) / 180) * rr, rx: 8 + rng() * 16, ry: 6 + rng() * 12, rot: rng() * 180 }
    })
    const bubbles = Array.from({ length: 12 }, () => {
      const a = rng() * 360
      const rr = (0.2 + rng() * 0.7) * geom.sauce
      return { x: C + Math.cos((a * Math.PI) / 180) * rr, y: C + Math.sin((a * Math.PI) / 180) * rr, r: 5 + rng() * 9 }
    })
    const charSpots = Array.from({ length: 16 }, () => {
      const band = geom.sauce + 14 + rng() * (R_OUT - geom.sauce - 26)
      const a = rng() * 360
      return { x: C + Math.cos((a * Math.PI) / 180) * band, y: C + Math.sin((a * Math.PI) / 180) * band, rx: 5 + rng() * 9, ry: 4 + rng() * 7, rot: rng() * 180 }
    })
    const seeds =
      crustId === 'wholegrain'
        ? Array.from({ length: 46 }, () => {
            const band = geom.sauce + 10 + rng() * (R_OUT - geom.sauce - 22)
            const a = rng() * 360
            return { x: C + Math.cos((a * Math.PI) / 180) * band, y: C + Math.sin((a * Math.PI) / 180) * band, rot: rng() * 180 }
          })
        : []
    // oregano sprinkle: flecks across the whole pie, density follows qty
    const oreganoQty = toppings.oregano?.qty ?? 0
    const oreganoRng = mulberry32(777)
    const oreganoFlecks = Array.from({ length: oreganoQty * 26 }, () => {
      const a = oreganoRng() * 360
      const rr = Math.sqrt(oreganoRng()) * geom.sauce * 0.92
      return { x: C + Math.cos((a * Math.PI) / 180) * rr, y: C + Math.sin((a * Math.PI) / 180) * rr, rot: oreganoRng() * 180, w: 7 + oreganoRng() * 5 }
    })
    return { doughD, sauceD, saucePatches, cheeseBlobs, brownedSpots, bubbles, charSpots, seeds, oreganoFlecks }
  }, [crustId, geom.sauce, toppings.oregano?.qty])

  const crustFill = mixColor(colors.fresh, colors.baked, bake)
  const crustEdge = mixColor(colors.edge, colors.edgeBaked, bake)
  const sauceFill = mixColor('#C8422A', '#A93619', bake)
  const cheeseFill = mixColor('#F7DC8A', '#EFC15A', bake)
  const cheesePool = mixColor('#FCE9A8', '#F6D078', bake)
  const mozzarellaQty = Math.min(3, toppings.mozzarella?.qty ?? 0)

  const pieceNodes = useMemo(() => {
    const nodes: React.JSX.Element[] = []
    const ids = Object.keys(toppings).sort((a, b) => getIngredient(a).layer - getIngredient(b).layer)
    for (const id of ids) {
      const ing = getIngredient(id)
      if (id === 'mozzarella' || id === 'oregano') continue
      const state = toppings[id]
      state.pieces.forEach((piece, idx) => {
        const rad = (piece.a * Math.PI) / 180
        const dist = piece.r * geom.sauce
        const x = C + Math.cos(rad) * dist
        const y = C + Math.sin(rad) * dist
        const s = ing.scale * 10 * piece.scale
        const sx = piece.flip ? -s : s
        nodes.push(
          <g key={`${id}-${idx}`} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${piece.rot.toFixed(0)}) scale(${sx.toFixed(3)} ${s.toFixed(3)})`}>
            <g className={animate ? 'pz-pop' : undefined}>
              <ToppingArt id={id} bake={bake} variant={idx % 4} />
            </g>
          </g>,
        )
      })
    }
    return nodes
  }, [toppings, geom.sauce, bake])

  const content = (
    <g>
      {/* dough */}
      <path d={shapes.doughD} fill={crustFill} />
      <path d={shapes.doughD} fill="none" stroke={crustEdge} strokeWidth={10} opacity={0.8} />
      {/* crust char + seeds */}
      {shapes.charSpots.map((s, i) => (
        <ellipse key={`ch${i}`} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} transform={`rotate(${s.rot} ${s.x} ${s.y})`} fill="#6B3A16" opacity={bake * 0.45} />
      ))}
      {shapes.seeds.map((s, i) => (
        <ellipse key={`sd${i}`} cx={s.x} cy={s.y} rx={5} ry={2.6} transform={`rotate(${s.rot} ${s.x} ${s.y})`} fill="#7A5526" opacity={0.8} />
      ))}
      {crustId === 'stuffed' &&
        Array.from({ length: 18 }, (_, i) => {
          const a = ((i * 360) / 18) * (Math.PI / 180)
          const band = R_OUT - 30
          return <circle key={`st${i}`} cx={C + Math.cos(a) * band} cy={C + Math.sin(a) * band} r={16} fill={mixColor('#F2D77E', '#D8B35C', bake)} opacity={0.95} />
        })}
      {/* top-left sheen for volume */}
      <path d={shapes.doughD} fill="url(#pz-sheen)" opacity={0.5} />
      {/* sauce */}
      <path d={shapes.sauceD} fill={sauceFill} />
      {shapes.saucePatches.map((s, i) => (
        <ellipse key={`sp${i}`} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} transform={`rotate(${s.rot} ${s.x} ${s.y})`} fill="#A83220" opacity={0.35} />
      ))}
      {/* mozzarella melt layer */}
      {mozzarellaQty > 0 && (
        <g>
          {shapes.cheeseBlobs.slice(0, mozzarellaQty).map((b, i) => (
            <path key={`cb${i}`} d={b.d} fill={cheeseFill} />
          ))}
          {shapes.cheeseBlobs.slice(0, mozzarellaQty).map((b, i) => (
            <path key={`cp${i}`} d={b.poolD} fill={cheesePool} opacity={0.55} />
          ))}
          {shapes.brownedSpots.map((s, i) => (
            <ellipse key={`bs${i}`} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} transform={`rotate(${s.rot} ${s.x} ${s.y})`} fill="#C98E3E" opacity={bake * 0.75} />
          ))}
          {shapes.bubbles.map((s, i) => (
            <circle key={`bb${i}`} cx={s.x} cy={s.y} r={s.r} fill={cheesePool} opacity={0.35 + bake * 0.55} />
          ))}
        </g>
      )}
      {/* discrete toppings */}
      {pieceNodes}
      {/* oregano sprinkle on top */}
      {shapes.oreganoFlecks.map((s, i) => (
        <rect key={`or${i}`} x={s.x} y={s.y} width={s.w} height={s.w * 0.45} rx={s.w * 0.22} transform={`rotate(${s.rot} ${s.x} ${s.y})`} fill={mixColor('#5C7A3A', '#49602C', bake)} opacity={0.95} />
      ))}
    </g>
  )

  const cutActive = cut && cut.progress > 0
  const cuts = slices / 2
  const wedgeStep = 360 / slices

  return (
    <svg viewBox="0 0 1000 1000" className={className} role="img" aria-label="Pizza">
      <defs>
        <radialGradient id={`pz-sheen-${uid}`} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0%" stopColor="#FFF6E0" stopOpacity="0.5" />
          <stop offset="45%" stopColor="#FFF6E0" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FFF6E0" stopOpacity="0" />
        </radialGradient>
        <filter id={`pz-shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="7" stdDeviation="10" floodColor="#1E1208" floodOpacity="0.45" />
        </filter>
        {cutActive &&
          Array.from({ length: slices }, (_, i) => (
            <clipPath key={i} id={`pz-wedge-${uid}-${i}`}>
              <path d={wedgePath(i * wedgeStep, (i + 1) * wedgeStep, R_OUT + 6)} />
            </clipPath>
          ))}
      </defs>
      {cutActive ? (
        <g>
          {Array.from({ length: slices }, (_, i) => {
            const mid = ((i + 0.5) * wedgeStep - 90) * (Math.PI / 180)
            const sep = cut!.separation * 16
            const dx = Math.cos(mid) * sep
            const dy = Math.sin(mid) * sep
            return (
              <g
                key={i}
                clipPath={`url(#pz-wedge-${uid}-${i})`}
                transform={`translate(${dx.toFixed(2)} ${dy.toFixed(2)})`}
                filter={cut!.separation > 0.05 ? `url(#pz-shadow-${uid})` : undefined}
              >
                {content}
              </g>
            )
          })}
          {/* fresh cut lines */}
          {Array.from({ length: cuts }, (_, k) => {
            const lineP = Math.min(1, Math.max(0, cut!.progress * cuts - k))
            if (lineP <= 0) return null
            const a = (k * (180 / cuts) * Math.PI) / 180
            const dx = Math.cos(a) * (R_OUT + 4)
            const dy = Math.sin(a) * (R_OUT + 4)
            return (
              <g key={`cut-${k}`}>
                <line
                  x1={C - dx}
                  y1={C - dy}
                  x2={C + dx}
                  y2={C + dy}
                  stroke="#2A180C"
                  strokeWidth={cut!.separation > 0.05 ? 0 : 5}
                  strokeLinecap="round"
                  opacity={0.55}
                  pathLength={1}
                  strokeDasharray={`${lineP} 1`}
                />
                <line
                  x1={C - dx}
                  y1={C - dy + 3}
                  x2={C + dx}
                  y2={C + dy + 3}
                  stroke="#F8E9C8"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  opacity={0.35 * lineP * (cut!.separation > 0.05 ? 0 : 1)}
                  pathLength={1}
                  strokeDasharray={`${lineP} 1`}
                />
              </g>
            )
          })}
        </g>
      ) : (
        content
      )}
    </svg>
  )
}
