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
