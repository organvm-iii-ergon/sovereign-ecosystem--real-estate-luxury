import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, CheckCircle2, Bell, Settings, Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { useKV } from '@github/spark/hooks'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'
import { TestFailure } from './TestFailureNotifications'

interface EmailRecipient {
  id: string
  email: string
  name?: string
  notifyOnAllFailures: boolean
  notifyOnRetrySuccess: boolean
  notifyOnPermanentFailure: boolean
}

interface EmailSettings {
  enabled: boolean
  recipients: EmailRecipient[]
  includeStackTrace: boolean
  includeRetryStatus: boolean
  groupFailures: boolean
  sendDelay: number
}

interface TestEmailNotificationsProps {
  failures: TestFailure[]
}

export function TestEmailNotifications({ failures }: TestEmailNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [emailSettings, setEmailSettings] = useKV<EmailSettings>('test-email-settings', {
    enabled: false,
    recipients: [],
    includeStackTrace: true,
    includeRetryStatus: true,
    groupFailures: false,
    sendDelay: 5000
  })
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)

  const addRecipient = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    const recipient: EmailRecipient = {
      id: `recipient-${Date.now()}`,
      email: newEmail,
      name: newName || undefined,
      notifyOnAllFailures: true,
      notifyOnRetrySuccess: false,
      notifyOnPermanentFailure: true
    }

    setEmailSettings(prev => {
      const current = prev || {
        enabled: false,
        recipients: [],
        includeStackTrace: true,
        includeRetryStatus: true,
        groupFailures: false,
        sendDelay: 5000
      }
      return {
        ...current,
        recipients: [...current.recipients, recipient]
      }
    })

    setNewEmail('')
    setNewName('')
    soundManager.play('success')
    toast.success('Recipient added', { description: recipient.email })
  }

  const removeRecipient = (id: string) => {
    setEmailSettings(prev => {
      const current = prev || {
        enabled: false,
        recipients: [],
        includeStackTrace: true,
        includeRetryStatus: true,
        groupFailures: false,
        sendDelay: 5000
      }
      return {
        ...current,
        recipients: current.recipients.filter(r => r.id !== id)
      }
    })
    soundManager.play('glassTap')
    toast.success('Recipient removed')
  }

  const updateRecipient = (id: string, updates: Partial<EmailRecipient>) => {
    setEmailSettings(prev => {
      const current = prev || {
        enabled: false,
        recipients: [],
        includeStackTrace: true,
        includeRetryStatus: true,
        groupFailures: false,
        sendDelay: 5000
      }
      return {
        ...current,
        recipients: current.recipients.map(r => 
          r.id === id ? { ...r, ...updates } : r
        )
      }
    })
    soundManager.play('glassTap')
  }

  const toggleEnabled = () => {
    setEmailSettings(prev => {
      const current = prev || {
        enabled: false,
        recipients: [],
        includeStackTrace: true,
        includeRetryStatus: true,
        groupFailures: false,
        sendDelay: 5000
      }
      return { ...current, enabled: !current.enabled }
    })
    soundManager.play('glassTap')
    toast.success(emailSettings?.enabled ? 'Email notifications disabled' : 'Email notifications enabled')
  }

  const sendTestEmail = async () => {
    if (!emailSettings?.recipients || emailSettings.recipients.length === 0) {
      toast.error('No recipients configured')
      return
    }

    setIsSendingTest(true)
    soundManager.play('glassTap')

    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsSendingTest(false)
    soundManager.play('success')
    toast.success('Test email sent', {
      description: `Sent to ${emailSettings.recipients.length} recipient(s)`
    })
  }

  const generateEmailPreview = (failure: TestFailure) => {
    const settings = emailSettings || {
      enabled: false,
      recipients: [],
      includeStackTrace: true,
      includeRetryStatus: true,
      groupFailures: false,
      sendDelay: 5000
    }

    return `
Subject: Test Failure Alert: ${failure.testName}

Test Failure Report
===================

Test Name: ${failure.testName}
Category: ${failure.category}
Error: ${failure.errorMessage}
Timestamp: ${new Date(failure.timestamp).toLocaleString()}

${settings.includeRetryStatus ? `
Retry Status:
- Current Attempt: ${failure.retryCount}
- Max Retries: ${failure.maxRetries}
- Can Retry: ${failure.retryCount < failure.maxRetries ? 'Yes' : 'No'}
` : ''}

${failure.details && failure.details.length > 0 ? `
Details:
${failure.details.map(d => `- ${d}`).join('\n')}
` : ''}

${settings.includeStackTrace && failure.stackTrace ? `
Stack Trace:
${failure.stackTrace}
` : ''}

---
Automated notification from The Sovereign Ecosystem Testing Dashboard
    `.trim()
  }

  const settings = emailSettings || {
    enabled: false,
    recipients: [],
    includeStackTrace: true,
    includeRetryStatus: true,
    groupFailures: false,
    sendDelay: 5000
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 relative"
          onClick={() => soundManager.play('glassTap')}
        >
          <Mail className="w-4 h-4" />
          Email Notifications
          {settings.enabled && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-green-500 text-white rounded-full">
              <CheckCircle2 className="w-3 h-3" />
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            Email Notifications
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Configure email alerts for test failures with detailed error information and retry status
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Enable Notifications
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive email alerts when tests fail
                  </p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={toggleEnabled}
                />
              </div>

              {settings.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-3 border-t border-border"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Include Stack Traces</Label>
                    <Switch
                      checked={settings.includeStackTrace}
                      onCheckedChange={(checked) => 
                        setEmailSettings(prev => ({ ...(prev || settings), includeStackTrace: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Include Retry Status</Label>
                    <Switch
                      checked={settings.includeRetryStatus}
                      onCheckedChange={(checked) => 
                        setEmailSettings(prev => ({ ...(prev || settings), includeRetryStatus: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Group Multiple Failures</Label>
                    <Switch
                      checked={settings.groupFailures}
                      onCheckedChange={(checked) => 
                        setEmailSettings(prev => ({ ...(prev || settings), groupFailures: checked }))
                      }
                    />
                  </div>
                </motion.div>
              )}
            </Card>

            <Card className="p-4 bg-muted/30">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Recipients
              </h3>

              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="new-name" className="text-sm">Name (optional)</Label>
                    <Input
                      id="new-name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-email" className="text-sm">Email Address</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="mt-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addRecipient()
                        }
                      }}
                    />
                  </div>
                </div>

                <Button
                  onClick={addRecipient}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                  Add Recipient
                </Button>
              </div>

              <Separator className="my-4" />

              {settings.recipients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No recipients configured</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {settings.recipients.map((recipient) => (
                    <Card key={recipient.id} className="p-3 bg-background/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{recipient.name || recipient.email}</div>
                          {recipient.name && (
                            <div className="text-xs text-muted-foreground">{recipient.email}</div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeRecipient(recipient.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">All Failures</Label>
                          <Switch
                            checked={recipient.notifyOnAllFailures}
                            onCheckedChange={(checked) => 
                              updateRecipient(recipient.id, { notifyOnAllFailures: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Retry Success</Label>
                          <Switch
                            checked={recipient.notifyOnRetrySuccess}
                            onCheckedChange={(checked) => 
                              updateRecipient(recipient.id, { notifyOnRetrySuccess: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Permanent Failures</Label>
                          <Switch
                            checked={recipient.notifyOnPermanentFailure}
                            onCheckedChange={(checked) => 
                              updateRecipient(recipient.id, { notifyOnPermanentFailure: checked })
                            }
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>

            {failures.length > 0 && (
              <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Email Preview
                </h3>
                <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-x-auto text-muted-foreground font-mono whitespace-pre-wrap">
                  {generateEmailPreview(failures[0])}
                </pre>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            onClick={sendTestEmail}
            disabled={!settings.enabled || settings.recipients.length === 0 || isSendingTest}
            className="flex-1 gap-2"
          >
            {isSendingTest ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Send className="w-4 h-4" />
                </motion.div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Test Email
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
