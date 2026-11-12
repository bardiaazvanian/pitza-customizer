import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useStore } from './store/store'
import Landing from './screens/Landing'
import Builder from './screens/Builder'
import Sequence from './screens/Sequence'
import { CartScreen, CheckoutScreen, ConfirmationScreen } from './screens/Order'

export default function App() {
  const screen = useStore((s) => s.screen)

  return (
    <MotionConfig reducedMotion="user">
      <div className="h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            className="h-full"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {screen === 'landing' && <Landing />}
            {screen === 'builder' && <Builder />}
            {screen === 'sequence' && <Sequence />}
            {screen === 'cart' && <CartScreen />}
            {screen === 'checkout' && <CheckoutScreen />}
            {screen === 'confirmation' && <ConfirmationScreen />}
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
