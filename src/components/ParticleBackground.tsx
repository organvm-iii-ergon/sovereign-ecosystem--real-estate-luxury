import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/use-theme'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
  isConstellation?: boolean
}

interface ConstellationPattern {
  name: string
  points: { x: number; y: number }[]
  connections: [number, number][]
}

const CONSTELLATIONS: ConstellationPattern[] = [
  {
    name: 'crown',
    points: [
      { x: 0.5, y: 0.2 },
      { x: 0.42, y: 0.25 },
      { x: 0.58, y: 0.25 },
      { x: 0.38, y: 0.3 },
      { x: 0.62, y: 0.3 },
    ],
    connections: [[0, 1], [0, 2], [1, 3], [2, 4]],
  },
  {
    name: 'house',
    points: [
      { x: 0.2, y: 0.5 },
      { x: 0.2, y: 0.7 },
      { x: 0.3, y: 0.7 },
      { x: 0.3, y: 0.5 },
      { x: 0.25, y: 0.45 },
    ],
    connections: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [3, 4]],
  },
  {
    name: 'diamond',
    points: [
      { x: 0.8, y: 0.4 },
      { x: 0.75, y: 0.45 },
      { x: 0.8, y: 0.5 },
      { x: 0.85, y: 0.45 },
    ],
    connections: [[0, 1], [1, 2], [2, 3], [3, 0]],
  },
]

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const constellationParticlesRef = useRef<Map<string, Particle[]>>(new Map())
  const animationFrameRef = useRef<number | undefined>(undefined)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const initializeConstellations = () => {
      const constellationMap = new Map<string, Particle[]>()
      
      CONSTELLATIONS.forEach(constellation => {
        const particles = constellation.points.map(point => ({
          x: point.x * canvas.width,
          y: point.y * canvas.height,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          size: 2.5,
          opacity: 0.5,
          hue: theme === 'dark' ? 280 : 340,
          isConstellation: true,
        }))
        constellationMap.set(constellation.name, particles)
      })
      
      constellationParticlesRef.current = constellationMap
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initializeConstellations()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particleCount = 60
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        hue: theme === 'dark' ? Math.random() * 60 + 200 : Math.random() * 40 + 320,
      })
    }

    particlesRef.current = particles

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 3
        )
        
        if (theme === 'dark') {
          gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 65%, ${particle.opacity})`)
          gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 55%, ${particle.opacity * 0.5})`)
          gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 45%, 0)`)
        } else {
          gradient.addColorStop(0, `hsla(${particle.hue}, 60%, 75%, ${particle.opacity})`)
          gradient.addColorStop(0.5, `hsla(${particle.hue}, 60%, 65%, ${particle.opacity * 0.5})`)
          gradient.addColorStop(1, `hsla(${particle.hue}, 60%, 55%, 0)`)
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
        ctx.fill()
      })

      // Optimized: nested for loops to avoid array allocation (slice) and sqrt calculation
      const thresholdSq = 22500 // 150 * 150
      const len = particles.length

      for (let i = 0; i < len; i++) {
        const p1 = particles[i]
        for (let j = i + 1; j < len; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distSq = dx * dx + dy * dy

          if (distSq < thresholdSq) {
            const distance = Math.sqrt(distSq)
            const opacity = (1 - distance / 150) * 0.08
            ctx.strokeStyle = theme === 'dark' 
              ? `rgba(180, 150, 220, ${opacity})` 
              : `rgba(224, 136, 170, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      CONSTELLATIONS.forEach(constellation => {
        const constellationParticles = constellationParticlesRef.current.get(constellation.name)
        if (!constellationParticles) return

        constellationParticles.forEach((particle, idx) => {
          const originalPoint = constellation.points[idx]
          const targetX = originalPoint.x * canvas.width
          const targetY = originalPoint.y * canvas.height
          
          particle.x += particle.vx + (targetX - particle.x) * 0.02
          particle.y += particle.vy + (targetY - particle.y) * 0.02

          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 4
          )
          
          if (theme === 'dark') {
            gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 70%, ${particle.opacity * 0.9})`)
            gradient.addColorStop(0.5, `hsla(${particle.hue}, 80%, 60%, ${particle.opacity * 0.5})`)
            gradient.addColorStop(1, `hsla(${particle.hue}, 80%, 50%, 0)`)
          } else {
            gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 75%, ${particle.opacity * 0.9})`)
            gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 65%, ${particle.opacity * 0.5})`)
            gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 55%, 0)`)
          }

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2)
          ctx.fill()
        })

        constellation.connections.forEach(([startIdx, endIdx]) => {
          const p1 = constellationParticles[startIdx]
          const p2 = constellationParticles[endIdx]
          if (!p1 || !p2) return

          const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
          
          if (theme === 'dark') {
            gradient.addColorStop(0, `rgba(180, 150, 220, 0.4)`)
            gradient.addColorStop(0.5, `rgba(200, 170, 230, 0.5)`)
            gradient.addColorStop(1, `rgba(180, 150, 220, 0.4)`)
          } else {
            gradient.addColorStop(0, `rgba(224, 136, 170, 0.3)`)
            gradient.addColorStop(0.5, `rgba(234, 156, 190, 0.4)`)
            gradient.addColorStop(1, `rgba(224, 136, 170, 0.3)`)
          }
          
          ctx.strokeStyle = gradient
          ctx.lineWidth = 1.5
          ctx.shadowBlur = 8
          ctx.shadowColor = theme === 'dark' ? 'rgba(180, 150, 220, 0.3)' : 'rgba(224, 136, 170, 0.3)'
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
          ctx.shadowBlur = 0
        })
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: theme === 'dark' ? 'lighten' : 'multiply' }}
      aria-hidden="true"
    />
  )
}
