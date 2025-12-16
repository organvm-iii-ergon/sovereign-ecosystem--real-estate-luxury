import { Property, ComplianceFlag } from './types'

export function calculateGoodCauseNY(property: Property): ComplianceFlag | null {
  if (property.state !== 'NY') return null
  
  const fairMarketRent = property.fairMarketRent || 0
  const currentRent = property.currentRent || 0
  const exemptionThreshold = fairMarketRent * 2.45
  
  if (currentRent > exemptionThreshold) {
    return {
      type: 'GOOD_CAUSE_NY',
      severity: 'INFO',
      message: `Property EXEMPT from Good Cause (Rent: $${currentRent.toLocaleString()} > Threshold: $${exemptionThreshold.toLocaleString()})`,
      calculatedValue: exemptionThreshold
    }
  }
  
  const legalRentCap = currentRent * 1.10
  
  return {
    type: 'GOOD_CAUSE_NY',
    severity: 'WARNING',
    message: `Good Cause applies. Legal rent cap: $${legalRentCap.toLocaleString()} (10% increase limit)`,
    calculatedValue: legalRentCap
  }
}

export function calculateLeadWatchdogNJ(property: Property): ComplianceFlag | null {
  if (property.state !== 'NJ') return null
  if (property.yearBuilt >= 1978) return null
  
  const lastInspection = property.lastInspectionDate 
    ? new Date(property.lastInspectionDate) 
    : null
  
  if (!lastInspection) {
    return {
      type: 'LEAD_WATCHDOG_NJ',
      severity: 'URGENT',
      message: 'Pre-1978 property with NO lead inspection on record',
      calculatedValue: property.yearBuilt
    }
  }
  
  const today = new Date()
  const threeYearsAgo = new Date()
  threeYearsAgo.setFullYear(today.getFullYear() - 3)
  
  if (lastInspection < threeYearsAgo) {
    const daysSince = Math.floor((today.getTime() - lastInspection.getTime()) / (1000 * 60 * 60 * 24))
    return {
      type: 'LEAD_WATCHDOG_NJ',
      severity: 'URGENT',
      message: `Lead inspection overdue (${daysSince} days since last inspection)`,
      calculatedValue: daysSince
    }
  }
  
  return {
    type: 'LEAD_WATCHDOG_NJ',
    severity: 'INFO',
    message: 'Lead inspection current',
    calculatedValue: 0
  }
}

export function checkLeaseExpiration(property: Property): ComplianceFlag | null {
  if (!property.leaseEndDate) return null
  
  const leaseEnd = new Date(property.leaseEndDate)
  const today = new Date()
  const daysUntilExpiration = Math.floor((leaseEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiration < 0) {
    return {
      type: 'LEASE_EXPIRING',
      severity: 'URGENT',
      message: `Lease EXPIRED ${Math.abs(daysUntilExpiration)} days ago`,
      calculatedValue: daysUntilExpiration
    }
  }
  
  if (daysUntilExpiration <= 90) {
    return {
      type: 'LEASE_EXPIRING',
      severity: daysUntilExpiration <= 30 ? 'URGENT' : 'WARNING',
      message: `Lease expires in ${daysUntilExpiration} days`,
      calculatedValue: daysUntilExpiration
    }
  }
  
  return null
}

export function analyzeProperty(property: Property): Property {
  const flags: ComplianceFlag[] = []
  
  const goodCauseFlag = calculateGoodCauseNY(property)
  if (goodCauseFlag) flags.push(goodCauseFlag)
  
  const leadFlag = calculateLeadWatchdogNJ(property)
  if (leadFlag) flags.push(leadFlag)
  
  const leaseFlag = checkLeaseExpiration(property)
  if (leaseFlag) flags.push(leaseFlag)
  
  return {
    ...property,
    complianceFlags: flags,
    hasLeadRisk: leadFlag?.severity === 'URGENT'
  }
}

export function getWatchlistProperties(properties: Property[]): Property[] {
  return properties.filter(prop => {
    if (!prop.leaseEndDate) return false
    
    const leaseEnd = new Date(prop.leaseEndDate)
    const today = new Date()
    const daysUntilExpiration = Math.floor((leaseEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysUntilExpiration >= 0 && daysUntilExpiration <= 90
  })
}

export function getRiskMapProperties(properties: Property[]): Property[] {
  return properties.filter(prop => 
    prop.complianceFlags.some(flag => flag.severity === 'URGENT' || flag.severity === 'WARNING')
  )
}
