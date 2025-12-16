import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, X, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Home, DollarSign, 
  Settings, Send, Loader2, Search, BarChart, GitCompare, Heart, MapPin, Clock,
  ChevronDown, ChevronUp, FileText, Calculator, Maximize2, Users
} from 'lucide-react'
import { soundManager } from '@/lib/sound-manager'
import { useKV } from '@github/spark/hooks'
import { Property, ConversationMessage } from '@/lib/types'
import { ConciergeInsight, generateConciergeInsights, getDefaultPreferences, UserPreferences } from '@/lib/recommendation-engine'
import { PreferencesDialog } from './PreferencesDialog'
import { aiConciergeService } from '@/lib/ai-concierge-service'
import { toast } from 'sonner'

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
  
  const [conversationHistory, setConversationHistory] = useKV<ConversationMessage[]>('concierge-conversation', [])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [quickActions, setQuickActions] = useState<Array<{ label: string; action: string; icon: string }>>([])
  const [activeTab, setActiveTab] = useState<'insights' | 'chat'>('insights')
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null)
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const safePreferences = preferences || getDefaultPreferences()
  const safeConversationHistory = conversationHistory || []

  useEffect(() => {
    if (properties.length > 0 && safePreferences) {
      const newInsights = generateConciergeInsights(properties, userPortfolio, safePreferences)
      setInsights(newInsights)
      if (newInsights.length > 0 && !isOpen) {
        setHasNewInsights(true)
      }
    }
  }, [properties, userPortfolio, preferences, isOpen, safePreferences])

  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversationHistory, activeTab])

  useEffect(() => {
    if (properties.length > 0 && safePreferences) {
      aiConciergeService.generateQuickActions(properties, userPortfolio, safePreferences).then(setQuickActions)
    }
  }, [properties, userPortfolio, preferences, safePreferences])

  const toggleConcierge = () => {
    soundManager.play('glassTap')
    setIsOpen(!isOpen)
    if (!isOpen) {
      setHasNewInsights(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return

    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setConversationHistory(prev => [...(prev || []), userMessage])
    setInputValue('')
    setIsProcessing(true)
    setShowQuickActions(false)
    soundManager.play('glassTap')

    try {
      const analysis = await aiConciergeService.analyzeQuery(inputValue, {
        properties,
        userPreferences: safePreferences,
        conversationHistory: safeConversationHistory
      })

      let assistantResponse = ''
      let relatedProperties: Property[] = []

      switch (analysis.intent) {
        case 'property-search': {
          const searchResult = await aiConciergeService.searchProperties(
            inputValue,
            properties,
            safePreferences
          )
          assistantResponse = searchResult.explanation
          relatedProperties = searchResult.properties
          break
        }

        case 'comparison': {
          const propertyIds = (conversationHistory || [])
            .filter(m => m.properties && m.properties.length > 0)
            .flatMap(m => m.properties || [])
            .map(p => p.id)
            .slice(-4)

          if (propertyIds.length >= 2) {
            const comparison = await aiConciergeService.compareProperties(propertyIds, properties)
            assistantResponse = comparison.recommendation
            relatedProperties = comparison.properties
          } else {
            assistantResponse = "I'd be happy to compare properties for you! Please tell me which properties you'd like to compare, or I can suggest some based on your preferences."
          }
          break
        }

        case 'market-analysis': {
          const location = analysis.entities.location?.[0]
          const marketAnalysis = await aiConciergeService.generateMarketAnalysis(properties, location)
          assistantResponse = `${marketAnalysis.summary}\n\n**Key Trends:**\n${marketAnalysis.trends.map(t => `• ${t}`).join('\n')}\n\n**Opportunities:**\n${marketAnalysis.opportunities.map(o => `• ${o}`).join('\n')}`
          break
        }

        case 'portfolio-health': {
          if (userPortfolio.length === 0) {
            assistantResponse = "You don't have any properties in your portfolio yet. Once you start building your portfolio, I can provide comprehensive health assessments and recommendations."
          } else {
            const health = await aiConciergeService.analyzePortfolioHealth(userPortfolio)
            assistantResponse = `Your portfolio has an overall health score of ${health.overallScore}/100.\n\n**Strengths:**\n${health.strengths.map(s => `✓ ${s}`).join('\n')}\n\n**Recommendations:**\n${health.recommendations.slice(0, 3).map(r => `→ ${r}`).join('\n')}`
          }
          break
        }

        case 'investment-advice':
        case 'financial-calculation':
        case 'general-question':
        default: {
          assistantResponse = await aiConciergeService.answerQuestion(inputValue, {
            properties,
            portfolio: userPortfolio,
            preferences: safePreferences,
            conversationHistory: safeConversationHistory
          })
          break
        }
      }

      const assistantMessage: ConversationMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date(),
        properties: relatedProperties.length > 0 ? relatedProperties : undefined,
        metadata: {
          intent: analysis.intent,
          confidence: analysis.confidence,
          suggestedActions: analysis.suggestedActions
        }
      }

      setConversationHistory(prev => [...(prev || []), assistantMessage])
    } catch (error) {
      toast.error('Failed to process your request. Please try again.')
      console.error('Concierge error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    soundManager.play('glassTap')
    
    if (action.startsWith('search:')) {
      const query = action.replace('search:', '').replace(/_/g, ' ')
      setInputValue(query)
      setActiveTab('chat')
      inputRef.current?.focus()
    } else if (action.startsWith('analyze:')) {
      const type = action.replace('analyze:', '')
      if (type === 'portfolio') {
        setInputValue('Analyze my portfolio health')
      } else if (type === 'market') {
        setInputValue('Give me a market overview')
      }
      setActiveTab('chat')
      setTimeout(() => handleSendMessage(), 100)
    } else if (action.startsWith('compare:')) {
      setInputValue('Compare the top properties')
      setActiveTab('chat')
      setTimeout(() => handleSendMessage(), 100)
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

  const getActionIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      'search': Search,
      'map-pin': MapPin,
      'trending-up': TrendingUp,
      'heart': Heart,
      'alert-triangle': AlertTriangle,
      'bar-chart': BarChart,
      'git-compare': GitCompare
    }
    return icons[iconName] || Sparkles
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
            className="fixed bottom-28 right-8 w-[520px] max-w-[calc(100vw-4rem)] bg-onyx-surface border border-champagne-gold/30 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[700px]"
          >
            <div className="bg-gradient-to-r from-champagne-gold/20 to-champagne-gold/10 p-6 border-b border-champagne-gold/30 flex-shrink-0">
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
                      {activeTab === 'insights' ? `${insights.length} insights` : `${(conversationHistory || []).length} messages`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundManager.play('glassTap')
                      setActiveTab(activeTab === 'insights' ? 'chat' : 'insights')
                    }}
                    className="px-3 py-1 rounded-lg hover:bg-champagne-gold/20 flex items-center gap-2 transition-colors text-sm text-champagne-gold"
                  >
                    {activeTab === 'insights' ? (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-4 h-4" />
                        Insights
                      </>
                    )}
                  </button>
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
            </div>

            {activeTab === 'insights' ? (
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
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
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                  {(conversationHistory || []).length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-slate-grey mx-auto mb-4" />
                      <p className="text-slate-grey text-sm mb-6">
                        Ask me anything about properties, markets, or your portfolio
                      </p>
                      
                      {showQuickActions && quickActions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-champagne-gold font-medium uppercase tracking-wide mb-3">
                            Quick Actions
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {quickActions.map((action, i) => {
                              const Icon = getActionIcon(action.icon)
                              return (
                                <motion.button
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  onClick={() => handleQuickAction(action.action)}
                                  className="p-3 bg-onyx-deep border border-border hover:border-champagne-gold rounded-lg text-left transition-colors group"
                                >
                                  <Icon className="w-4 h-4 text-champagne-gold mb-2" />
                                  <p className="text-xs text-foreground group-hover:text-champagne-gold transition-colors">
                                    {action.label}
                                  </p>
                                </motion.button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    (conversationHistory || []).map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-champagne-gold text-onyx-deep' : 'bg-onyx-deep text-foreground'} rounded-lg p-4 space-y-2`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                          
                          {message.properties && message.properties.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.properties.map(property => (
                                <div 
                                  key={property.id}
                                  className="bg-onyx-surface rounded p-2 space-y-1 border border-border"
                                >
                                  <p className="text-xs font-medium text-champagne-gold">
                                    {property.title}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-slate-grey">
                                    <span>{property.city}</span>
                                    <span>${(property.price / 1000000).toFixed(2)}M</span>
                                    <span>{property.bedrooms}BR/{property.bathrooms}BA</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {message.metadata?.suggestedActions && message.metadata.suggestedActions.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <button
                                onClick={() => {
                                  setExpandedMessage(expandedMessage === message.id ? null : message.id)
                                  soundManager.play('glassTap')
                                }}
                                className="flex items-center gap-1 text-xs text-champagne-gold hover:underline"
                              >
                                Suggested Actions
                                {expandedMessage === message.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                              {expandedMessage === message.id && (
                                <div className="mt-2 space-y-1">
                                  {message.metadata.suggestedActions.map((action, i) => (
                                    <button
                                      key={i}
                                      onClick={() => {
                                        setInputValue(action)
                                        soundManager.play('glassTap')
                                      }}
                                      className="block w-full text-left text-xs text-slate-grey hover:text-champagne-gold transition-colors px-2 py-1 rounded hover:bg-onyx-deep"
                                    >
                                      → {action}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <p className="text-xs opacity-50 pt-1">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                  
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-onyx-deep rounded-lg p-4 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-champagne-gold animate-spin" />
                        <span className="text-sm text-slate-grey">Thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}

            <div className="p-4 border-t border-border bg-onyx-deep/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything..."
                  disabled={isProcessing}
                  className="flex-1 bg-onyx-deep border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-slate-grey focus:outline-none focus:border-champagne-gold transition-colors disabled:opacity-50"
                  onFocus={() => soundManager.play('glassTap')}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isProcessing}
                  className="w-10 h-10 bg-champagne-gold rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-onyx-deep" />
                </button>
              </div>
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
