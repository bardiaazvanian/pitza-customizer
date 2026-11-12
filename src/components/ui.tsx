import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/** Brand mark: a round pie with one slice lifted out. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="29" cy="33" r="24" fill="#D8431F" />
      <circle cx="29" cy="33" r="19" fill="#F0B84B" />
      <circle cx="24" cy="28" r="4.5" fill="#D8431F" />
      <circle cx="34" cy="38" r="4" fill="#D8431F" />
      <circle cx="31" cy="24" r="3" fill="#D8431F" />
      <path d="M 40 24 L 60 6 L 60 30 Q 50 34 43 30 Z" fill="#F0B84B" stroke="#D8431F" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="52" cy="18" r="3" fill="#D8431F" />
    </svg>
  )
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={38} />
      <span className="leading-none">
        <span className={`font-display font-black text-[22px] tracking-wide ${dark ? 'text-cream' : 'text-ink'}`}>TONDA</span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.28em] ${dark ? 'text-cream/70' : 'text-ink-soft'}`}>Pizza Studio</span>
      </span>
    </span>
  )
}

type BtnVariant = 'primary' | 'dark' | 'ghost' | 'outline' | 'outlineLight'

const VARIANTS: Record<BtnVariant, string> = {
  primary: 'bg-tomato text-cream shadow-[0_10px_24px_-8px_rgba(176,47,18,0.55)] hover:bg-tomato-deep',
  dark: 'bg-ink text-cream hover:bg-[#3a2c1e]',
  ghost: 'bg-transparent text-ink hover:bg-ink/8',
  outline: 'bg-transparent text-ink border-2 border-ink/25 hover:border-ink/60 hover:bg-ink/5',
  outlineLight: 'bg-transparent text-cream border-2 border-cream/35 hover:border-cream/80 hover:bg-cream/10',
}

interface BtnProps {
  children: ReactNode
  onClick?: () => void
  variant?: BtnVariant
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
  ariaLabel?: string
}

export function Btn({ children, onClick, variant = 'primary', className = '', disabled, type = 'button', ariaLabel }: BtnProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-3 font-sans text-[15px] font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </motion.button>
  )
}

/** Circular metal tray the pizza sits on (CSS, no image needed). */
export function Tray({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative grid place-items-center rounded-full ${className}`}
      style={{
        background:
          'radial-gradient(circle at 38% 32%, #E8EBEE 0%, #C3C9CF 42%, #AEB5BC 62%, #CDD3D8 78%, #9DA4AB 92%, #868D94 100%)',
        boxShadow: '0 26px 50px -16px rgba(30,18,8,0.5), inset 0 2px 6px rgba(255,255,255,0.7), inset 0 -8px 18px rgba(30,25,20,0.25)',
        padding: '4.2%',
      }}
    >
      <div
        className="relative grid h-full w-full place-items-center rounded-full"
        style={{ background: 'radial-gradient(circle at 40% 30%, #DFE3E6 0%, #BEC4C9 60%, #ADB3B9 100%)', boxShadow: 'inset 0 4px 14px rgba(30,25,20,0.28)' }}
      >
        {children}
      </div>
    </div>
  )
}
