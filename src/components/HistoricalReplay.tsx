import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, SkipBack, SkipForward, History, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { useMarketTickers } from '@/hooks/use-market-data'
import { marketDataService, MarketTicker } from '@/lib/market-data'
import { soundManager } from '@/lib/sound-manager'
import * as d3 from 'd3'

interface HistoricalSnapshot {
  timestamp: number
  tickers: MarketTicker[]
  volatilityLevel: number
}

interface TimeRange {
  label: string
  duration: number
}

const timeRanges: TimeRange[] = [
  { label: '1 Min', duration: 60 * 1000 },
  { label: '5 Min', duration: 5 * 60 * 1000 },
  { label: '15 Min', duration: 15 * 60 * 1000 },
  { label: '30 Min', duration: 30 * 60 * 1000 },
  { label: '1 Hour', duration: 60 * 60 * 1000 }
]

export function HistoricalReplay() {
  const currentTickers = useMarketTickers()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRecording, setIsRecording] = useState(true)
  const [isReplaying, setIsReplaying] = useState(false)
  const [history, setHistory] = useState<HistoricalSnapshot[]>([])
  const [replayIndex, setReplayIndex] = useState(0)
  const [replaySpeed, setReplaySpeed] = useState(1)
  const [selectedRange, setSelectedRange] = useState(1)
  const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState<number | null>(null)
  const replayIntervalRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!isRecording || isReplaying) return

    const config = marketDataService.getConfig()
    const snapshot: HistoricalSnapshot = {
      timestamp: Date.now(),
      tickers: currentTickers.map(t => ({ ...t })),
      volatilityLevel: config.volatility
    }

    setHistory(prev => {
      const maxAge = timeRanges[selectedRange].duration
      const cutoff = Date.now() - maxAge
      const filtered = prev.filter(s => s.timestamp > cutoff)
      return [...filtered, snapshot]
    })
  }, [currentTickers, isRecording, isReplaying, selectedRange])

  useEffect(() => {
    if (!isReplaying || history.length === 0) return

    const interval = 100 / replaySpeed

    replayIntervalRef.current = window.setInterval(() => {
      setReplayIndex(prev => {
        if (prev >= history.length - 1) {
          stopReplay()
          return prev
        }
        return prev + 1
      })
    }, interval)

    return () => {
      if (replayIntervalRef.current) {
        clearInterval(replayIntervalRef.current)
      }
    }
  }, [isReplaying, replaySpeed, history.length])

  useEffect(() => {
    if (history.length === 0 || !svgRef.current) return

    renderChart()
  }, [history, selectedSnapshotIndex])

  const renderChart = () => {
    if (!svgRef.current || history.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 30, left: 50 }
    const width = 600 - margin.left - margin.right
    const height = 200 - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3
      .scaleTime()
      .domain([history[0].timestamp, history[history.length - 1].timestamp])
      .range([0, width])

    const allValues = history.flatMap(h => h.tickers.map(t => t.value))
    const yScale = d3
      .scaleLinear()
      .domain([d3.min(allValues) || 80, d3.max(allValues) || 120])
      .nice()
      .range([height, 0])

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => {
        const date = new Date(d as number)
        return `${date.getMinutes()}:${date.getSeconds().toString().padStart(2, '0')}`
      }))
      .attr('color', '#708090')
      .selectAll('text')
      .style('font-size', '10px')

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#708090')
      .selectAll('text')
      .style('font-size', '10px')

    const tickerSymbols = history[0].tickers.map(t => t.symbol)
    const colors = ['#F7E7CE', '#10B981', '#EF4444', '#3B82F6']

    tickerSymbols.forEach((symbol, idx) => {
      const line = d3
        .line<HistoricalSnapshot>()
        .x(d => xScale(d.timestamp))
        .y(d => {
          const ticker = d.tickers.find(t => t.symbol === symbol)
          return yScale(ticker?.value || 100)
        })
        .curve(d3.curveMonotoneX)

      g.append('path')
        .datum(history)
        .attr('fill', 'none')
        .attr('stroke', colors[idx % colors.length])
        .attr('stroke-width', 2)
        .attr('d', line)
        .style('opacity', 0.8)

      g.selectAll(`.dot-${symbol}`)
        .data(history)
        .enter()
        .append('circle')
        .attr('class', `dot-${symbol}`)
        .attr('cx', d => xScale(d.timestamp))
        .attr('cy', d => {
          const ticker = d.tickers.find(t => t.symbol === symbol)
          return yScale(ticker?.value || 100)
        })
        .attr('r', (d, i) => i === selectedSnapshotIndex ? 6 : 0)
        .attr('fill', colors[idx % colors.length])
        .attr('stroke', '#0F0F0F')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          const index = history.indexOf(d)
          setSelectedSnapshotIndex(index)
          setReplayIndex(index)
          soundManager.play('glassTap')
        })

      g.append('text')
        .attr('x', width - 10)
        .attr('y', yScale(history[history.length - 1].tickers.find(t => t.symbol === symbol)?.value || 100))
        .attr('dy', '.35em')
        .attr('text-anchor', 'end')
        .attr('fill', colors[idx % colors.length])
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .text(symbol)
    })

    if (selectedSnapshotIndex !== null && selectedSnapshotIndex < history.length) {
      const snapshot = history[selectedSnapshotIndex]
      g.append('line')
        .attr('x1', xScale(snapshot.timestamp))
        .attr('x2', xScale(snapshot.timestamp))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#F7E7CE')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .style('opacity', 0.5)
    }
  }

  const startReplay = () => {
    if (history.length === 0) return
    setIsReplaying(true)
    setIsRecording(false)
    setReplayIndex(0)
    soundManager.play('glassTap')
  }

  const stopReplay = () => {
    setIsReplaying(false)
    if (replayIntervalRef.current) {
      clearInterval(replayIntervalRef.current)
      replayIntervalRef.current = null
    }
  }

  const toggleReplay = () => {
    if (isReplaying) {
      stopReplay()
    } else {
      setIsReplaying(true)
      setIsRecording(false)
    }
    soundManager.play('glassTap')
  }

  const resetReplay = () => {
    stopReplay()
    setReplayIndex(0)
    setSelectedSnapshotIndex(null)
    setIsRecording(true)
    soundManager.play('glassTap')
  }

  const skipBackward = () => {
    setReplayIndex(prev => Math.max(0, prev - 10))
    soundManager.play('glassTap')
  }

  const skipForward = () => {
    setReplayIndex(prev => Math.min(history.length - 1, prev + 10))
    soundManager.play('glassTap')
  }

  const clearHistory = () => {
    setHistory([])
    setReplayIndex(0)
    setSelectedSnapshotIndex(null)
    setIsRecording(true)
    setIsReplaying(false)
    soundManager.play('glassTap')
  }

  const currentSnapshot = history[replayIndex] || (history.length > 0 ? history[history.length - 1] : null)
  const recordingDuration = history.length > 0 
    ? (history[history.length - 1].timestamp - history[0].timestamp) / 1000 
    : 0

  return (
    <motion.div
      className="fixed bottom-24 left-6 z-40"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <Button
              onClick={() => {
                setIsExpanded(true)
                soundManager.play('glassTap')
              }}
              className="w-14 h-14 rounded-full bg-onyx-surface border-2 border-champagne-gold hover:bg-onyx-surface hover:border-champagne-gold/80 shadow-lg relative"
              size="icon"
            >
              <History className="w-6 h-6 text-champagne-gold" />
              {isRecording && (
                <motion.div
                  className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0.8, opacity: 0, x: -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.8, opacity: 0, x: -20 }}
          >
            <Card className="bg-onyx-surface border-champagne-gold/30 p-6 w-[650px] shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-champagne-gold/10 flex items-center justify-center relative">
                    <History className="w-5 h-5 text-champagne-gold" />
                    {isRecording && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-onyx-surface"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-champagne-gold">Historical Replay</h3>
                    <p className="text-xs text-slate-grey">
                      {isRecording ? 'Recording...' : isReplaying ? 'Replaying...' : 'Paused'}
                      {history.length > 0 && ` • ${history.length} snapshots`}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setIsExpanded(false)
                    soundManager.play('glassTap')
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-slate-grey hover:text-champagne-gold"
                >
                  <ChevronDown className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="bg-onyx-deep rounded-lg p-4 border border-border">
                  <svg
                    ref={svgRef}
                    width="600"
                    height="200"
                    className="w-full"
                    style={{ overflow: 'visible' }}
                  />
                  {history.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-slate-grey text-sm">Waiting for market data...</p>
                    </div>
                  )}
                </div>

                {currentSnapshot && (
                  <motion.div
                    className="grid grid-cols-4 gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {currentSnapshot.tickers.map((ticker) => (
                      <div
                        key={ticker.symbol}
                        className="bg-onyx-deep rounded-lg p-3 border border-border"
                      >
                        <p className="text-xs text-slate-grey mb-1">{ticker.symbol}</p>
                        <p className="text-lg font-bold text-champagne-gold">
                          {ticker.value.toFixed(2)}
                        </p>
                        <p
                          className={`text-xs font-semibold ${
                            ticker.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {ticker.changePercent >= 0 ? '+' : ''}
                          {ticker.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}

                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">Time Range</span>
                    <span className="text-xs text-slate-grey">
                      {recordingDuration.toFixed(0)}s recorded
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {timeRanges.map((range, idx) => (
                      <Button
                        key={range.label}
                        onClick={() => {
                          setSelectedRange(idx)
                          soundManager.play('glassTap')
                        }}
                        variant={selectedRange === idx ? 'default' : 'outline'}
                        size="sm"
                        className={
                          selectedRange === idx
                            ? 'bg-champagne-gold text-onyx-deep hover:bg-champagne-gold/90'
                            : 'border-border hover:border-champagne-gold/50'
                        }
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {history.length > 0 && (
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-foreground">Playback</span>
                      <span className="text-xs text-champagne-gold bg-champagne-gold/10 px-2 py-1 rounded">
                        {replayIndex + 1} / {history.length}
                      </span>
                    </div>
                    <Slider
                      value={[replayIndex]}
                      onValueChange={(value) => {
                        setReplayIndex(value[0])
                        setSelectedSnapshotIndex(value[0])
                        soundManager.play('glassTap')
                      }}
                      min={0}
                      max={history.length - 1}
                      step={1}
                      className="w-full mb-4"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={skipBackward}
                          size="icon"
                          variant="outline"
                          className="border-border hover:border-champagne-gold/50"
                          disabled={replayIndex === 0}
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={toggleReplay}
                          size="icon"
                          className="bg-champagne-gold hover:bg-champagne-gold/90 text-onyx-deep"
                        >
                          {isReplaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={skipForward}
                          size="icon"
                          variant="outline"
                          className="border-border hover:border-champagne-gold/50"
                          disabled={replayIndex >= history.length - 1}
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={resetReplay}
                          size="icon"
                          variant="outline"
                          className="border-border hover:border-champagne-gold/50"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-grey">Speed:</span>
                          <div className="flex gap-1">
                            {[0.5, 1, 2, 5].map((speed) => (
                              <Button
                                key={speed}
                                onClick={() => {
                                  setReplaySpeed(speed)
                                  soundManager.play('glassTap')
                                }}
                                size="sm"
                                variant={replaySpeed === speed ? 'default' : 'ghost'}
                                className={
                                  replaySpeed === speed
                                    ? 'bg-champagne-gold text-onyx-deep hover:bg-champagne-gold/90 h-7 px-2'
                                    : 'text-slate-grey hover:text-champagne-gold h-7 px-2'
                                }
                              >
                                {speed}x
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-6 flex gap-2">
                  <Button
                    onClick={clearHistory}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50"
                    disabled={history.length === 0}
                  >
                    Clear History
                  </Button>
                  {currentSnapshot && (
                    <div className="flex-1 bg-onyx-deep/50 rounded-lg px-3 py-2 border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-grey">Volatility</span>
                        <span className="text-xs font-bold text-champagne-gold">
                          {(currentSnapshot.volatilityLevel * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
