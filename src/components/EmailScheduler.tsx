import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Clock, Calendar, Plus, Edit, Trash2, Send, CheckCircle2,
  Settings, Users, FileText, Palette, Eye, Copy, ToggleLeft, ToggleRight
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import {
  EmailSchedule,
  EmailTemplate,
  emailScheduleService
} from '@/lib/email-schedule-service'
import { chartExportService } from '@/lib/chart-export-service'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface EmailSchedulerProps {
  availableCharts?: string[]
}

export function EmailScheduler({ availableCharts = [] }: EmailSchedulerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [schedules, setSchedules] = useKV<EmailSchedule[]>('email-schedules', [])
  const [templates, setTemplates] = useKV<EmailTemplate[]>('email-templates', [])
  const [isCreating, setIsCreating] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<EmailSchedule | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>('')

  const defaultTemplate: EmailTemplate = {
    id: 'default',
    name: 'Default Performance Report',
    subject: 'Your Weekly Performance Report',
    greeting: 'Hello,',
    bodyFormat: 'summary',
    includeChart: true,
    brandingColor: 'oklch(0.65 0.15 340)',
    footer: 'This is an automated report from The Sovereign Ecosystem.',
    createdAt: new Date().toISOString()
  }

  useEffect(() => {
    if (templates && templates.length === 0) {
      setTemplates([defaultTemplate])
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      checkAndSendScheduledEmails()
    }, 60000)

    return () => clearInterval(interval)
  }, [schedules, templates])

  const checkAndSendScheduledEmails = async () => {
    if (!schedules) return

    const dueSchedules = emailScheduleService.checkSchedules(schedules)

    for (const schedule of dueSchedules) {
      await sendScheduledEmail(schedule)
    }
  }

  const sendScheduledEmail = async (schedule: EmailSchedule) => {
    const template = templates?.find(t => t.id === schedule.templateId) || defaultTemplate

    const mockData = {
      stats: {
        totalTests: 147,
        successRate: 94,
        completedModules: 12,
        activeTeams: 3
      },
      charts: [],
      highlights: 'Your team has shown excellent progress this period. Keep up the great work!'
    }

    try {
      const report = await emailScheduleService.simulateSendEmail(schedule, template, mockData)

      toast.success('Report sent successfully', {
        description: `Sent to ${schedule.recipients.length} recipient(s)`
      })

      soundManager.play('glassTap')

      const updatedSchedule = emailScheduleService.updateScheduleAfterSend(schedule)
      setSchedules(prev => 
        (prev || []).map(s => s.id === schedule.id ? updatedSchedule : s)
      )
    } catch (error) {
      console.error('Failed to send email:', error)
      toast.error('Failed to send report')
    }
  }

  const createNewSchedule = () => {
    const newSchedule: Partial<EmailSchedule> = {
      name: 'New Schedule',
      enabled: true,
      frequency: 'weekly',
      dayOfWeek: 1,
      time: '09:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recipients: [],
      subject: 'Performance Report',
      templateId: templates?.[0]?.id || 'default',
      includeCharts: true,
      format: 'html',
      chartIds: []
    }

    const schedule = emailScheduleService.createSchedule(newSchedule as any)
    setSchedules(prev => [...(prev || []), schedule])
    setEditingSchedule(schedule)
    setIsCreating(true)
    soundManager.play('glassTap')
  }

  const updateSchedule = (id: string, updates: Partial<EmailSchedule>) => {
    setSchedules(prev =>
      (prev || []).map(s => s.id === id ? { ...s, ...updates } : s)
    )
  }

  const deleteSchedule = (id: string) => {
    setSchedules(prev => (prev || []).filter(s => s.id !== id))
    toast.success('Schedule deleted')
    soundManager.play('glassTap')
  }

  const toggleSchedule = (id: string) => {
    setSchedules(prev =>
      (prev || []).map(s => 
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    )
    soundManager.play('glassTap')
  }

  const previewTemplate = (template: EmailTemplate) => {
    const mockData = {
      stats: {
        totalTests: 147,
        successRate: 94,
        completedModules: 12,
        activeTeams: 3
      },
      charts: [],
      highlights: 'This is a preview of your automated report.'
    }

    const html = emailScheduleService.generateEmailHTML(template, mockData)
    setPreviewHtml(html)
  }

  const testSendEmail = async (schedule: EmailSchedule) => {
    toast.info('Sending test email...')
    await sendScheduledEmail(schedule)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-card/70 backdrop-blur-xl border-border/40 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50 hover:shadow-lg hover:shadow-rose-blush/10 dark:hover:shadow-moonlit-lavender/10 transition-all duration-300"
        >
          <Mail className="w-4 h-4" />
          Email Scheduling
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] bg-card/95 backdrop-blur-3xl border-border/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-rose-blush dark:text-moonlit-lavender flex items-center gap-3">
            <Mail className="w-6 h-6" />
            Automated Email Scheduling
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure automated reports to send at regular intervals
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="schedules" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedules">
              <Clock className="w-4 h-4 mr-2" />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedules" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {schedules?.length || 0} schedule{schedules?.length !== 1 ? 's' : ''} configured
              </div>
              <Button
                onClick={createNewSchedule}
                size="sm"
                className="bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-lavender dark:to-moonlit-violet text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Schedule
              </Button>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {schedules && schedules.length > 0 ? (
                    schedules.map((schedule, index) => (
                      <motion.div
                        key={schedule.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-4 bg-card/50 backdrop-blur-xl border-border/40">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-medium">{schedule.name}</h4>
                                  <Badge
                                    variant={schedule.enabled ? 'default' : 'outline'}
                                    className={schedule.enabled ? 'bg-rose-blush/20 text-rose-blush dark:bg-moonlit-lavender/20 dark:text-moonlit-lavender' : ''}
                                  >
                                    {schedule.enabled ? 'Active' : 'Paused'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleSchedule(schedule.id)}
                                  >
                                    {schedule.enabled ? (
                                      <ToggleRight className="w-4 h-4 text-rose-blush dark:text-moonlit-lavender" />
                                    ) : (
                                      <ToggleLeft className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => testSendEmail(schedule)}
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingSchedule(schedule)
                                      setIsCreating(true)
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteSchedule(schedule.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  <span className="capitalize">{schedule.frequency}</span>
                                  {schedule.frequency === 'weekly' && schedule.dayOfWeek !== undefined && (
                                    <span>
                                      ({['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][schedule.dayOfWeek]})
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>{schedule.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Users className="w-4 h-4" />
                                  <span>{schedule.recipients.length} recipient{schedule.recipients.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="w-4 h-4" />
                                  <span>Next: {new Date(schedule.nextScheduled).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {schedule.lastSent && (
                                <div className="text-xs text-muted-foreground">
                                  Last sent: {new Date(schedule.lastSent).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No schedules configured yet</p>
                      <p className="text-sm mt-2">Create your first automated report schedule</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Customize email templates with your branding
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {templates && templates.map((template) => (
                  <Card key={template.id} className="p-4 bg-card/50 backdrop-blur-xl border-border/40">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{template.name}</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => previewTemplate(template)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>Subject: {template.subject}</div>
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        <div
                          className="w-6 h-6 rounded-md border border-border/40"
                          style={{ backgroundColor: template.brandingColor }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {previewHtml && (
          <Dialog open={!!previewHtml} onOpenChange={() => setPreviewHtml('')}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Email Preview</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[600px]">
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}
