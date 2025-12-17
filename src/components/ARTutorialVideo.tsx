import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, SkipForward, RotateCcw, X, 
  Volume2, VolumeX, Maximize2, Minimize2,
  CheckCircle, Circle
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Slider } from './ui/slider'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface TutorialStep {
  id: string
  title: string
  description: string
  duration: number
  timestamp: number
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'intro',
    title: 'Introduction to AR Measurement',
    description: 'Learn about offline AR measurement capabilities and how to use them in the field',
    duration: 15,
    timestamp: 0
  },
  {
    id: 'offline-mode',
    title: 'Enable Offline Mode',
    description: 'Activate airplane mode or disconnect from WiFi to work offline',
    duration: 20,
    timestamp: 15
  },
  {
    id: 'camera-access',
    title: 'Camera Access & AR View',
    description: 'Grant camera permissions and initialize AR property viewer',
    duration: 25,
    timestamp: 35
  },
  {
    id: 'measurement-tool',
    title: 'Using Measurement Tools',
    description: 'Tap two points to measure distances, add labels, and annotations',
    duration: 30,
    timestamp: 60
  },
  {
    id: 'room-templates',
    title: 'Apply Room Templates',
    description: 'Use spatial recognition to auto-detect room types and dimensions',
    duration: 25,
    timestamp: 90
  },
  {
    id: 'annotations',
    title: 'Add Photos & Voice Notes',
    description: 'Document measurements with photos, voice recordings, and text notes',
    duration: 35,
    timestamp: 115
  },
  {
    id: 'collection',
    title: 'Create Contractor Collection',
    description: 'Organize measurements into collections for contractor sharing',
    duration: 30,
    timestamp: 150
  },
  {
    id: 'sync',
    title: 'Automatic Sync',
    description: 'Reconnect to internet and watch measurements automatically sync',
    duration: 20,
    timestamp: 180
  }
]

