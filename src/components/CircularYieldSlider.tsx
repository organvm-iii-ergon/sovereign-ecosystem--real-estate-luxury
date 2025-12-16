import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Property } from '@/lib/types'
import { X } from 'lucide-react'
import { soundManager } from '@/lib/sound-manager'

interface CircularYieldSliderProps {
  property: Property
  onClose: () => void
}

export function CircularYieldSlider({ property, onClose }: CircularYieldSliderProps) {
  const baseRent = property.currentRent || 3000
  const [projectedRent, setProjectedRent] = useState(baseRent)
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<SVGSVGElement>(null)

  const minRent = baseRent * 0.8
  const maxRent = baseRent * 1.5

  const calculateYield = (rent: number) => {
    const annualRent = rent * 12
    const yield_ = (annualRent / property.price) * 100
    return yield_.toFixed(2)
  }

  const calculateROI = (rent: number) => {
    const annualRent = rent * 12
    const expenses = annualRent * 0.3
    const netIncome = annualRent - expenses
    const roi = (netIncome / property.price) * 100
    return roi.toFixed(2)
  }

  const handleDrag = (event: MouseEvent | TouchEvent) => {
    if (!isDragging || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

    const angle = Math.atan2(clientY - centerY, clientX - centerX)
    let degrees = angle * (180 / Math.PI) + 90

    if (degrees < 0) degrees += 360

    const percentage = degrees / 360
    const newRent = minRent + (maxRent - minRent) * percentage

    setProjectedRent(Math.round(newRent))
  }

  const handleMouseDown = () => {
    setIsDragging(true)
    soundManager.play('glassTap')
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const percentage = (projectedRent - minRent) / (maxRent - minRent)
  const angle = percentage * 360
  const radius = 120
  const strokeWidth = 24
  const circumference = 2 * Math.PI * radius

  return (
    <div
      className="w-full max-w-md"
      onMouseMove={handleDrag as any}
      onMouseUp={handleMouseUp}
      onTouchMove={handleDrag as any}
      onTouchEnd={handleMouseUp}
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-champagne-gold">Yield Calculator</h3>
        <button
          onClick={onClose}
          className="text-slate-grey hover:text-champagne-gold transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative flex items-center justify-center mb-8">
        <svg
          ref={sliderRef}
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id="champagneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.93 0.05 85)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="oklch(0.93 0.05 85)" stopOpacity="1" />
            </linearGradient>
          </defs>

          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="oklch(0.30 0 0)"
            strokeWidth={strokeWidth}
          />

          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="url(#champagneGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * percentage)}
            strokeLinecap="round"
            className="transition-all duration-100"
          />

          <g
            transform={`rotate(${angle} 160 160)`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            className="cursor-grab active:cursor-grabbing"
          >
            <circle
              cx="160"
              cy={160 - radius}
              r="16"
              fill="oklch(0.93 0.05 85)"
              stroke="oklch(0.15 0 0)"
              strokeWidth="3"
              className="drop-shadow-lg"
            />
          </g>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-slate-grey text-sm uppercase tracking-wider mb-2">Net Yield</p>
          <p className="text-6xl font-bold text-champagne-gold mb-2">
            {calculateYield(projectedRent)}%
          </p>
          <p className="text-slate-grey text-sm">
            ${projectedRent.toLocaleString()}/mo
          </p>
        </div>
      </div>

      <div className="space-y-4 bg-onyx-surface rounded-lg p-6 border border-border">
        <div className="flex justify-between items-center">
          <span className="text-slate-grey uppercase tracking-wide text-sm">Monthly Rent</span>
          <span className="text-foreground font-semibold text-lg">
            ${projectedRent.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-grey uppercase tracking-wide text-sm">Annual Income</span>
          <span className="text-foreground font-semibold text-lg">
            ${(projectedRent * 12).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-grey uppercase tracking-wide text-sm">Cap Rate</span>
          <span className="text-champagne-gold font-semibold text-lg">
            {calculateYield(projectedRent)}%
          </span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <span className="text-slate-grey uppercase tracking-wide text-sm">Est. Net ROI</span>
          <span className="text-champagne-gold font-bold text-xl">
            {calculateROI(projectedRent)}%
          </span>
        </div>
      </div>

      <p className="text-slate-grey text-xs text-center mt-6">
        Drag the handle to adjust projected rental income
      </p>
    </div>
  )
}
