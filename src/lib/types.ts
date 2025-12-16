export interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  zip: string
  price: number
  yearBuilt: number
  bedrooms: number
  bathrooms: number
  sqft: number
  imageUrl: string
  videoUrl?: string
  currentRent?: number
  projectedRent?: number
  capRate?: number
  roi?: number
  leaseEndDate?: string
  lastInspectionDate?: string
  isCurated: boolean
  fairMarketRent?: number
  legalRentCap?: number
  hasLeadRisk?: boolean
  complianceFlags: ComplianceFlag[]
}

export interface ComplianceFlag {
  type: 'GOOD_CAUSE_NY' | 'LEAD_WATCHDOG_NJ' | 'LEASE_EXPIRING'
  severity: 'URGENT' | 'WARNING' | 'INFO'
  message: string
  calculatedValue?: number
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
}

export interface Document {
  id: string
  propertyId: string
  title: string
  type: 'deed' | 'inspection' | 'lease' | 'financial' | 'other'
  thumbnailUrl: string
  uploadDate: string
  size: string
}

export type UserRole = 'agent' | 'client'

export interface User {
  role: UserRole
  inviteCode?: string
  authenticated: boolean
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  properties?: Property[]
  metadata?: {
    intent?: string
    confidence?: number
    suggestedActions?: string[]
  }
}

export interface ConciergeContext {
  recentProperties: Property[]
  userPreferences: any
  conversationHistory: ConversationMessage[]
  lastInteraction: Date
}

export interface PriceAlert {
  id: string
  minPrice: number
  maxPrice: number
  bedrooms?: number
  bathrooms?: number
  location?: string
  enabled: boolean
  createdAt: string
  lastNotified?: string
  matchedProperties?: string[]
}

export interface MeasurementPreset {
  id: string
  name: string
  description?: string
  defaultLength?: number
  icon?: string
  createdAt: string
}

export interface ComparisonHistory {
  id: string
  propertyIds: string[]
  snapshotUrl?: string
  createdAt: string
  title: string
  shareableLink?: string
}
