import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { ComparisonHistory, Property } from '@/lib/types'
import { 
  History, ArrowLeftRight, Trash2, Share2, ExternalLink, Clock, 
  Image as ImageIcon, Copy, Check, Sparkles
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface ComparisonHistoryViewerProps {
  properties: Property[]
  onRevisit: (comparisonIds: string[]) => void
}

export function ComparisonHistoryViewer({ properties, onRevisit }: ComparisonHistoryViewerProps) {
  const [history, setHistory] = useKV<ComparisonHistory[]>('comparison-history', [])
  const [isOpen, setIsOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const deleteComparison = (id: string) => {
    setHistory(current => (current || []).filter(h => h.id !== id))
    soundManager.play('glassTap')
    toast.success('Comparison deleted from history')
  }

  const shareComparison = async (comparison: ComparisonHistory) => {
    const shareUrl = comparison.shareableLink || generateShareableLink(comparison)
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedId(comparison.id)
      soundManager.play('success')
      toast.success('Shareable link copied to clipboard')
      
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const generateShareableLink = (comparison: ComparisonHistory): string => {
    const baseUrl = window.location.origin
    const params = new URLSearchParams({
      compare: comparison.propertyIds.join(','),
      id: comparison.id
    })
    return `${baseUrl}?${params.toString()}`
  }

  const revisitComparison = (comparison: ComparisonHistory) => {
    const validPropertyIds = comparison.propertyIds.filter(id => 
      properties.some(p => p.id === id)
    )

    if (validPropertyIds.length < comparison.propertyIds.length) {
      toast.warning('Some properties are no longer available')
    }

    if (validPropertyIds.length < 2) {
      toast.error('Not enough properties available to revisit this comparison')
      return
    }

    onRevisit(validPropertyIds)
    soundManager.play('success')
    setIsOpen(false)
  }

  const getPropertiesForComparison = (comparison: ComparisonHistory) => {
    return comparison.propertyIds
      .map(id => properties.find(p => p.id === id))
      .filter((p): p is Property => p !== undefined)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const sortedHistory = [...(history || [])].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => soundManager.play('glassTap')}
        >
          <History className="w-4 h-4" />
          History
          {(history || []).length > 0 && (
            <Badge className="bg-rose-blush dark:bg-moonlit-lavender text-white px-1.5 py-0 text-xs min-w-[20px]">
              {(history || []).length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            Comparison History
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Revisit and reshare your previous property comparisons
          </p>
        </DialogHeader>

        <div className="flex items-center justify-between py-4">
          <Badge variant="secondary" className="text-sm">
            {sortedHistory.length} {sortedHistory.length === 1 ? 'Comparison' : 'Comparisons'}
          </Badge>
        </div>

        <Separator />

        <ScrollArea className="flex-1 -mx-6 px-6">
          {sortedHistory.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {sortedHistory.map((comparison, index) => {
                  const comparisonProperties = getPropertiesForComparison(comparison)
                  const isValid = comparisonProperties.length >= 2

                  return (
                    <motion.div
                      key={comparison.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className={`p-5 transition-all duration-300 ${
                        isValid 
                          ? 'hover:shadow-lg hover:shadow-rose-blush/10 dark:hover:shadow-moonlit-lavender/10' 
                          : 'opacity-60'
                      }`}>
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h3 className="font-serif font-semibold text-lg text-foreground mb-1 flex items-center gap-2">
                                  {comparison.title}
                                  {comparison.snapshotUrl && (
                                    <ImageIcon className="w-4 h-4 text-rose-blush dark:text-moonlit-lavender" />
                                  )}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(comparison.createdAt)}</span>
                                  <span>•</span>
                                  <ArrowLeftRight className="w-3 h-3" />
                                  <span>{comparison.propertyIds.length} properties</span>
                                </div>
                              </div>

                              {!isValid && (
                                <Badge variant="destructive" className="text-xs">
                                  Unavailable
                                </Badge>
                              )}
                            </div>

                            {comparisonProperties.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {comparisonProperties.map(property => (
                                  <div 
                                    key={property.id}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/40"
                                  >
                                    <img 
                                      src={property.imageUrl} 
                                      alt={property.title}
                                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-foreground truncate">
                                        {property.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        ${property.price.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {comparisonProperties.length < comparison.propertyIds.length && (
                              <p className="text-xs text-muted-foreground italic">
                                {comparison.propertyIds.length - comparisonProperties.length} properties no longer available
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revisitComparison(comparison)}
                              disabled={!isValid}
                              className="gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Revisit
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => shareComparison(comparison)}
                              className="gap-2"
                            >
                              {copiedId === comparison.id ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Share2 className="w-4 h-4" />
                                  Share
                                </>
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteComparison(comparison.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {comparison.snapshotUrl && (
                          <div className="mt-4 rounded-lg overflow-hidden border border-border/40">
                            <img 
                              src={comparison.snapshotUrl} 
                              alt="Comparison snapshot"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">No comparison history yet</p>
              <p className="text-sm text-muted-foreground/70 mb-4">
                Your property comparisons will appear here for easy revisiting
              </p>
            </motion.div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export function saveComparisonToHistory(
  propertyIds: string[],
  title: string,
  snapshotUrl?: string
): ComparisonHistory {
  const comparison: ComparisonHistory = {
    id: `comparison-${Date.now()}`,
    propertyIds,
    title,
    snapshotUrl,
    createdAt: new Date().toISOString(),
    shareableLink: undefined
  }

  return comparison
}
