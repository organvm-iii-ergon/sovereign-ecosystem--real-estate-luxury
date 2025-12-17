import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, Volume2, VolumeX, X, CheckCircle, Circle, 
  Play, Pause, SkipForward, RotateCcw, Info
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface VoiceStep {
  id: string
  title: string
  instruction: string
  duration: number
  actionRequired?: string
  tip?: string
}

const voiceSteps: VoiceStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    instruction: 'Welcome to the AR Measurement Tutorial. This voice-guided tutorial will teach you how to take measurements using augmented reality.',
    duration: 8,
    tip: 'You can pause at any time or skip to specific steps'
  },
  {
    id: 'camera-setup',
    title: 'Camera Setup',
    instruction: 'First, tap the AR button to open the camera view. Make sure you grant camera permissions when prompted.',
    duration: 6,
    actionRequired: 'Open AR Camera',
    tip: 'Camera access is required for AR measurements'
  },
  {
    id: 'positioning',
    title: 'Positioning',
    instruction: 'Point your camera at a flat surface or wall. Move your device slowly to help the AR system understand the space.',
    duration: 8,
    actionRequired: 'Position Camera',
    tip: 'Good lighting helps AR detection'
  },
  {
    id: 'measurement-mode',
    title: 'Enable Measurement',
    instruction: 'Tap the ruler icon to enable measurement mode. The interface will update to show measurement tools.',
    duration: 5,
    actionRequired: 'Enable Measurement Mode',
    tip: 'Look for the ruler icon in the top controls'
  },
  {
    id: 'first-point',
    title: 'First Point',
    instruction: 'Tap anywhere on the screen to place your first measurement point. You\'ll see a green dot appear where you tapped.',
    duration: 6,
    actionRequired: 'Tap First Point',
    tip: 'Tap on edges or corners for accurate measurements'
  },
  {
    id: 'second-point',
    title: 'Second Point',
    instruction: 'Now tap a second location to complete the measurement. A line will connect the two points and show the distance.',
    duration: 6,
    actionRequired: 'Tap Second Point',
    tip: 'The distance is shown in feet by default'
  },
  {
    id: 'labels',
    title: 'Add Labels',
    instruction: 'You can add labels to your measurements by tapping the pencil icon next to each measurement in the list below.',
    duration: 6,
    actionRequired: 'Add Label',
    tip: 'Labels help organize multiple measurements'
  },
  {
    id: 'presets',
    title: 'Use Presets',
    instruction: 'Tap the presets button to choose from common measurements like door height, room width, or window dimensions.',
    duration: 7,
    actionRequired: 'Select Preset',
    tip: 'Presets include typical measurement types'
  },
  {
    id: 'room-templates',
    title: 'Room Templates',
    instruction: 'Use room templates to automatically detect and measure kitchens, bedrooms, or bathrooms with spatial recognition.',
    duration: 8,
    actionRequired: 'Apply Room Template',
    tip: 'Templates auto-label common room features'
  },
  {
    id: 'annotations',
    title: 'Add Annotations',
    instruction: 'Tap the annotate button to add photos, voice notes, or text descriptions to any measurement.',
    duration: 6,
    actionRequired: 'Add Annotation',
    tip: 'Annotations help document conditions'
  },
  {
    id: 'offline',
    title: 'Offline Mode',
    instruction: 'All measurements work offline. When you reconnect to the internet, your work will automatically sync.',
    duration: 7,
    tip: 'Perfect for measuring in remote locations'
  },
  {
    id: 'export',
    title: 'Export & Share',
    instruction: 'Use the export button to share your measurements with contractors or save them to your private vault.',
    duration: 6,
    actionRequired: 'Export Measurements',
    tip: 'Collections can be shared with multiple contractors'
  },
  {
    id: 'complete',
    title: 'Tutorial Complete',
    instruction: 'Congratulations! You\'re now ready to use AR measurements. Practice these steps and explore additional features.',
    duration: 6,
    tip: 'Swipe through help cards for more tips'
  }
]

