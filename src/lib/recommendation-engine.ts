import { Property } from './types'

export interface UserPreferences {
  priceRange: { min: number; max: number }
  preferredCities: string[]
  minBedrooms: number
  minBathrooms: number
  preferredFeatures: string[]
  investmentGoals: 'cash-flow' | 'appreciation' | 'balanced'
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
}

export interface PropertyRecommendation {
  property: Property
  score: number
  reasons: string[]
  urgency: 'high' | 'medium' | 'low'
  category: 'new-listing' | 'off-market' | 'price-drop' | 'portfolio-match' | 'lease-expiring'
}

export interface ConciergeInsight {
  id: string
  type: 'recommendation' | 'alert' | 'opportunity' | 'advice'
  title: string
  message: string
  property?: Property
  actionLabel?: string
  urgency: 'high' | 'medium' | 'low'
  timestamp: Date
  metadata?: Record<string, any>
}

export function calculatePropertyScore(
  property: Property,
  preferences: UserPreferences,
  userPortfolio: Property[]
): number {
  let score = 0

  if (property.price >= preferences.priceRange.min && property.price <= preferences.priceRange.max) {
    score += 30
  } else if (property.price < preferences.priceRange.min) {
    score += 15
  }

  if (preferences.preferredCities.includes(property.city)) {
    score += 25
  }

  if (property.bedrooms >= preferences.minBedrooms) {
    score += 15
  }

  if (property.bathrooms >= preferences.minBathrooms) {
    score += 10
  }

  if (preferences.investmentGoals === 'cash-flow' && property.capRate && property.capRate > 5) {
    score += 20
  } else if (preferences.investmentGoals === 'appreciation' && property.roi && property.roi > 8) {
    score += 20
  }

  if (property.isCurated) {
    score += 15
  }

  const hasNoUrgentFlags = !property.complianceFlags.some(flag => flag.severity === 'URGENT')
  if (hasNoUrgentFlags) {
    score += 10
  }

  const portfolioSize = userPortfolio.length
  if (portfolioSize > 0) {
    const diversification = !userPortfolio.some(p => p.city === property.city)
    if (diversification && preferences.riskTolerance === 'moderate') {
      score += 15
    }
  }

  return Math.min(score, 100)
}

export function generateRecommendationReasons(
  property: Property,
  preferences: UserPreferences,
  score: number
): string[] {
  const reasons: string[] = []

  if (preferences.preferredCities.includes(property.city)) {
    reasons.push(`Located in your preferred area: ${property.city}`)
  }

  if (property.capRate && property.capRate > 5) {
    reasons.push(`Strong cap rate: ${property.capRate.toFixed(1)}%`)
  }

  if (property.roi && property.roi > 8) {
    reasons.push(`High ROI potential: ${property.roi.toFixed(1)}%`)
  }

  if (property.isCurated) {
    reasons.push('Verified and curated by our team')
  }

  if (property.yearBuilt > 2000) {
    reasons.push('Modern construction with fewer compliance concerns')
  }

  if (score >= 80) {
    reasons.push('Exceptional match for your investment profile')
  }

  return reasons.slice(0, 3)
}

