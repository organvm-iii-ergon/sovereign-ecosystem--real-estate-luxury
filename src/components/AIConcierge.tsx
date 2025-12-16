import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Home, DollarSign, Settings } from 'lucide-react'
import { soundManager } from '@/lib/sound-manager'
import { useKV } from '@github/spark/hooks'
import { Property } from '@/lib/types'
import { ConciergeInsight, generateConciergeInsights, getDefaultPreferences, UserPreferences } from '@/lib/recommendation-engine'
import { PreferencesDialog } from './PreferencesDialog'

interface AIConciergeProps {
  properties: Property[]
  userPortfolio?: Property[]
}

export function AIConcierge({ properties, userPortfolio = [] }: AIConciergeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [preferences] = useKV<UserPreferences>('user-preferences', getDefaultPreferences())
  const [insights, setInsights] = useState<ConciergeInsight[]>([])
  const [hasNewInsights, setHasNewInsights] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  useEffect(() => {
    if (properties.length > 0 && preferences) {
      const newInsights = generateConciergeInsights(properties, userPortfolio, preferences)
      setInsights(newInsights)
      if (newInsights.length > 0 && !isOpen) {
        setHasNewInsights(true)
      }
    }
  }, [properties, userPortfolio, preferences])

  const toggleConcierge = () => {
    soundManager.play('glassTap')
    setIsOpen(!isOpen)
    if (!isOpen) {
      setHasNewInsights(false)
    }
  }

  const getInsightIcon = (type: ConciergeInsight['type']) => {
    switch (type) {
      case 'recommendation':
        return Home
      case 'alert':
        return AlertTriangle
      case 'opportunity':
        return TrendingUp
      case 'advice':
        return Lightbulb
      default:
        return Sparkles
    }
  }

  const getUrgencyColor = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high':
        return 'text-champagne-gold'
      case 'medium':
        return 'text-amber-400'
      case 'low':
        return 'text-slate-grey'
    }
  }

  const getUrgencyBadge = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high':
        return 'bg-champagne-gold/20 text-champagne-gold border-champagne-gold/30'
      case 'medium':
        return 'bg-amber-400/20 text-amber-400 border-amber-400/30'
      case 'low':
        return 'bg-slate-grey/20 text-slate-grey border-slate-grey/30'
    }
  }

  return (
    <>
      <motion.button
        onClick={toggleConcierge}
        className="fixed bottom-8 right-8 w-16 h-16 bg-champagne-gold rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {hasNewInsights && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            {insights.length}
          </motion.div>
        )}
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
            className="fixed bottom-28 right-8 w-[420px] max-w-[calc(100vw-4rem)] bg-onyx-surface border border-champagne-gold/30 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-champagne-gold/20 to-champagne-gold/10 p-6 border-b border-champagne-gold/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-champagne-gold flex items-center justify-center"
                    animate={{ 
                      boxShadow: [
                        '0 0 0 0 rgba(247, 231, 206, 0.4)',
                        '0 0 0 10px rgba(247, 231, 206, 0)',
                        '0 0 0 0 rgba(247, 231, 206, 0)'
                      ]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-onyx-deep" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-champagne-gold">AI Concierge</h3>
                    <p className="text-slate-grey text-sm">
                      {insights.length} personalized insights
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundManager.play('glassTap')
                    setShowPreferences(true)
                  }}
                  className="w-8 h-8 rounded-full hover:bg-champagne-gold/20 flex items-center justify-center transition-colors"
                  title="Customize preferences"
                >
                  <Settings className="w-5 h-5 text-champagne-gold" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {insights.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-slate-grey mx-auto mb-4" />
                  <p className="text-slate-grey text-sm">
                    No insights available yet. Browse properties to get personalized recommendations.
                  </p>
                </div>
              ) : (
                insights.map((insight, index) => {
                  const Icon = getInsightIcon(insight.type)
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-onyx-deep rounded-lg p-4 border border-border hover:border-champagne-gold/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getUrgencyBadge(insight.urgency)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-foreground font-semibold text-sm">
                              {insight.title}
                            </h4>
                            <span className={`text-xs font-medium px-2 py-1 rounded border ${getUrgencyBadge(insight.urgency)}`}>
                              {insight.urgency}
                            </span>
                          </div>
                          <p className="text-slate-grey text-sm leading-relaxed mb-3">
                            {insight.message}
                          </p>
                          
                          {insight.property && (
                            <div className="bg-onyx-surface rounded p-3 mb-3 space-y-1">
                              <p className="text-foreground font-medium text-sm">
                                {insight.property.title}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-slate-grey">
                                <span className="flex items-center gap-1">
                                  <Home className="w-3 h-3" />
                                  {insight.property.bedrooms} bed, {insight.property.bathrooms} bath
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  ${(insight.property.price / 1000000).toFixed(2)}M
                                </span>
                              </div>
                              {insight.metadata?.reasons && (
                                <div className="mt-2 pt-2 border-t border-border">
                                  <p className="text-xs text-champagne-gold font-medium mb-1">
                                    Why this matches:
                                  </p>
                                  <ul className="space-y-1">
                                    {insight.metadata.reasons.slice(0, 2).map((reason: string, i: number) => (
                                      <li key={i} className="text-xs text-slate-grey flex items-start gap-1">
                                        <span className="text-champagne-gold">•</span>
                                        <span>{reason}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {insight.actionLabel && (
                            <button 
                              onClick={() => soundManager.play('glassTap')}
                              className="text-champagne-gold text-sm font-semibold hover:underline flex items-center gap-1 group"
                            >
                              {insight.actionLabel}
                              <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            <div className="p-4 border-t border-border bg-onyx-deep/50">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="w-full bg-onyx-deep border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-slate-grey focus:outline-none focus:border-champagne-gold transition-colors"
                onFocus={() => soundManager.play('glassTap')}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PreferencesDialog 
        isOpen={showPreferences} 
        onClose={() => setShowPreferences(false)} 
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(247, 231, 206, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(247, 231, 206, 0.5);
        }
      `}</style>
    </>
  )
}