export function VoiceGuidedARTutorial() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [timeInStep, setTimeInStep] = useState(0)
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const currentStep = voiceSteps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / voiceSteps.length) * 100

  useEffect(() => {
    if (isPlaying && !isMuted) {
      speakStep(currentStep)
    }

    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel()
      }
    }
  }, [currentStepIndex, isPlaying, isMuted])

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeInStep(prev => {
          const next = prev + 0.1
          if (next >= currentStep.duration && autoAdvance) {
            handleNext()
            return 0
          }
          return next
        })
      }, 100)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, currentStep, autoAdvance])

  const speakStep = (step: VoiceStep) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(step.instruction)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onend = () => {
        if (!completedSteps.includes(step.id)) {
          setCompletedSteps(prev => [...prev, step.id])
          soundManager.play('success')
        }
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    } else {
      toast.error('Voice guidance not supported', {
        description: 'Your browser does not support text-to-speech'
      })
    }
  }

  const handlePlay = () => {
    setIsPlaying(true)
    soundManager.play('glassTap')
    if (!isMuted) {
      speakStep(currentStep)
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
    window.speechSynthesis.pause()
    soundManager.play('glassTap')
  }

  const handleNext = () => {
    if (currentStepIndex < voiceSteps.length - 1) {
      window.speechSynthesis.cancel()
      setCurrentStepIndex(prev => prev + 1)
      setTimeInStep(0)
      soundManager.play('glassTap')
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      window.speechSynthesis.cancel()
      setCurrentStepIndex(prev => prev - 1)
      setTimeInStep(0)
      soundManager.play('glassTap')
    }
  }

  const handleSkipToStep = (index: number) => {
    window.speechSynthesis.cancel()
    setCurrentStepIndex(index)
    setTimeInStep(0)
    if (isPlaying && !isMuted) {
      speakStep(voiceSteps[index])
    }
    soundManager.play('glassTap')
  }

  const handleRestart = () => {
    window.speechSynthesis.cancel()
    setCurrentStepIndex(0)
    setCompletedSteps([])
    setTimeInStep(0)
    setIsPlaying(true)
    soundManager.play('glassTap')
    toast.success('Tutorial restarted')
  }

  const handleComplete = () => {
    setIsPlaying(false)
    window.speechSynthesis.cancel()
    soundManager.play('success')
    toast.success('Tutorial completed!', {
      description: 'You\'re ready to use AR measurements'
    })
  }

  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel()
    } else if (isPlaying) {
      speakStep(currentStep)
    }
    setIsMuted(!isMuted)
    soundManager.play('glassTap')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const stepProgress = (timeInStep / currentStep.duration) * 100

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) {
        window.speechSynthesis.cancel()
        setIsPlaying(false)
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="gap-2 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
          onClick={() => {
            soundManager.play('glassTap')
            toast.info('Starting voice tutorial...', { description: 'Enable audio for voice guidance' })
          }}
        >
          <Mic className="w-4 h-4" />
          Voice Tutorial
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            Voice-Guided AR Tutorial
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Learn AR measurements with step-by-step voice instructions
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="p-8 bg-gradient-to-br from-rose-blush/10 to-rose-gold/10 dark:from-moonlit-violet/10 dark:to-moonlit-lavender/10 flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center mb-6">
                    <motion.div
                      animate={{
                        scale: isPlaying ? [1, 1.1, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: isPlaying ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                      className="relative"
                    >
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
                        <Mic className="w-12 h-12 text-white" />
                      </div>
                      {isPlaying && !isMuted && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-rose-blush dark:border-moonlit-lavender"
                          animate={{
                            scale: [1, 1.5],
                            opacity: [0.5, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                        />
                      )}
                    </motion.div>
                  </div>

                  <Badge className="mb-4 bg-rose-blush/20 dark:bg-moonlit-lavender/20 text-foreground border-rose-blush/40 dark:border-moonlit-lavender/40">
                    Step {currentStepIndex + 1} of {voiceSteps.length}
                  </Badge>

                  <h3 className="text-3xl font-serif text-foreground mb-4">
                    {currentStep.title}
                  </h3>

                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
                    {currentStep.instruction}
                  </p>

                  {currentStep.actionRequired && (
                    <Badge variant="outline" className="mb-4 text-rose-blush dark:text-moonlit-lavender border-rose-blush dark:border-moonlit-lavender">
                      Action: {currentStep.actionRequired}
                    </Badge>
                  )}

                  {currentStep.tip && (
                    <Card className="max-w-xl mx-auto p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                          <h4 className="text-sm font-semibold text-foreground mb-1">Tip</h4>
                          <p className="text-sm text-muted-foreground">{currentStep.tip}</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>

            <Card className="bg-card/50 backdrop-blur-xl p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={isPlaying ? handlePause : handlePlay}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevious}
                      disabled={currentStepIndex === 0}
                    >
                      <SkipForward className="w-5 h-5 rotate-180" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNext}
                      disabled={currentStepIndex === voiceSteps.length - 1}
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRestart}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="auto-advance" className="text-sm">Auto-advance</Label>
                      <Switch
                        id="auto-advance"
                        checked={autoAdvance}
                        onCheckedChange={setAutoAdvance}
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Step Progress</span>
                    <span>{formatTime(timeInStep)} / {formatTime(currentStep.duration)}</span>
                  </div>
                  <Progress value={stepProgress} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Overall Progress</span>
                    <span>{completedSteps.length} / {voiceSteps.length} completed</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col">
            <Card className="flex-1 bg-card/50 backdrop-blur-xl p-4 overflow-hidden flex flex-col">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                Tutorial Steps
              </h3>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {voiceSteps.map((step, index) => {
                  const isCompleted = completedSteps.includes(step.id)
                  const isCurrent = index === currentStepIndex
                  
                  return (
                    <motion.button
                      key={step.id}
                      onClick={() => handleSkipToStep(index)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-rose-blush/20 to-rose-gold/20 dark:from-moonlit-violet/20 dark:to-moonlit-lavender/20 border-2 border-rose-blush dark:border-moonlit-lavender'
                          : isCompleted
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-muted/30 border border-border hover:bg-muted/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Step {index + 1}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {step.duration}s
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-foreground">
                            {step.title}
                          </h4>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
