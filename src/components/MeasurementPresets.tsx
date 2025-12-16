import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { MeasurementPreset } from '@/lib/types'
import { 
  Ruler, Plus, X, Trash2, Edit2, Check, Maximize2, Move, 
  DoorOpen, ArrowUpDown, Square, CircleDot, Package, Sparkles
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface MeasurementPresetsProps {
  onSelectPreset: (preset: MeasurementPreset) => void
}

const defaultPresets: MeasurementPreset[] = [
  {
    id: 'room-width',
    name: 'Room Width',
    description: 'Measure the width of a room',
    defaultLength: 12,
    icon: 'ArrowUpDown',
    createdAt: new Date().toISOString()
  },
  {
    id: 'room-length',
    name: 'Room Length',
    description: 'Measure the length of a room',
    defaultLength: 15,
    icon: 'Move',
    createdAt: new Date().toISOString()
  },
  {
    id: 'door-height',
    name: 'Door Height',
    description: 'Standard door height measurement',
    defaultLength: 7,
    icon: 'DoorOpen',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ceiling-height',
    name: 'Ceiling Height',
    description: 'Measure floor to ceiling',
    defaultLength: 9,
    icon: 'Maximize2',
    createdAt: new Date().toISOString()
  },
  {
    id: 'wall-length',
    name: 'Wall Length',
    description: 'Measure along a wall',
    defaultLength: 10,
    icon: 'Move',
    createdAt: new Date().toISOString()
  },
  {
    id: 'window-width',
    name: 'Window Width',
    description: 'Standard window width',
    defaultLength: 4,
    icon: 'Square',
    createdAt: new Date().toISOString()
  }
]

const iconMap: Record<string, any> = {
  ArrowUpDown,
  Move,
  DoorOpen,
  Maximize2,
  Square,
  CircleDot,
  Package,
  Ruler
}

export function MeasurementPresets({ onSelectPreset }: MeasurementPresetsProps) {
  const [customPresets, setCustomPresets] = useKV<MeasurementPreset[]>('measurement-presets', [])
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [newPreset, setNewPreset] = useState<Partial<MeasurementPreset>>({
    name: '',
    description: '',
    icon: 'Ruler'
  })

  const allPresets = [...defaultPresets, ...(customPresets || [])]

  const createPreset = () => {
    if (!newPreset.name || newPreset.name.trim() === '') {
      toast.error('Please enter a preset name')
      return
    }

    const preset: MeasurementPreset = {
      id: `custom-${Date.now()}`,
      name: newPreset.name.trim(),
      description: newPreset.description?.trim(),
      defaultLength: newPreset.defaultLength,
      icon: newPreset.icon || 'Ruler',
      createdAt: new Date().toISOString()
    }

    setCustomPresets(current => [...(current || []), preset])
    soundManager.play('success')
    toast.success('Measurement preset created')
    
    setNewPreset({
      name: '',
      description: '',
      icon: 'Ruler'
    })
    setIsCreating(false)
  }

  const deletePreset = (id: string) => {
    setCustomPresets(current => (current || []).filter(p => p.id !== id))
    soundManager.play('glassTap')
    toast.success('Preset deleted')
  }

  const handleSelectPreset = (preset: MeasurementPreset) => {
    onSelectPreset(preset)
    soundManager.play('glassTap')
    setIsOpen(false)
    toast.success(`Using "${preset.name}" preset`)
  }

  const IconComponent = (iconName: string) => {
    const Icon = iconMap[iconName] || Ruler
    return <Icon className="w-4 h-4" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => soundManager.play('glassTap')}
        >
          <Ruler className="w-4 h-4" />
          Presets
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <Ruler className="w-5 h-5 text-white" />
            </div>
            Measurement Presets
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Quick access to common measurements for faster AR measuring
          </p>
        </DialogHeader>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {defaultPresets.length} Built-in
            </Badge>
            <Badge variant="outline" className="text-sm">
              {(customPresets || []).length} Custom
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
            New Preset
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
                      <h3 className="font-semibold text-foreground">Create Custom Preset</h3>
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
                      <label className="text-xs font-medium text-muted-foreground">
                        Preset Name *
                      </label>
                      <Input
                        placeholder="e.g., Closet Width, Bathroom Length"
                        value={newPreset.name}
                        onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Description
                      </label>
                      <Input
                        placeholder="What is this measurement for?"
                        value={newPreset.description}
                        onChange={(e) => setNewPreset({ ...newPreset, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Default Length (feet)
                      </label>
                      <Input
                        type="number"
                        placeholder="Optional"
                        value={newPreset.defaultLength || ''}
                        onChange={(e) => setNewPreset({ 
                          ...newPreset, 
                          defaultLength: e.target.value ? parseFloat(e.target.value) : undefined 
                        })}
                      />
                    </div>

                    <Button
                      onClick={createPreset}
                      className="w-full bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Create Preset
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            <div className="space-y-6">
              {defaultPresets.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Built-in Presets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {defaultPresets.map((preset, index) => (
                      <motion.div
                        key={preset.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <button
                          onClick={() => handleSelectPreset(preset)}
                          className="w-full text-left"
                        >
                          <Card className="p-4 hover:bg-muted/30 transition-all duration-300 hover:shadow-lg hover:shadow-rose-blush/10 dark:hover:shadow-moonlit-lavender/10 hover:scale-[1.02] cursor-pointer border-border/40">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-blush/20 to-rose-gold/20 dark:from-moonlit-violet/20 dark:to-moonlit-lavender/20 flex items-center justify-center flex-shrink-0">
                                {IconComponent(preset.icon || 'Ruler')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground mb-1">{preset.name}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {preset.description}
                                </p>
                                {preset.defaultLength && (
                                  <Badge variant="secondary" className="mt-2 text-xs">
                                    ~{preset.defaultLength} ft
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {(customPresets || []).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Custom Presets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(customPresets || []).map((preset, index) => (
                      <motion.div
                        key={preset.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <Card className="p-4 hover:bg-muted/30 transition-all duration-300 border-border/40 relative group">
                          <button
                            onClick={() => handleSelectPreset(preset)}
                            className="w-full text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-blush/20 to-rose-gold/20 dark:from-moonlit-violet/20 dark:to-moonlit-lavender/20 flex items-center justify-center flex-shrink-0">
                                {IconComponent(preset.icon || 'Ruler')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground mb-1">{preset.name}</h4>
                                {preset.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {preset.description}
                                  </p>
                                )}
                                {preset.defaultLength && (
                                  <Badge variant="secondary" className="mt-2 text-xs">
                                    ~{preset.defaultLength} ft
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              deletePreset(preset.id)
                            }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
