import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon,
  Target, Clock, Award, Zap, Filter, Download, Maximize2
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { Progress } from './ui/progress'
import { ChartExportDialog } from './ChartExportDialog'
import { useKV } from '@github/spark/hooks'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface TestSession {
  id: string
  startTime: string
  endTime: string
  completedModules: string[]
  totalTests: number
  passedTests: number
  failedTests: number
  duration: number
  userName: string
  userAvatar?: string
  teamId?: string
}

interface TeamComparisonData {
  teamId: string
  teamName: string
  totalMembers: number
  totalSessions: number
  averageSuccessRate: number
  averageDuration: number
  totalModulesCompleted: number
  totalTestsRun: number
  topPerformer: string
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
  color: string
}

interface TimeSeriesData {
  date: string
  [key: string]: string | number
}

export function TeamComparisonView() {
  const [isOpen, setIsOpen] = useState(false)
  const [testSessions] = useKV<TestSession[]>('test-sessions-history', [])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')
  const [chartType, setChartType] = useState<'bar' | 'line' | 'radar'>('bar')

  const teamColors = {
    alpha: 'oklch(0.65 0.15 340)',
    beta: 'oklch(0.65 0.15 260)',
    gamma: 'oklch(0.65 0.15 120)',
    delta: 'oklch(0.65 0.15 40)',
    epsilon: 'oklch(0.65 0.15 180)'
  }

  const allTeams = useMemo(() => {
    if (!testSessions) return []
    const teamSet = new Set<string>()
    testSessions.forEach(session => {
      if (session.teamId) teamSet.add(session.teamId)
    })
    return Array.from(teamSet)
  }, [testSessions])

  const teamComparisonData = useMemo((): TeamComparisonData[] => {
    if (!testSessions) return []

    const teamsToCompare = selectedTeams.length > 0 ? selectedTeams : allTeams.slice(0, 3)

    return teamsToCompare.map(teamId => {
      const teamSessions = testSessions.filter(s => s.teamId === teamId)
      
      const totalMembers = new Set(teamSessions.map(s => s.userName)).size
      const totalTestsRun = teamSessions.reduce((sum, s) => sum + s.totalTests, 0)
      const totalPassed = teamSessions.reduce((sum, s) => sum + s.passedTests, 0)
      const averageSuccessRate = totalTestsRun > 0 ? (totalPassed / totalTestsRun) * 100 : 0
      const averageDuration = teamSessions.length > 0
        ? teamSessions.reduce((sum, s) => sum + s.duration, 0) / teamSessions.length
        : 0
      
      const allModules = new Set<string>()
      teamSessions.forEach(s => s.completedModules.forEach(m => allModules.add(m)))

      const memberScores = new Map<string, number>()
      teamSessions.forEach(s => {
        const score = s.totalTests > 0 ? (s.passedTests / s.totalTests) * 100 : 0
        const current = memberScores.get(s.userName) || 0
        memberScores.set(s.userName, Math.max(current, score))
      })
      
      let topPerformer = 'N/A'
      let topScore = 0
      memberScores.forEach((score, name) => {
        if (score > topScore) {
          topScore = score
          topPerformer = name
        }
      })

      const recentSessions = teamSessions.slice(-10)
      const olderSessions = teamSessions.slice(-20, -10)
      const recentAvg = recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + (s.passedTests / (s.totalTests || 1)) * 100, 0) / recentSessions.length
        : 0
      const olderAvg = olderSessions.length > 0
        ? olderSessions.reduce((sum, s) => sum + (s.passedTests / (s.totalTests || 1)) * 100, 0) / olderSessions.length
        : recentAvg

      let trend: 'up' | 'down' | 'stable' = 'stable'
      let trendPercent = 0
      
      if (olderAvg > 0) {
        const diff = recentAvg - olderAvg
        trendPercent = (diff / olderAvg) * 100
        if (Math.abs(trendPercent) > 5) {
          trend = trendPercent > 0 ? 'up' : 'down'
        }
      }

      return {
        teamId,
        teamName: teamId.charAt(0).toUpperCase() + teamId.slice(1),
        totalMembers,
        totalSessions: teamSessions.length,
        averageSuccessRate,
        averageDuration,
        totalModulesCompleted: allModules.size,
        totalTestsRun,
        topPerformer,
        trend,
        trendPercent,
        color: teamColors[teamId as keyof typeof teamColors] || teamColors.alpha
      }
    })
  }, [testSessions, selectedTeams, allTeams])

  const timeSeriesData = useMemo((): TimeSeriesData[] => {
    if (!testSessions || selectedTeams.length === 0) return []

    const dataMap = new Map<string, any>()
    const teamsToTrack = selectedTeams.length > 0 ? selectedTeams : allTeams.slice(0, 3)

    testSessions
      .filter(s => teamsToTrack.includes(s.teamId || ''))
      .forEach(session => {
        const date = new Date(session.startTime).toLocaleDateString()
        
        if (!dataMap.has(date)) {
          dataMap.set(date, { date })
        }
        
        const dayData = dataMap.get(date)
        const teamKey = session.teamId || 'unknown'
        const successRate = session.totalTests > 0 ? (session.passedTests / session.totalTests) * 100 : 0
        
        if (!dayData[teamKey]) {
          dayData[teamKey] = []
        }
        dayData[teamKey].push(successRate)
      })

    const result: TimeSeriesData[] = []
    dataMap.forEach((dayData, date) => {
      const entry: TimeSeriesData = { date }
      
      teamsToTrack.forEach(teamId => {
        if (dayData[teamId]) {
          const avg = dayData[teamId].reduce((a: number, b: number) => a + b, 0) / dayData[teamId].length
          entry[teamId] = Math.round(avg)
        } else {
          entry[teamId] = 0
        }
      })
      
      result.push(entry)
    })

    return result.slice(-30)
  }, [testSessions, selectedTeams, allTeams])

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(t => t !== teamId)
      }
      if (prev.length >= 5) {
        toast.error('Maximum 5 teams can be compared at once')
        return prev
      }
      return [...prev, teamId]
    })
    soundManager.play('glassTap')
  }

  const exportAllCharts = () => {
    toast.success('Preparing charts for export...')
    soundManager.play('glassTap')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-card/70 backdrop-blur-xl border-border/40 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50 hover:shadow-lg hover:shadow-rose-blush/10 dark:hover:shadow-moonlit-lavender/10 transition-all duration-300"
        >
          <BarChart3 className="w-4 h-4" />
          Team Comparison
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-7xl max-h-[95vh] bg-card/95 backdrop-blur-3xl border-border/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-rose-blush dark:text-moonlit-lavender flex items-center gap-3">
            <Users className="w-6 h-6" />
            Team Performance Comparison
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Compare team performance metrics and trends side-by-side
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Select Teams:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {allTeams.map(teamId => (
                <Button
                  key={teamId}
                  size="sm"
                  variant={selectedTeams.includes(teamId) ? 'default' : 'outline'}
                  onClick={() => handleTeamToggle(teamId)}
                  className={selectedTeams.includes(teamId)
                    ? 'bg-rose-blush/20 text-rose-blush dark:bg-moonlit-lavender/20 dark:text-moonlit-lavender border-rose-blush/50 dark:border-moonlit-lavender/50'
                    : ''
                  }
                >
                  {teamId.charAt(0).toUpperCase() + teamId.slice(1)}
                </Button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <ChartExportDialog
                chartId="team-comparison-chart"
                chartTitle="Team Performance Comparison"
              />
            </div>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="team-comparison-chart">
                <AnimatePresence mode="popLayout">
                  {teamComparisonData.map((team, index) => (
                    <motion.div
                      key={team.teamId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl border-border/40 hover:shadow-xl transition-all duration-300">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-serif font-semibold mb-1"
                                style={{ color: team.color }}>
                                Team {team.teamName}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {team.totalMembers} member{team.totalMembers !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                              team.trend === 'up'
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : team.trend === 'down'
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {team.trend === 'up' ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : team.trend === 'down' ? (
                                <TrendingDown className="w-4 h-4" />
                              ) : (
                                <Target className="w-4 h-4" />
                              )}
                              <span className="text-xs font-medium">
                                {team.trend === 'stable' ? 'Stable' : `${Math.abs(team.trendPercent).toFixed(1)}%`}
                              </span>
                            </div>
                          </div>

                          <Separator className="bg-border/40" />

                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Success Rate</span>
                                <span className="text-lg font-semibold font-serif"
                                  style={{ color: team.color }}>
                                  {team.averageSuccessRate.toFixed(1)}%
                                </span>
                              </div>
                              <Progress
                                value={team.averageSuccessRate}
                                className="h-2"
                                style={{
                                  '--progress-background': team.color
                                } as any}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <BarChart3 className="w-3 h-3" />
                                  Tests Run
                                </div>
                                <div className="text-lg font-semibold font-serif">
                                  {team.totalTestsRun}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  Modules
                                </div>
                                <div className="text-lg font-semibold font-serif">
                                  {team.totalModulesCompleted}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Avg Time
                                </div>
                                <div className="text-sm font-medium">
                                  {Math.floor(team.averageDuration / 60)}m {team.averageDuration % 60}s
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  Sessions
                                </div>
                                <div className="text-sm font-medium">
                                  {team.totalSessions}
                                </div>
                              </div>
                            </div>
                          </div>

                          <Separator className="bg-border/40" />

                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                            <Award className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-muted-foreground">Top Performer</div>
                              <div className="text-sm font-medium truncate">{team.topPerformer}</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {teamComparisonData.length > 0 && (
                <>
                  <Separator className="bg-border/40" />

                  <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/40" id="performance-trend-chart">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-serif font-semibold">Performance Trends</h3>
                      <div className="flex items-center gap-2">
                        <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="radar">Radar</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <ChartExportDialog
                          chartId="performance-trend-chart"
                          chartTitle="Performance Trends Over Time"
                        />
                      </div>
                    </div>

                    <div className="h-80 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/40" data-chart-container>
                      <div className="text-center space-y-2">
                        <LineChartIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          Performance trend visualization
                        </p>
                        <div className="flex items-center gap-4 justify-center pt-4">
                          {teamComparisonData.map((team, idx) => (
                            <div key={team.teamId} className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: team.color }}
                                data-chart-line
                                data-team={team.teamId}
                              />
                              <span className="text-xs font-medium">Team {team.teamName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/40" id="comparative-metrics-chart">
                    <h3 className="text-xl font-serif font-semibold mb-6">Comparative Metrics</h3>
                    
                    <div className="space-y-6">
                      {[
                        { label: 'Success Rate', key: 'averageSuccessRate', max: 100, unit: '%' },
                        { label: 'Modules Completed', key: 'totalModulesCompleted', max: 20, unit: '' },
                        { label: 'Total Tests', key: 'totalTestsRun', max: Math.max(...teamComparisonData.map(t => t.totalTestsRun)), unit: '' }
                      ].map((metric) => (
                        <div key={metric.key} className="space-y-2" data-chart-bar data-metric={metric.key}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{metric.label}</span>
                          </div>
                          <div className="space-y-2">
                            {teamComparisonData.map((team) => {
                              const value = team[metric.key as keyof TeamComparisonData] as number
                              const percentage = (value / metric.max) * 100
                              
                              return (
                                <div key={team.teamId} className="flex items-center gap-3">
                                  <div className="w-24 text-sm text-muted-foreground">
                                    Team {team.teamName}
                                  </div>
                                  <div className="flex-1 relative">
                                    <div className="h-8 bg-muted/30 rounded-lg overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                        className="h-full rounded-lg"
                                        style={{ backgroundColor: team.color }}
                                      />
                                    </div>
                                  </div>
                                  <div className="w-20 text-right text-sm font-semibold font-serif"
                                    style={{ color: team.color }}>
                                    {value.toFixed(metric.unit === '%' ? 1 : 0)}{metric.unit}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              )}

              {teamComparisonData.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    Select teams to compare their performance
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