export function ARTutorialVideo() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(200)
  const [volume, setVolume] = useState(0.8)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.1
          if (next >= duration) {
            handlePause()
            return duration
          }
          return next
        })
      }, 100)
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isPlaying, duration])

  useEffect(() => {
    const currentStep = tutorialSteps.findIndex((step, index) => {
      const nextStep = tutorialSteps[index + 1]
      return currentTime >= step.timestamp && (!nextStep || currentTime < nextStep.timestamp)
    })
    
    if (currentStep !== -1 && currentStep !== currentStepIndex) {
      setCurrentStepIndex(currentStep)
      const step = tutorialSteps[currentStep]
      if (!completedSteps.includes(step.id)) {
        setCompletedSteps(prev => [...prev, step.id])
        soundManager.play('success')
      }
    }
  }, [currentTime, currentStepIndex, completedSteps])

  const handlePlay = () => {
    setIsPlaying(true)
    soundManager.play('glassTap')
  }

  const handlePause = () => {
    setIsPlaying(false)
    soundManager.play('glassTap')
  }

  const handleRestart = () => {
    setCurrentTime(0)
    setIsPlaying(true)
    setCompletedSteps([])
    soundManager.play('glassTap')
    toast.success('Tutorial restarted')
  }

  const handleSkipToStep = (step: TutorialStep) => {
    setCurrentTime(step.timestamp)
    setIsPlaying(true)
    soundManager.play('glassTap')
  }

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    soundManager.play('glassTap')
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    soundManager.play('glassTap')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (currentTime / duration) * 100
  const currentStep = tutorialSteps[currentStepIndex]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="gap-2 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
          onClick={() => {
            soundManager.play('glassTap')
            toast.info('Loading tutorial...', { description: 'Learn offline AR workflow' })
          }}
        >
          <Play className="w-4 h-4" />
          Video Tutorial
        </Button>
      </DialogTrigger>

      <DialogContent className={`${isFullscreen ? 'max-w-full h-full' : 'max-w-6xl'} overflow-hidden flex flex-col bg-black/95 backdrop-blur-2xl border-rose-blush/20 dark:border-moonlit-lavender/20`}>
        <DialogHeader className={isFullscreen ? 'hidden' : ''}>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            AR Measurement Tutorial
          </DialogTitle>
          <p className="text-sm text-white/70 mt-2">
            Learn how to use offline AR measurements and collaboration features
          </p>
        </DialogHeader>

        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          <div className="flex-1 flex flex-col bg-black rounded-lg overflow-hidden">
            <div className="relative flex-1 bg-gradient-to-br from-rose-blush/10 to-rose-gold/10 dark:from-moonlit-violet/10 dark:to-moonlit-lavender/10 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: isPlaying ? [1, 1.02, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: isPlaying ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-center p-8">
                  <motion.div
                    animate={{
                      rotate: isPlaying ? 360 : 0,
                    }}
                    transition={{
                      duration: 3,
                      repeat: isPlaying ? Infinity : 0,
                      ease: "linear"
                    }}
                    className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center"
                  >
                    <Play className="w-16 h-16 text-white" />
                  </motion.div>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-2xl font-serif text-white mb-3">
                        {currentStep.title}
                      </h3>
                      <p className="text-white/70 text-lg max-w-2xl mx-auto">
                        {currentStep.description}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-8 flex items-center justify-center gap-4">
                    <Badge className="bg-rose-blush/20 dark:bg-moonlit-lavender/20 text-white border-rose-blush/40 dark:border-moonlit-lavender/40">
                      Step {currentStepIndex + 1} of {tutorialSteps.length}
                    </Badge>
                    <Badge className="bg-rose-blush/20 dark:bg-moonlit-lavender/20 text-white border-rose-blush/40 dark:border-moonlit-lavender/40">
                      {completedSteps.length} Completed
                    </Badge>
                  </div>
                </div>
              </motion.div>

              {!isPlaying && currentTime === 0 && (
                <motion.button
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-12 h-12 text-white ml-2" />
                  </div>
                </motion.button>
              )}
            </div>

            <Card className="bg-black/50 backdrop-blur-xl border-rose-blush/20 dark:border-moonlit-lavender/20 p-4 rounded-t-none">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={isPlaying ? handlePause : handlePlay}
                    className="text-white hover:bg-white/10"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRestart}
                    className="text-white hover:bg-white/10"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>

                  <div className="flex-1">
                    <Slider
                      value={[currentTime]}
                      onValueChange={handleSeek}
                      min={0}
                      max={duration}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <span className="text-sm text-white/70 font-mono min-w-[80px] text-right">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/10"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>

                    <div className="w-24">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={([v]) => {
                          setVolume(v)
                          if (v > 0) setIsMuted(false)
                        }}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/10"
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </Button>
                </div>

                <Progress value={progress} className="h-1" />
              </div>
            </Card>
          </div>

          <div className="w-full md:w-80 flex flex-col">
            <Card className="flex-1 bg-card/50 backdrop-blur-xl border-rose-blush/20 dark:border-moonlit-lavender/20 p-4 overflow-hidden flex flex-col">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                Tutorial Steps
              </h3>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {tutorialSteps.map((step, index) => {
                  const isCompleted = completedSteps.includes(step.id)
                  const isCurrent = index === currentStepIndex
                  
                  return (
                    <motion.button
                      key={step.id}
                      onClick={() => handleSkipToStep(step)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-rose-blush/20 to-rose-gold/20 dark:from-moonlit-violet/20 dark:to-moonlit-lavender/20 border-2 border-rose-blush dark:border-moonlit-lavender'
                          : isCompleted
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-white/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-white/50">
                              Step {index + 1}
                            </span>
                            <span className="text-xs text-white/40">
                              {step.duration}s
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white mb-1">
                            {step.title}
                          </h4>
                          <p className="text-xs text-white/60 line-clamp-2">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold">
                    {Math.round((completedSteps.length / tutorialSteps.length) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(completedSteps.length / tutorialSteps.length) * 100} 
                  className="h-2"
                />
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
