import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Sliders, MapPin, Home, DollarSign, TrendingUp, ShieldCheck } from 'lucide-react'
import { useKV } from '@github/spark/hooks'
import { UserPreferences, getDefaultPreferences } from '@/lib/recommendation-engine'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { soundManager } from '@/lib/sound-manager'

interface PreferencesDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function PreferencesDialog({ isOpen, onClose }: PreferencesDialogProps) {
  const [preferences, setPreferences] = useKV<UserPreferences>('user-preferences', getDefaultPreferences())
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences || getDefaultPreferences())

  const handleSave = () => {
    setPreferences(localPreferences)
    soundManager.play('glassTap')
    onClose()
  }

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setLocalPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-onyx-deep/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-onyx-surface border border-champagne-gold/30 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
      >
        <div className="bg-gradient-to-r from-champagne-gold/20 to-champagne-gold/10 p-6 border-b border-champagne-gold/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-champagne-gold flex items-center justify-center">
              <Sliders className="w-5 h-5 text-onyx-deep" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-champagne-gold">Preferences</h2>
              <p className="text-slate-grey text-sm">Customize your recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-champagne-gold/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-champagne-gold" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-180px)] custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-champagne-gold font-semibold">
              <DollarSign className="w-5 h-5" />
              <h3>Price Range</h3>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-grey text-sm mb-2">Minimum</Label>
                  <Input
                    type="number"
                    value={localPreferences.priceRange.min}
                    onChange={(e) => updatePreference('priceRange', {
                      ...localPreferences.priceRange,
                      min: parseInt(e.target.value) || 0
                    })}
                    className="bg-onyx-deep border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-slate-grey text-sm mb-2">Maximum</Label>
                  <Input
                    type="number"
                    value={localPreferences.priceRange.max}
                    onChange={(e) => updatePreference('priceRange', {
                      ...localPreferences.priceRange,
                      max: parseInt(e.target.value) || 0
                    })}
                    className="bg-onyx-deep border-border text-foreground"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-grey">
                Current range: ${(localPreferences.priceRange.min / 1000000).toFixed(1)}M - ${(localPreferences.priceRange.max / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-champagne-gold font-semibold">
              <MapPin className="w-5 h-5" />
              <h3>Preferred Locations</h3>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="e.g., Brooklyn, Manhattan"
                value={localPreferences.preferredCities.join(', ')}
                onChange={(e) => updatePreference('preferredCities', 
                  e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                )}
                className="bg-onyx-deep border-border text-foreground"
              />
              <p className="text-xs text-slate-grey">Separate cities with commas</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-champagne-gold font-semibold">
              <Home className="w-5 h-5" />
              <h3>Property Requirements</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-grey text-sm mb-2">Min Bedrooms</Label>
                <div className="space-y-2">
                  <Slider
                    value={[localPreferences.minBedrooms]}
                    onValueChange={(value) => updatePreference('minBedrooms', value[0])}
                    min={1}
                    max={6}
                    step={1}
                    className="py-4"
                  />
                  <p className="text-foreground text-sm font-semibold">{localPreferences.minBedrooms} bedrooms</p>
                </div>
              </div>
              <div>
                <Label className="text-slate-grey text-sm mb-2">Min Bathrooms</Label>
                <div className="space-y-2">
                  <Slider
                    value={[localPreferences.minBathrooms]}
                    onValueChange={(value) => updatePreference('minBathrooms', value[0])}
                    min={1}
                    max={6}
                    step={0.5}
                    className="py-4"
                  />
                  <p className="text-foreground text-sm font-semibold">{localPreferences.minBathrooms} bathrooms</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-champagne-gold font-semibold">
              <TrendingUp className="w-5 h-5" />
              <h3>Investment Goals</h3>
            </div>
            <Select
              value={localPreferences.investmentGoals}
              onValueChange={(value) => updatePreference('investmentGoals', value as UserPreferences['investmentGoals'])}
            >
              <SelectTrigger className="bg-onyx-deep border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash-flow">Cash Flow (Monthly Income)</SelectItem>
                <SelectItem value="appreciation">Appreciation (Long-term Growth)</SelectItem>
                <SelectItem value="balanced">Balanced (Both)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-champagne-gold font-semibold">
              <ShieldCheck className="w-5 h-5" />
              <h3>Risk Tolerance</h3>
            </div>
            <Select
              value={localPreferences.riskTolerance}
              onValueChange={(value) => updatePreference('riskTolerance', value as UserPreferences['riskTolerance'])}
            >
              <SelectTrigger className="bg-onyx-deep border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative (Low Risk)</SelectItem>
                <SelectItem value="moderate">Moderate (Balanced)</SelectItem>
                <SelectItem value="aggressive">Aggressive (High Growth)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-onyx-deep/50 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border text-foreground hover:bg-onyx-surface"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-champagne-gold text-onyx-deep hover:bg-champagne-gold/90"
          >
            Save Preferences
          </Button>
        </div>
      </motion.div>

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
    </motion.div>
  )
}
