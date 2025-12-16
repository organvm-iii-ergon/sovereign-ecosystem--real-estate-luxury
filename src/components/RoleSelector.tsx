import { motion } from 'framer-motion'
import { Shield, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { UserRole } from '@/lib/types'

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-onyx-deep flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-16">
          <motion.h1 
            className="text-6xl font-bold text-champagne-gold mb-4 tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            The Sovereign Ecosystem
          </motion.h1>
          <motion.p 
            className="text-slate-grey text-lg tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Select Your Experience
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <button
              onClick={() => onSelectRole('agent')}
              className="w-full bg-onyx-surface border-2 border-border hover:border-champagne-gold p-12 rounded-lg transition-all duration-300 group hover:shadow-2xl hover:shadow-champagne-gold/20"
            >
              <Shield className="w-16 h-16 text-champagne-gold mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h2 className="text-3xl font-bold text-champagne-gold mb-4">Portfolio Shield</h2>
              <p className="text-slate-grey leading-relaxed">
                Agent dashboard with compliance monitoring, risk analytics, and portfolio intelligence
              </p>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <button
              onClick={() => onSelectRole('client')}
              className="w-full bg-onyx-surface border-2 border-border hover:border-champagne-gold p-12 rounded-lg transition-all duration-300 group hover:shadow-2xl hover:shadow-champagne-gold/20"
            >
              <Sparkles className="w-16 h-16 text-champagne-gold mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h2 className="text-3xl font-bold text-champagne-gold mb-4">Client Experience</h2>
              <p className="text-slate-grey leading-relaxed">
                Exclusive access to curated properties with zero-UI browsing and AI concierge
              </p>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
