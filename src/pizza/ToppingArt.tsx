import { mixColor } from './color'
import { mulberry32 } from './rng'

interface ArtProps {
  bake: number
  variant: number
}

/** Donut shape (outer circle minus inner circle) so the hole shows layers beneath. */
function donut(rOut: number, rIn: number): string {
  return `M ${rOut} 0 A ${rOut} ${rOut} 0 1 0 ${-rOut} 0 A ${rOut} ${rOut} 0 1 0 ${rOut} 0 Z
          M ${rIn} 0 A ${rIn} ${rIn} 0 1 1 ${-rIn} 0 A ${rIn} ${rIn} 0 1 1 ${rIn} 0 Z`
}

/** Annular sector (arc slice), used for pepper and onion rings. */
function arcSector(a0: number, a1: number, rOut: number, rIn: number): string {
  const rad = (d: number) => (d * Math.PI) / 180
  const p = (a: number, r: number) => `${Math.cos(rad(a)) * r} ${Math.sin(rad(a)) * r}`
  const large = a1 - a0 > 180 ? 1 : 0
  return `M ${p(a0, rOut)} A ${rOut} ${rOut} 0 ${large} 1 ${p(a1, rOut)} L ${p(a1, rIn)} A ${rIn} ${rIn} 0 ${large} 0 ${p(a0, rIn)} Z`
}

function Pepperoni({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 7919)
  const base = mixColor('#C2472C', '#A03017', bake)
  const rim = mixColor('#8E2B1C', '#6B1E0D', bake)
  const inner = mixColor('#D65B3B', '#AE4224', bake)
  const fat = mixColor('#ECC0A8', '#DFB193', bake)
  return (
    <g>
      <circle r={48} fill={base} stroke={rim} strokeWidth={5} />
      <circle r={37} fill={inner} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = rng() * 360
        const d = rng() * 30
        const x = Math.cos((a * Math.PI) / 180) * d
        const y = Math.sin((a * Math.PI) / 180) * d
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx={2.5 + rng() * 2.5}
            ry={1.8 + rng() * 2}
            transform={`rotate(${rng() * 180} ${x} ${y})`}
            fill={fat}
            opacity={0.9}
          />
        )
      })}
      <ellipse cx={-14} cy={-16} rx={20} ry={11} transform="rotate(-25 -14 -16)" fill="#FFF3E4" opacity={0.1 + 0.14 * bake} />
    </g>
  )
}

function Parmesan({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 104729)
  const body = mixColor('#F8F1DC', '#EDDFB6', bake)
  const shade = mixColor('#DACD9F', '#CDBB85', bake)
  return (
    <g>
      {Array.from({ length: 3 }, (_, i) => {
        const x = (rng() - 0.5) * 30
        const y = (rng() - 0.5) * 30
        const rot = rng() * 180
        const w = 20 + rng() * 12
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
            <path d={`M ${-w / 2} 0 L ${-w / 2 + 5} -6 L ${w / 2} -3 L ${w / 2 - 5} 4 Z`} fill={shade} />
            <path d={`M ${-w / 2} 2 L ${-w / 2 + 5} -4 L ${w / 2} -1 L ${w / 2 - 5} 6 Z`} fill={body} />
          </g>
        )
      })}
    </g>
  )
}

function Cheddar({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 15485863)
  const top = mixColor('#F0A02B', '#D9821A', bake)
  const side = mixColor('#C97F15', '#A66310', bake)
  const light = mixColor('#F8BC58', '#E29B33', bake)
  return (
    <g transform={`rotate(${rng() * 90 - 45})`}>
      <rect x={-19} y={-16} width={38} height={36} rx={7} fill={side} />
      <rect x={-19} y={-19} width={38} height={36} rx={7} fill={top} />
      <rect x={-13} y={-13} width={16} height={13} rx={5} fill={light} opacity={0.85} />
    </g>
  )
}

function Feta({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 32452843)
  const body = mixColor('#FCF8EE', '#F4E9CF', bake)
  const shade = mixColor('#E4DCCB', '#D8C9A4', bake)
  return (
    <g>
      {Array.from({ length: 3 }, (_, i) => {
        const x = (rng() - 0.5) * 34
        const y = (rng() - 0.5) * 30
        const rot = rng() * 180
        const s = 0.7 + rng() * 0.6
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
            <path d="M -18 6 L -10 -12 L 12 -10 L 18 4 L 6 14 Z" fill={shade} />
            <path d="M -18 3 L -10 -14 L 12 -13 L 18 1 L 6 11 Z" fill={body} />
          </g>
        )
      })}
    </g>
  )
}

