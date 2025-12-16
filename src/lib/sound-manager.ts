class SoundManager {
  private sounds: Map<string, HTMLAudioElement>
  private enabled: boolean = true

  constructor() {
    this.sounds = new Map()
    this.initSounds()
  }

  private initSounds() {
    const soundEffects = {
      glassTap: this.createBeep(800, 0.1, 'sine'),
      heavyThud: this.createBeep(120, 0.3, 'triangle'),
      stamp: this.createBeep(200, 0.2, 'square'),
      unlock: this.createSequence([
        { freq: 400, duration: 0.1 },
        { freq: 600, duration: 0.1 },
        { freq: 800, duration: 0.2 }
      ])
    }

    Object.entries(soundEffects).forEach(([name, audio]) => {
      this.sounds.set(name, audio)
    })
  }

  private createBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): HTMLAudioElement {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    const audioElement = new Audio()
    
    const playSound = () => {
      const newContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const newOsc = newContext.createOscillator()
      const newGain = newContext.createGain()
      
      newOsc.connect(newGain)
      newGain.connect(newContext.destination)
      
      newOsc.frequency.value = frequency
      newOsc.type = type
      
      newGain.gain.setValueAtTime(0.3, newContext.currentTime)
      newGain.gain.exponentialRampToValueAtTime(0.01, newContext.currentTime + duration)
      
      newOsc.start()
      newOsc.stop(newContext.currentTime + duration)
    }

    audioElement.addEventListener('play', playSound)
    
    return audioElement
  }

  private createSequence(notes: { freq: number; duration: number }[]): HTMLAudioElement {
    const audioElement = new Audio()
    
    const playSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      let startTime = audioContext.currentTime

      notes.forEach(note => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = note.freq
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + note.duration)

        startTime += note.duration
      })
    }

    audioElement.addEventListener('play', playSound)
    
    return audioElement
  }

  play(soundName: string) {
    if (!this.enabled) return
    
    const sound = this.sounds.get(soundName)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(() => {})
    }
  }

  toggle() {
    this.enabled = !this.enabled
    return this.enabled
  }

  isEnabled() {
    return this.enabled
  }
}

export const soundManager = new SoundManager()
