import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { Property, PriceAlert } from '@/lib/types'
import { 
  Bell, BellOff, Plus, X, Trash2, Edit2, Check, DollarSign, 
  Home, Droplet, MapPin, AlertCircle, TrendingDown, Sparkles
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Slider } from './ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Switch } from './ui/switch'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface PriceAlertsProps {
  properties: Property[]
}

export function PriceAlerts({ properties }: PriceAlertsProps) {
  const [alerts, setAlerts] = useKV<PriceAlert[]>('price-alerts', [])
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const maxPrice = Math.max(...properties.map(p => p.price), 10000000)
  const minPrice = Math.min(...properties.map(p => p.price), 0)

  const [newAlert, setNewAlert] = useState<Partial<PriceAlert>>({
    minPrice: minPrice,
    maxPrice: maxPrice,
    enabled: true
  })

  const uniqueLocations = Array.from(new Set(
    properties.map(p => `${p.city}, ${p.state}`)
  )).sort()

  useEffect(() => {
    checkAlerts()
  }, [properties, alerts])

  const checkAlerts = () => {
    if (!alerts) return

    const now = new Date().toISOString()
    let hasNewMatches = false

    const updatedAlerts = alerts.map(alert => {
      if (!alert.enabled) return alert

      const matchingProperties = properties.filter(property => {
        const inPriceRange = property.price >= alert.minPrice && property.price <= alert.maxPrice
        const matchesBedrooms = !alert.bedrooms || property.bedrooms === alert.bedrooms
        const matchesBathrooms = !alert.bathrooms || property.bathrooms === alert.bathrooms
        const matchesLocation = !alert.location || 
          alert.location === 'all' ||
          `${property.city}, ${property.state}` === alert.location

        return inPriceRange && matchesBedrooms && matchesBathrooms && matchesLocation
      })

      const newMatchIds = matchingProperties.map(p => p.id)
      const previousMatches = alert.matchedProperties || []
      
      const hasNewProperty = newMatchIds.some(id => !previousMatches.includes(id))

      if (hasNewProperty && matchingProperties.length > 0) {
        const timeSinceLastNotified = alert.lastNotified 
          ? (Date.now() - new Date(alert.lastNotified).getTime()) / 1000 / 60 
          : Infinity

        if (timeSinceLastNotified > 5) {
          hasNewMatches = true
          soundManager.play('success')
          
          const newProperties = matchingProperties.filter(p => !previousMatches.includes(p.id))
          
          toast.success(
            `Price Alert: ${newProperties.length} new ${newProperties.length === 1 ? 'property' : 'properties'} match your criteria`,
            {
              description: `$${alert.minPrice.toLocaleString()} - $${alert.maxPrice.toLocaleString()}`,
              duration: 8000,
              action: {
                label: 'View',
                onClick: () => setIsOpen(true)
              }
            }
          )

          return {
            ...alert,
            lastNotified: now,
            matchedProperties: newMatchIds
          }
        }
      }

      return {
        ...alert,
        matchedProperties: newMatchIds
      }
    })

    if (hasNewMatches) {
      setAlerts(updatedAlerts)
      setUnreadCount(prev => prev + 1)
    }
  }

  const createAlert = () => {
    if (!newAlert.minPrice || !newAlert.maxPrice) {
      toast.error('Please set a valid price range')
      return
    }

    if (newAlert.minPrice >= newAlert.maxPrice) {
      toast.error('Minimum price must be less than maximum price')
      return
    }

    const alert: PriceAlert = {
      id: Date.now().toString(),
      minPrice: newAlert.minPrice,
      maxPrice: newAlert.maxPrice,
      bedrooms: newAlert.bedrooms,
      bathrooms: newAlert.bathrooms,
      location: newAlert.location,
      enabled: true,
      createdAt: new Date().toISOString()
    }

    setAlerts(current => [...(current || []), alert])
    soundManager.play('success')
    toast.success('Price alert created')
    
    setNewAlert({
      minPrice: minPrice,
      maxPrice: maxPrice,
      enabled: true
    })
    setIsCreating(false)
  }

  const deleteAlert = (id: string) => {
    setAlerts(current => (current || []).filter(a => a.id !== id))
    soundManager.play('glassTap')
    toast.success('Alert deleted')
  }

  const toggleAlert = (id: string) => {
    setAlerts(current => 
      (current || []).map(a => 
        a.id === id ? { ...a, enabled: !a.enabled } : a
      )
    )
    soundManager.play('glassTap')
  }

  const getMatchingProperties = (alert: PriceAlert) => {
    return properties.filter(property => {
      const inPriceRange = property.price >= alert.minPrice && property.price <= alert.maxPrice
      const matchesBedrooms = !alert.bedrooms || property.bedrooms === alert.bedrooms
      const matchesBathrooms = !alert.bathrooms || property.bathrooms === alert.bathrooms
      const matchesLocation = !alert.location || 
        alert.location === 'all' ||
        `${property.city}, ${property.state}` === alert.location

      return inPriceRange && matchesBedrooms && matchesBathrooms && matchesLocation
    })
  }

  const activeAlerts = (alerts || []).filter(a => a.enabled)
  const hasAlerts = (alerts || []).length > 0

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => {
            soundManager.play('glassTap')
            setUnreadCount(0)
          }}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
            >
              <span className="text-white text-xs font-semibold">{unreadCount}</span>
            </motion.div>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Price Alerts
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Get notified when properties drop below your filtered price range
          </p>
        </DialogHeader>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {activeAlerts.length} Active
            </Badge>
            <Badge variant="outline" className="text-sm">
              {(alerts || []).length - activeAlerts.length} Paused
            </Badge>
          </div>
          <Button
            onClick={() => {
              setIsCreating(true)
              soundManager.play('glassTap')
            }}
            size="sm"
            className="bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Alert
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1 -mx-6 px-6">
          <AnimatePresence mode="popLayout">
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 mb-4 bg-muted/30 border-2 border-dashed border-rose-blush/30 dark:border-moonlit-lavender/30">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Create Price Alert</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsCreating(false)
                          soundManager.play('glassTap')
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Price Range
                        </span>
                        <span className="text-foreground font-semibold">
                          ${(newAlert.minPrice || 0).toLocaleString()} - ${(newAlert.maxPrice || 0).toLocaleString()}
                        </span>
                      </label>
                      <Slider
                        value={[newAlert.minPrice || 0, newAlert.maxPrice || 0]}
                        onValueChange={(value) => setNewAlert({ 
                          ...newAlert, 
                          minPrice: value[0], 
                          maxPrice: value[1] 
                        })}
                        min={minPrice}
                        max={maxPrice}
                        step={50000}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          Bedrooms
                        </label>
                        <Select
                          value={newAlert.bedrooms?.toString() || 'all'}
                          onValueChange={(value) => {
                            soundManager.play('glassTap')
                            setNewAlert({ 
                              ...newAlert, 
                              bedrooms: value === 'all' ? undefined : parseInt(value) 
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            {Array.from(new Set(properties.map(p => p.bedrooms))).sort((a, b) => a - b).map(beds => (
                              <SelectItem key={beds} value={beds.toString()}>
                                {beds} {beds === 1 ? 'bed' : 'beds'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                          <Droplet className="w-4 h-4" />
                          Bathrooms
                        </label>
                        <Select
                          value={newAlert.bathrooms?.toString() || 'all'}
                          onValueChange={(value) => {
                            soundManager.play('glassTap')
                            setNewAlert({ 
                              ...newAlert, 
                              bathrooms: value === 'all' ? undefined : parseInt(value) 
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            {Array.from(new Set(properties.map(p => p.bathrooms))).sort((a, b) => a - b).map(baths => (
                              <SelectItem key={baths} value={baths.toString()}>
                                {baths} {baths === 1 ? 'bath' : 'baths'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </label>
                      <Select
                        value={newAlert.location || 'all'}
                        onValueChange={(value) => {
                          soundManager.play('glassTap')
                          setNewAlert({ 
                            ...newAlert, 
                            location: value === 'all' ? undefined : value 
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All locations</SelectItem>
                          {uniqueLocations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={createAlert}
                      className="w-full bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Create Alert
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {hasAlerts ? (
              <div className="space-y-3">
                {(alerts || []).map((alert, index) => {
                  const matchingProperties = getMatchingProperties(alert)
                  const hasMatches = matchingProperties.length > 0

                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className={`p-4 transition-all duration-300 ${
                        alert.enabled 
                          ? 'bg-card border-border/40' 
                          : 'bg-muted/20 opacity-60'
                      }`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={alert.enabled}
                                onCheckedChange={() => toggleAlert(alert.id)}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <DollarSign className="w-4 h-4 text-rose-blush dark:text-moonlit-lavender" />
                                  <span className="font-semibold text-foreground">
                                    ${alert.minPrice.toLocaleString()} - ${alert.maxPrice.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  {alert.bedrooms && (
                                    <Badge variant="secondary" className="text-xs">
                                      {alert.bedrooms} bed
                                    </Badge>
                                  )}
                                  {alert.bathrooms && (
                                    <Badge variant="secondary" className="text-xs">
                                      {alert.bathrooms} bath
                                    </Badge>
                                  )}
                                  {alert.location && alert.location !== 'all' && (
                                    <Badge variant="secondary" className="text-xs">
                                      {alert.location}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {hasMatches && alert.enabled && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="pl-11"
                              >
                                <div className="flex items-center gap-2 text-sm">
                                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    {matchingProperties.length} {matchingProperties.length === 1 ? 'property matches' : 'properties match'}
                                  </span>
                                </div>
                                <div className="mt-2 space-y-1">
                                  {matchingProperties.slice(0, 3).map(property => (
                                    <div key={property.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Sparkles className="w-3 h-3" />
                                      <span className="truncate">{property.title} - ${property.price.toLocaleString()}</span>
                                    </div>
                                  ))}
                                  {matchingProperties.length > 3 && (
                                    <span className="text-xs text-muted-foreground pl-5">
                                      +{matchingProperties.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAlert(alert.id)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <BellOff className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">No price alerts yet</p>
                <p className="text-sm text-muted-foreground/70 mb-4">
                  Create alerts to get notified when properties match your criteria
                </p>
                <Button
                  onClick={() => {
                    setIsCreating(true)
                    soundManager.play('glassTap')
                  }}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Alert
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
