import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Check } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { soundManager } from '@/lib/sound-manager'

interface ClientAuthProps {
  onAuthenticate: (inviteCode: string) => void
}

export function ClientAuth({ onAuthenticate }: ClientAuthProps) {
  const [inviteCode, setInviteCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [showBiometric, setShowBiometric] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (inviteCode.length < 6) {
      setError('Invalid invite code')
      return
    }
    
    setIsValidating(true)
    soundManager.play('glassTap')
    
    setTimeout(() => {
      setIsValidating(false)
      setShowBiometric(true)
    }, 1000)
  }

  const handleBiometricComplete = () => {
    soundManager.play('unlock')
    setTimeout(() => {
      onAuthenticate(inviteCode)
    }, 2000)
  }

  if (showBiometric) {
    return <BiometricScan onComplete={handleBiometricComplete} />
  }

  return (
    <div className="min-h-screen bg-onyx-deep flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="bg-onyx-surface border border-border rounded-lg p-12 shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-champagne-gold/10 flex items-center justify-center">
                <Lock className="w-10 h-10 text-champagne-gold" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold text-champagne-gold mb-2">Velvet Rope Entry</h2>
            <p className="text-slate-grey">Enter your exclusive invite code</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                id="invite-code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="INVITE-CODE"
                className="text-center text-2xl tracking-widest bg-onyx-deep border-border focus:border-champagne-gold text-foreground placeholder:text-muted-foreground"
                disabled={isValidating}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-sm mt-2 text-center"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isValidating || inviteCode.length < 6}
              className="w-full bg-champagne-gold text-onyx-deep hover:bg-champagne-gold/90 font-semibold py-6 text-lg"
            >
              {isValidating ? 'Validating...' : 'Enter'}
            </Button>
          </form>

          <p className="text-slate-grey text-sm text-center mt-8">
            No invite code? Contact your agent for exclusive access.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function BiometricScan({ onComplete }: { onComplete: () => void }) {
  const [scanning, setScanning] = useState(true)
  const [success, setSuccess] = useState(false)

  useState(() => {
    const timer = setTimeout(() => {
      setScanning(false)
      setSuccess(true)
      soundManager.play('glassTap')
      onComplete()
    }, 2000)

    return () => clearTimeout(timer)
  })

  return (
    <div className="min-h-screen bg-onyx-deep flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          className="relative w-64 h-64 mx-auto mb-8"
          animate={scanning ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-champagne-gold/30" />
          <div className="absolute inset-4 rounded-full border-4 border-champagne-gold/20" />
          <div className="absolute inset-8 rounded-full border-4 border-champagne-gold/10" />
          
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={success ? { scale: 1.2, opacity: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            {success ? (
              <Check className="w-32 h-32 text-champagne-gold" />
            ) : (
              <Lock className="w-32 h-32 text-champagne-gold" />
            )}
          </motion.div>

          {scanning && (
            <motion.div
              className="absolute inset-0 border-t-4 border-champagne-gold rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            />
          )}
        </motion.div>

        <h3 className="text-2xl font-bold text-champagne-gold mb-2">
          {scanning ? 'Authenticating...' : 'Access Granted'}
        </h3>
        <p className="text-slate-grey">
          {scanning ? 'Verifying your identity' : 'Welcome to The Sovereign Ecosystem'}
        </p>
      </motion.div>
    </div>
  )
}
