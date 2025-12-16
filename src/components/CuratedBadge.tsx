import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { soundManager } from '@/lib/sound-manager'

export function CuratedBadge() {
  useEffect(() => {
    const timer = setTimeout(() => {
      soundManager.play('stamp')
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, rotate: -45 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: 0.3
      }}
      className="absolute top-6 right-6 z-10"
    >
      <motion.div
        animate={{ scale: [1, 0.95, 1] }}
        transition={{ delay: 0.6, duration: 0.2 }}
        className="relative"
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          className="drop-shadow-xl"
        >
          <defs>
            <radialGradient id="waxGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="oklch(0.93 0.05 85)" />
              <stop offset="100%" stopColor="oklch(0.80 0.08 75)" />
            </radialGradient>
            <filter id="waxShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx="40"
            cy="40"
            r="38"
            fill="url(#waxGradient)"
            filter="url(#waxShadow)"
          />

          <path
            d="M 40 20 L 45 32 L 58 32 L 48 40 L 52 52 L 40 45 L 28 52 L 32 40 L 22 32 L 35 32 Z"
            fill="oklch(0.15 0 0)"
            opacity="0.3"
          />

          <text
            x="40"
            y="48"
            textAnchor="middle"
            className="font-serif font-bold"
            fontSize="14"
            fill="oklch(0.15 0 0)"
          >
            CURATED
          </text>
        </svg>

        <motion.div
          animate={{
            scale: [1, 1.3, 0],
            opacity: [0.8, 0.5, 0]
          }}
          transition={{
            delay: 0.7,
            duration: 0.5
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 text-champagne-gold" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