function Chicken({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 49979687)
  const body = mixColor('#DCA35E', '#C08A42', bake)
  const dark = mixColor('#A96E33', '#8E5A26', bake)
  const light = mixColor('#EBC28B', '#D6AB69', bake)
  const a = rng() * 180
  return (
    <g>
      <path
        d="M -26 -10 Q -30 -22 -14 -26 Q 4 -30 18 -22 Q 30 -14 26 0 Q 24 14 8 20 Q -10 26 -20 14 Q -30 2 -26 -10 Z"
        fill={body}
      />
      <path d="M -16 -18 Q 0 -22 12 -14" stroke={light} strokeWidth={5} fill="none" strokeLinecap="round" />
      <g stroke={dark} strokeWidth={4.5} strokeLinecap="round" opacity={0.75} transform={`rotate(${a})`}>
        <line x1={-16} y1={-4} x2={16} y2={-4} />
        <line x1={-14} y1={8} x2={14} y2={8} />
      </g>
    </g>
  )
}

function Sausage({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 611953)
  const body = mixColor('#8A4A33', '#6B3423', bake)
  const dark = mixColor('#5E2C1D', '#4A2114', bake)
  return (
    <g>
      <path d="M -24 -8 Q -26 -20 -10 -24 Q 8 -28 20 -18 Q 30 -10 24 4 Q 20 16 4 18 Q -14 20 -22 8 Q -26 0 -24 -8 Z" fill={body} />
      {Array.from({ length: 6 }, (_, i) => {
        const x = (rng() - 0.5) * 36
        const y = (rng() - 0.5) * 28
        return <circle key={i} cx={x} cy={y} r={1.6 + rng() * 1.6} fill={dark} />
      })}
      <ellipse cx={-8} cy={-14} rx={10} ry={5} transform="rotate(-20 -8 -14)" fill="#FFF3E4" opacity={0.08 + 0.1 * bake} />
    </g>
  )
}

function Bacon({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 982451653)
  const meat = mixColor('#B24A2F', '#8E3318', bake)
  const fat = mixColor('#EFC3AC', '#DFB489', bake)
  const edge = mixColor('#7E2C15', '#631F0C', bake)
  const wob = 4 + rng() * 5
  return (
    <g>
      <path
        d={`M -48 ${-8 + wob} C -34 ${-18 - wob}, -20 ${-2 + wob}, -6 ${-12 - wob} C 8 ${-20 - wob}, 26 ${-4 + wob}, 48 ${-12 - wob}
            L 48 ${6 + wob} C 34 ${14 - wob}, 22 ${0 + wob}, 8 ${8 - wob} C -8 ${16 + wob}, -28 ${2 - wob}, -48 ${10 + wob} Z`}
        fill={meat}
        stroke={edge}
        strokeWidth={2.5}
      />
      <path d={`M -44 ${-4 + wob} C -28 ${-12 - wob}, -12 ${2 + wob}, 4 ${-8 - wob} C 20 ${-16 - wob}, 34 ${-2 + wob}, 46 ${-8 - wob}`} stroke={fat} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} />
      <path d={`M -42 ${8 + wob} C -26 ${0 - wob}, -10 ${12 + wob}, 6 ${2 - wob} C 22 ${-6 - wob}, 36 ${8 + wob}, 46 ${4 - wob}`} stroke={fat} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.75} />
    </g>
  )
}

function GreenPepper({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 1299709)
  const skin = mixColor('#3E8E3C', '#2E6C2C', bake)
  const flesh = mixColor('#BFDCA0', '#A9C489', bake)
  const a0 = rng() * 360
  return (
    <g>
      <path d={arcSector(a0, a0 + 150, 46, 25)} fill={skin} />
      <path d={arcSector(a0 + 8, a0 + 142, 39, 25)} fill={flesh} />
      <path d={arcSector(a0 + 8, a0 + 142, 39, 34)} fill={skin} opacity={0.35} />
    </g>
  )
}

function RedOnion({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 2038074743)
  const skin = mixColor('#A94486', '#8F3570', bake)
  const inner = mixColor('#D9A0CB', '#C488B8', bake)
  const a0 = rng() * 360
  return (
    <g>
      <path d={donut(44, 32)} fill={skin} fillRule="evenodd" />
      <path d={donut(32, 24)} fill={inner} fillRule="evenodd" opacity={0.9} />
      <path d={arcSector(a0, a0 + 120, 24, 14)} fill={skin} opacity={0.55} />
    </g>
  )
}

function Mushroom({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 224737)
  const cap = mixColor('#C9B18F', '#A98F62', bake)
  const flesh = mixColor('#F2EADA', '#E2D6BC', bake)
  const gill = mixColor('#B49A72', '#967B50', bake)
  const rot = rng() * 360
  return (
    <g transform={`rotate(${rot})`}>
      <path d="M -32 14 Q 0 -46 32 14 L 24 24 Q 0 32 -24 24 Z" fill={cap} />
      <path d="M -24 22 Q 0 30 24 22 L 24 27 Q 0 35 -24 27 Z" fill={flesh} />
      <g stroke={gill} strokeWidth={2.4} strokeLinecap="round">
        <line x1={-16} y1={24} x2={-13} y2={31} />
        <line x1={-6} y1={26} x2={-5} y2={33} />
        <line x1={6} y1={26} x2={5} y2={33} />
        <line x1={16} y1={24} x2={13} y2={31} />
      </g>
      <path d="M -9 30 L 9 30 L 6 50 Q 0 55 -6 50 Z" fill={flesh} />
    </g>
  )
}

