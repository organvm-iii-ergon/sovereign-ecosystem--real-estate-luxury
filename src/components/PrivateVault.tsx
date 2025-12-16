import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, Clock, Download, FileText } from 'lucide-react'
import { Document } from '@/lib/types'
import { Button } from './ui/button'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface PrivateVaultProps {
  documents: Document[]
}

export function PrivateVault({ documents }: PrivateVaultProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleAuthenticate = () => {
    setIsAuthenticating(true)
    soundManager.play('glassTap')

    setTimeout(() => {
      setIsAuthenticating(false)
      setIsAuthenticated(true)
      soundManager.play('unlock')
      toast.success('Authentication successful')
    }, 2000)
  }

  const handleGenerateLink = (doc: Document) => {
    soundManager.play('glassTap')
    const mockLink = `https://sovereign.vault/share/${doc.id}`
    navigator.clipboard.writeText(mockLink)
    toast.success('Link copied! Expires in 24 hours', {
      description: mockLink,
      duration: 5000
    })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-champagne-gold mb-2">Private Vault</h2>
          <p className="text-slate-grey">Secure document storage and sharing</p>
        </div>

        {!isAuthenticated && (
          <Button
            onClick={handleAuthenticate}
            disabled={isAuthenticating}
            className="bg-champagne-gold text-onyx-deep hover:bg-champagne-gold/90"
          >
            <Lock className="w-4 h-4 mr-2" />
            {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
          </Button>
        )}
      </div>

      {isAuthenticating && (
        <div className="flex items-center justify-center py-20">
          <motion.div
            className="relative w-32 h-32"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-champagne-gold/30" />
            <div className="absolute inset-0 rounded-full border-t-4 border-champagne-gold" />
          </motion.div>
        </div>
      )}

      {!isAuthenticating && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, index) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isAuthenticated={isAuthenticated}
              index={index}
              onGenerateLink={handleGenerateLink}
            />
          ))}
        </div>
      )}

      {documents.length === 0 && !isAuthenticating && (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-slate-grey mx-auto mb-4" />
          <p className="text-slate-grey">No documents in vault</p>
        </div>
      )}
    </div>
  )
}

interface DocumentCardProps {
  document: Document
  isAuthenticated: boolean
  index: number
  onGenerateLink: (doc: Document) => void
}

function DocumentCard({ document, isAuthenticated, index, onGenerateLink }: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'deed':
        return '📜'
      case 'inspection':
        return '🔍'
      case 'lease':
        return '📋'
      case 'financial':
        return '💰'
      default:
        return '📄'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-onyx-surface border border-border rounded-lg overflow-hidden hover:border-champagne-gold/50 transition-colors"
    >
      <div className="relative aspect-[4/3] bg-onyx-deep">
        {!isAuthenticated ? (
          <div className="absolute inset-0 backdrop-blur-xl bg-onyx-deep/80 flex items-center justify-center">
            <Lock className="w-12 h-12 text-slate-grey" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {getDocumentIcon(document.type)}
          </div>
        )}

        <AnimatePresence>
          {isAuthenticated && isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-onyx-deep/90 flex items-center justify-center gap-4"
            >
              <button
                onClick={() => onGenerateLink(document)}
                className="w-12 h-12 rounded-full bg-champagne-gold flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Clock className="w-5 h-5 text-onyx-deep" />
              </button>
              <button className="w-12 h-12 rounded-full bg-champagne-gold flex items-center justify-center hover:scale-110 transition-transform">
                <Eye className="w-5 h-5 text-onyx-deep" />
              </button>
              <button className="w-12 h-12 rounded-full bg-champagne-gold flex items-center justify-center hover:scale-110 transition-transform">
                <Download className="w-5 h-5 text-onyx-deep" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4">
        <h3 className="text-foreground font-semibold mb-1 truncate">{document.title}</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-grey capitalize">{document.type}</span>
          <span className="text-slate-grey">{document.size}</span>
        </div>
        <p className="text-slate-grey text-xs mt-2">
          Uploaded {new Date(document.uploadDate).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  )
}
