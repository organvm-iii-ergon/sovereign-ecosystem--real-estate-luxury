import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileImage, FileText, CheckCircle2, Loader2, Image as ImageIcon, Share2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { Progress } from './ui/progress'
import { chartExportService, ChartExportOptions, ExportedChart } from '@/lib/chart-export-service'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface ChartExportDialogProps {
  chartId: string
  chartTitle: string
  trigger?: React.ReactNode
}

export function ChartExportDialog({ chartId, chartTitle, trigger }: ChartExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<'png' | 'pdf'>('png')
  const [includeWatermark, setIncludeWatermark] = useState(true)
  const [quality, setQuality] = useState(1.0)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [lastExport, setLastExport] = useState<ExportedChart | null>(null)
  const [exportHistory, setExportHistory] = useKV<ExportedChart[]>('chart-export-history', [])

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)
    soundManager.play('glassTap')

    try {
      setExportProgress(30)
      
      const options: ChartExportOptions = {
        format,
        chartId,
        title: chartTitle,
        includeWatermark,
        quality,
        width: 1200,
        height: 800
      }

      setExportProgress(60)
      
      const exported = await chartExportService.exportChart(options)
      
      setExportProgress(90)
      
      chartExportService.downloadChart(exported)
      
      setLastExport(exported)
      setExportHistory(prev => [exported, ...(prev || [])].slice(0, 20))
      
      setExportProgress(100)
      
      toast.success('Chart exported successfully', {
        description: `Downloaded as ${format.toUpperCase()}`
      })
      
      soundManager.play('vaultUnlock')

      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 1000)
      
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed', {
        description: 'Please try again'
      })
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-card/70 backdrop-blur-xl border-border/40 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50 hover:shadow-lg hover:shadow-rose-blush/10 dark:hover:shadow-moonlit-lavender/10 transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Export Chart
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-xl bg-card/95 backdrop-blur-3xl border-border/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-rose-blush dark:text-moonlit-lavender flex items-center gap-3">
            <Download className="w-6 h-6" />
            Export Performance Chart
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Download {chartTitle} as an image or PDF document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'png' | 'pdf')}>
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    format === 'png'
                      ? 'border-rose-blush dark:border-moonlit-lavender bg-rose-blush/5 dark:bg-moonlit-lavender/5'
                      : 'border-border/40 hover:border-border'
                  }`}>
                    <RadioGroupItem value="png" id="png" />
                    <div className="flex items-center gap-2 flex-1">
                      <ImageIcon className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                      <div>
                        <div className="font-medium">PNG Image</div>
                        <div className="text-xs text-muted-foreground">High quality raster</div>
                      </div>
                    </div>
                  </label>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    format === 'pdf'
                      ? 'border-rose-blush dark:border-moonlit-lavender bg-rose-blush/5 dark:bg-moonlit-lavender/5'
                      : 'border-border/40 hover:border-border'
                  }`}>
                    <RadioGroupItem value="pdf" id="pdf" />
                    <div className="flex items-center gap-2 flex-1">
                      <FileText className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                      <div>
                        <div className="font-medium">PDF Document</div>
                        <div className="text-xs text-muted-foreground">Print ready</div>
                      </div>
                    </div>
                  </label>
                </motion.div>
              </div>
            </RadioGroup>
          </div>

          <Separator className="bg-border/40" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Include Watermark</Label>
                <p className="text-xs text-muted-foreground">Add branding and timestamp</p>
              </div>
              <Switch
                checked={includeWatermark}
                onCheckedChange={setIncludeWatermark}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Export Quality</Label>
                <Badge variant="outline" className="text-xs">
                  {Math.round(quality * 100)}%
                </Badge>
              </div>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-rose-blush dark:accent-moonlit-lavender"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>
          </div>

          {isExporting && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exporting...</span>
                <span className="font-medium text-rose-blush dark:text-moonlit-lavender">
                  {exportProgress}%
                </span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </motion.div>
          )}

          {lastExport && !isExporting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-rose-blush/5 dark:bg-moonlit-lavender/5 border border-rose-blush/20 dark:border-moonlit-lavender/20"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-blush/10 dark:bg-moonlit-lavender/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">Export Complete</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Format: {lastExport.format.toUpperCase()}</div>
                    <div>Size: {formatFileSize(lastExport.size)}</div>
                    <div>Downloaded at {new Date(lastExport.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-lavender dark:to-moonlit-violet text-white hover:shadow-lg hover:shadow-rose-blush/30 dark:hover:shadow-moonlit-lavender/30 transition-all duration-300"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export & Download
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
