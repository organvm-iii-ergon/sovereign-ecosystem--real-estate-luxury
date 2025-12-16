import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Sparkles } from 'lucide-react'
import { soundManager } from '@/lib/sound-manager'

export function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleConcierge = () => {
    soundManager.play('glassTap')
    setIsOpen(!isOpen)
  }

  return (
    <>
      <motion.button
        onClick={toggleConcierge}
        className="fixed bottom-8 right-8 w-16 h-16 bg-champagne-gold rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-onyx-deep" />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6 text-onyx-deep" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-28 right-8 w-96 bg-onyx-surface border border-champagne-gold/30 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-champagne-gold/20 to-champagne-gold/10 p-6 border-b border-champagne-gold/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-champagne-gold flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-onyx-deep" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-champagne-gold">AI Concierge</h3>
                  <p className="text-slate-grey text-sm">Your personal property advisor</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-onyx-deep rounded-lg p-4 border border-border"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-champagne-gold shrink-0 mt-1" />
                  <div>
                    <p className="text-foreground text-sm leading-relaxed mb-3">
                      A brownstone matching your art collection criteria has just become available off-market.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-grey">
                        <span className="text-champagne-gold font-semibold">Location:</span> Brooklyn Heights
                      </p>
                      <p className="text-slate-grey">
                        <span className="text-champagne-gold font-semibold">Price:</span> $4.2M
                      </p>
                      <p className="text-slate-grey">
                        <span className="text-champagne-gold font-semibold">Features:</span> 12ft ceilings, gallery wall space
                      </p>
                    </div>
                    <button className="mt-4 text-champagne-gold text-sm font-semibold hover:underline">
                      View Details →
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-onyx-deep rounded-lg p-4 border border-border"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-champagne-gold shrink-0 mt-1" />
                  <div>
                    <p className="text-foreground text-sm leading-relaxed">
                      Based on your portfolio, consider refinancing your Tribeca property. Current rates could save you $2,400/month.
                    </p>
                    <button className="mt-3 text-champagne-gold text-sm font-semibold hover:underline">
                      Calculate Savings →
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-onyx-deep rounded-lg p-4 border border-border"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-champagne-gold shrink-0 mt-1" />
                  <div>
                    <p className="text-foreground text-sm leading-relaxed">
                      Your lease at 432 Park Avenue expires in 60 days. Would you like me to schedule viewings for similar properties?
                    </p>
                    <div className="flex gap-3 mt-3">
                      <button className="text-champagne-gold text-sm font-semibold hover:underline">
                        Yes, please
                      </button>
                      <button className="text-slate-grey text-sm hover:text-foreground">
                        Not now
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="p-4 border-t border-border bg-onyx-deep/50">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="w-full bg-onyx-deep border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-slate-grey focus:outline-none focus:border-champagne-gold"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