function BlackOlive({ bake }: ArtProps) {
  const body = mixColor('#352A24', '#241B16', bake)
  const hi = mixColor('#5A483D', '#463629', bake)
  return (
    <g>
      <path d={donut(42, 17)} fill={body} fillRule="evenodd" />
      <path d="M -30 -14 A 34 34 0 0 1 6 -33" stroke={hi} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  )
}

function Tomato({ bake }: ArtProps) {
  const skin = mixColor('#E04B30', '#C23820', bake)
  const flesh = mixColor('#EF7E5A', '#DE6844', bake)
  const pocket = mixColor('#F8A98A', '#E8936F', bake)
  const seed = mixColor('#FBE3C9', '#EFD2AC', bake)
  return (
    <g>
      <circle r={46} fill={skin} />
      <circle r={38} fill={flesh} />
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i * 72 * Math.PI) / 180
        const x = Math.cos(a) * 21
        const y = Math.sin(a) * 21
        return (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={12} ry={8} transform={`rotate(${(i * 72 + 20)} ${x} ${y})`} fill={pocket} opacity={0.9} />
            <circle cx={x * 0.8} cy={y * 0.8} r={2.2} fill={seed} />
            <circle cx={x * 1.05 + 3} cy={y * 1.05 + 2} r={1.8} fill={seed} />
          </g>
        )
      })}
      <circle r={7} fill={pocket} opacity={0.8} />
    </g>
  )
}

function Jalapeno({ bake }: ArtProps) {
  const skin = mixColor('#4F7C2E', '#3C6122', bake)
  const inner = mixColor('#D7E3B5', '#C4D29E', bake)
  const core = mixColor('#8FB45C', '#7A9C4A', bake)
  return (
    <g>
      <path d={donut(40, 20)} fill={skin} fillRule="evenodd" />
      <circle r={20} fill={inner} />
      <circle r={11} fill={core} opacity={0.85} />
    </g>
  )
}

function Basil({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 1303)
  const leaf = mixColor('#4C8C3F', '#3A6E31', bake)
  const vein = mixColor('#6FB05C', '#568A47', bake)
  const rot = -30 + rng() * 60
  return (
    <g transform={`rotate(${rot})`}>
      <path d="M 0 -42 C 27 -28 32 12 0 44 C -32 12 -27 -28 0 -42 Z" fill={leaf} />
      <line x1={0} y1={-34} x2={0} y2={38} stroke={vein} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M 0 -12 Q 12 -10 18 -2 M 0 4 Q -12 6 -17 14 M 0 20 Q 10 22 14 28" stroke={vein} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </g>
  )
}

function Arugula({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 2357)
  const leaf = mixColor('#5E8C46', '#496F35', bake)
  const stem = mixColor('#7AA35C', '#628546', bake)
  const rot = -40 + rng() * 80
  return (
    <g transform={`rotate(${rot})`}>
      <path d="M -3 26 L 3 26 L 2 52 L -2 52 Z" fill={stem} />
      <path
        d="M 0 -46 L 9 -32 L 3 -26 L 17 -12 L 8 -6 L 19 10 L 7 14 L 13 30 L 0 27 L -13 30 L -7 14 L -19 10 L -8 -6 L -17 -12 L -3 -26 L -9 -32 Z"
        fill={leaf}
      />
    </g>
  )
}

function Oregano({ bake, variant }: ArtProps) {
  const rng = mulberry32(variant * 4409)
  const c1 = mixColor('#5C7A3A', '#49602C', bake)
  const c2 = mixColor('#6E8C46', '#587035', bake)
  const c3 = mixColor('#455F26', '#374D1D', bake)
  const colors = [c1, c2, c3]
  return (
    <g>
      {Array.from({ length: 30 }, (_, i) => {
        const x = (rng() - 0.5) * 74
        const y = (rng() - 0.5) * 74
        const rot = rng() * 180
        const w = 3 + rng() * 3
        return <rect key={i} x={x} y={y} width={w} height={w * 0.45} rx={w * 0.22} transform={`rotate(${rot} ${x} ${y})`} fill={colors[i % 3]} />
      })}
    </g>
  )
}

const ART: Record<string, (props: ArtProps) => React.JSX.Element> = {
  pepperoni: Pepperoni,
  parmesan: Parmesan,
  cheddar: Cheddar,
  feta: Feta,
  chicken: Chicken,
  sausage: Sausage,
  bacon: Bacon,
  'green-pepper': GreenPepper,
  'red-onion': RedOnion,
  mushroom: Mushroom,
  'black-olives': BlackOlive,
  tomato: Tomato,
  jalapeno: Jalapeno,
  basil: Basil,
  arugula: Arugula,
  oregano: Oregano,
}

export function ToppingArt({ id, bake, variant }: ArtProps & { id: string }) {
  const Art = ART[id]
  if (!Art) return null
  return <Art bake={bake} variant={variant} />
}