export function generatePropertyRecommendations(
  allProperties: Property[],
  preferences: UserPreferences,
  userPortfolio: Property[]
): PropertyRecommendation[] {
  const recommendations: PropertyRecommendation[] = allProperties
    .map(property => {
      const score = calculatePropertyScore(property, preferences, userPortfolio)
      const reasons = generateRecommendationReasons(property, preferences, score)
      
      let urgency: 'high' | 'medium' | 'low' = 'low'
      if (score >= 80) urgency = 'high'
      else if (score >= 60) urgency = 'medium'

      let category: PropertyRecommendation['category'] = 'portfolio-match'
      if (property.isCurated) category = 'off-market'
      if (property.leaseEndDate) {
        const daysUntil = Math.floor(
          (new Date(property.leaseEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        if (daysUntil <= 90) category = 'lease-expiring'
      }

      return {
        property,
        score,
        reasons,
        urgency,
        category
      }
    })
    .filter(rec => rec.score >= 50)
    .sort((a, b) => b.score - a.score)

  return recommendations.slice(0, 5)
}

export function generateConciergeInsights(
  properties: Property[],
  userPortfolio: Property[],
  preferences: UserPreferences
): ConciergeInsight[] {
  const insights: ConciergeInsight[] = []

  const recommendations = generatePropertyRecommendations(properties, preferences, userPortfolio)
  
  const topRecommendation = recommendations[0]
  if (topRecommendation && topRecommendation.score >= 80) {
    insights.push({
      id: `rec-${topRecommendation.property.id}`,
      type: 'recommendation',
      title: 'Perfect Match Available',
      message: `${topRecommendation.property.title} in ${topRecommendation.property.city} matches your criteria exceptionally well. ${topRecommendation.reasons[0]}.`,
      property: topRecommendation.property,
      actionLabel: 'View Property',
      urgency: topRecommendation.urgency,
      timestamp: new Date(),
      metadata: {
        score: topRecommendation.score,
        reasons: topRecommendation.reasons
      }
    })
  }

  const expiringLeases = userPortfolio.filter(prop => {
    if (!prop.leaseEndDate) return false
    const daysUntil = Math.floor(
      (new Date(prop.leaseEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return daysUntil > 0 && daysUntil <= 60
  })

  expiringLeases.forEach(property => {
    const daysUntil = Math.floor(
      (new Date(property.leaseEndDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    insights.push({
      id: `lease-${property.id}`,
      type: 'alert',
      title: 'Lease Expiring Soon',
      message: `Your lease at ${property.address} expires in ${daysUntil} days. Would you like me to find similar properties?`,
      property,
      actionLabel: 'Find Alternatives',
      urgency: daysUntil <= 30 ? 'high' : 'medium',
      timestamp: new Date()
    })
  })

  const offMarketProperties = properties.filter(p => p.isCurated)
  if (offMarketProperties.length > 0) {
    const matchingOffMarket = offMarketProperties.find(p => 
      preferences.preferredCities.includes(p.city)
    )
    if (matchingOffMarket) {
      insights.push({
        id: `off-market-${matchingOffMarket.id}`,
        type: 'opportunity',
        title: 'Exclusive Off-Market Listing',
        message: `A curated ${matchingOffMarket.bedrooms}BR property just became available in ${matchingOffMarket.city}. This won't last long.`,
        property: matchingOffMarket,
        actionLabel: 'View Details',
        urgency: 'high',
        timestamp: new Date()
      })
    }
  }

  const refinanceOpportunities = userPortfolio.filter(prop => 
    prop.currentRent && prop.projectedRent && prop.projectedRent > prop.currentRent * 1.15
  )

  if (refinanceOpportunities.length > 0) {
    const property = refinanceOpportunities[0]
    const savings = ((property.projectedRent || 0) - (property.currentRent || 0)) * 12
    insights.push({
      id: `refi-${property.id}`,
      type: 'advice',
      title: 'Refinancing Opportunity',
      message: `Market rates suggest you could increase rent on ${property.address} by $${((property.projectedRent || 0) - (property.currentRent || 0)).toLocaleString()}/month. Annual impact: $${savings.toLocaleString()}.`,
      property,
      actionLabel: 'Analyze Impact',
      urgency: 'medium',
      timestamp: new Date()
    })
  }

  const portfolioValue = userPortfolio.reduce((sum, p) => sum + p.price, 0)
  if (portfolioValue > 5000000 && preferences.investmentGoals === 'cash-flow') {
    insights.push({
      id: 'diversification',
      type: 'advice',
      title: 'Portfolio Diversification',
      message: `Your portfolio is valued at $${(portfolioValue / 1000000).toFixed(1)}M. Consider diversifying into emerging markets for balanced growth.`,
      actionLabel: 'Explore Markets',
      urgency: 'low',
      timestamp: new Date()
    })
  }

  return insights.sort((a, b) => {
    const urgencyOrder = { high: 3, medium: 2, low: 1 }
    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
  })
}

export function getDefaultPreferences(): UserPreferences {
  return {
    priceRange: { min: 500000, max: 5000000 },
    preferredCities: ['Brooklyn', 'Manhattan', 'Queens'],
    minBedrooms: 2,
    minBathrooms: 2,
    preferredFeatures: ['high ceilings', 'gallery space', 'modern finishes'],
    investmentGoals: 'balanced',
    riskTolerance: 'moderate'
  }
}
