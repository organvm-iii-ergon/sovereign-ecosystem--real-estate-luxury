import { Property, ConversationMessage } from './types'
import { UserPreferences } from './recommendation-engine'

export type QueryIntent = 
  | 'property-search'
  | 'comparison'
  | 'market-analysis'
  | 'investment-advice'
  | 'portfolio-health'
  | 'document-query'
  | 'financial-calculation'
  | 'general-question'

export interface QueryAnalysis {
  intent: QueryIntent
  confidence: number
  entities: {
    priceRange?: { min?: number; max?: number }
    location?: string[]
    propertyType?: string
    bedrooms?: number
    bathrooms?: number
    features?: string[]
  }
  suggestedActions: string[]
}

export interface PropertyComparison {
  properties: Property[]
  strengths: { [propertyId: string]: string[] }
  weaknesses: { [propertyId: string]: string[] }
  recommendation: string
  scores: { [propertyId: string]: number }
}

export interface MarketInsight {
  summary: string
  trends: string[]
  opportunities: string[]
  risks: string[]
  averageMetrics: {
    price: number
    capRate: number
    roi: number
    pricePerSqft: number
  }
}

export interface PortfolioHealth {
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  metrics: {
    totalValue: number
    avgCapRate: number
    avgROI: number
    diversificationScore: number
    riskScore: number
  }
}

export class AIConciergeService {
  private static instance: AIConciergeService
  
  static getInstance(): AIConciergeService {
    if (!AIConciergeService.instance) {
      AIConciergeService.instance = new AIConciergeService()
    }
    return AIConciergeService.instance
  }

  async analyzeQuery(
    query: string,
    context: {
      properties: Property[]
      userPreferences: UserPreferences
      conversationHistory: ConversationMessage[]
    }
  ): Promise<QueryAnalysis> {
    const prompt = spark.llmPrompt`You are an AI real estate concierge. Analyze the user's query and determine their intent.

User Query: "${query}"

Conversation History: ${context.conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}

User Preferences: ${JSON.stringify(context.userPreferences)}

Available Properties: ${context.properties.length} properties

Analyze this query and return a JSON object with:
- intent: one of [property-search, comparison, market-analysis, investment-advice, portfolio-health, document-query, financial-calculation, general-question]
- confidence: number between 0-1
- entities: extracted entities like priceRange, location, bedrooms, bathrooms, features
- suggestedActions: array of 2-3 helpful next steps as short phrases

Return ONLY valid JSON, no markdown or explanation.`

    try {
      const response = await spark.llm(prompt, 'gpt-4o-mini', true)
      const analysis = JSON.parse(response)
      return analysis
    } catch (error) {
      return {
        intent: 'general-question',
        confidence: 0.5,
        entities: {},
        suggestedActions: ['Browse properties', 'View market overview', 'Check portfolio']
      }
    }
  }

  async searchProperties(
    query: string,
    properties: Property[],
    preferences: UserPreferences
  ): Promise<{ properties: Property[]; explanation: string }> {
    const prompt = spark.llmPrompt`You are a real estate search assistant. Find properties matching the user's natural language query.

User Query: "${query}"

User Preferences: ${JSON.stringify(preferences)}

Available Properties:
${properties.map(p => `ID: ${p.id}
Title: ${p.title}
Location: ${p.city}, ${p.state}
Price: $${p.price.toLocaleString()}
Beds: ${p.bedrooms}, Baths: ${p.bathrooms}
Sqft: ${p.sqft}
Cap Rate: ${p.capRate || 'N/A'}%
ROI: ${p.roi || 'N/A'}%
Year Built: ${p.yearBuilt}
Curated: ${p.isCurated}`).join('\n\n')}

Return a JSON object with:
- propertyIds: array of property IDs that match the query (up to 5)
- explanation: a conversational explanation of why these properties match (2-3 sentences)

Return ONLY valid JSON.`

    try {
      const response = await spark.llm(prompt, 'gpt-4o-mini', true)
      const result = JSON.parse(response)
      
      const matchedProperties = properties.filter(p => 
        result.propertyIds.includes(p.id)
      )

      return {
        properties: matchedProperties,
        explanation: result.explanation
      }
    } catch (error) {
      return {
        properties: [],
        explanation: 'I had trouble understanding that query. Could you try rephrasing it?'
      }
    }
  }

  async compareProperties(
    propertyIds: string[],
    allProperties: Property[]
  ): Promise<PropertyComparison> {
    const properties = allProperties.filter(p => propertyIds.includes(p.id))
    
    if (properties.length < 2) {
      throw new Error('Need at least 2 properties to compare')
    }

    const prompt = spark.llmPrompt`You are a real estate investment analyst. Compare these properties comprehensively.

Properties to Compare:
${properties.map(p => `
Property: ${p.title}
Location: ${p.city}, ${p.state}
Price: $${p.price.toLocaleString()}
Size: ${p.bedrooms}BR/${p.bathrooms}BA, ${p.sqft} sqft
Cap Rate: ${p.capRate || 'N/A'}%
ROI: ${p.roi || 'N/A'}%
Year Built: ${p.yearBuilt}
Price/sqft: $${Math.round(p.price / p.sqft)}
Current Rent: $${p.currentRent?.toLocaleString() || 'N/A'}
Projected Rent: $${p.projectedRent?.toLocaleString() || 'N/A'}
Curated: ${p.isCurated}
Compliance Flags: ${p.complianceFlags.length}
`).join('\n---\n')}

Provide a comprehensive comparison. Return a JSON object with:
- strengths: object mapping property IDs to array of 3-4 strength bullets
- weaknesses: object mapping property IDs to array of 2-3 weakness bullets
- recommendation: 2-3 sentence recommendation on which property is best and why
- scores: object mapping property IDs to overall score 0-100

Be specific and data-driven. Return ONLY valid JSON.`

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const comparison = JSON.parse(response)
      
      return {
        ...comparison,
        properties
      }
    } catch (error) {
      const fallback: PropertyComparison = {
        properties,
        strengths: {},
        weaknesses: {},
        recommendation: 'Unable to generate detailed comparison at this time.',
        scores: {}
      }
      
      properties.forEach(p => {
        fallback.strengths[p.id] = ['Quality property']
        fallback.weaknesses[p.id] = ['Needs analysis']
        fallback.scores[p.id] = 50
      })
      
      return fallback
    }
  }

  async generateMarketAnalysis(
    properties: Property[],
    location?: string
  ): Promise<MarketInsight> {
    const relevantProperties = location 
      ? properties.filter(p => 
          p.city.toLowerCase().includes(location.toLowerCase()) ||
          p.state.toLowerCase().includes(location.toLowerCase())
        )
      : properties

    if (relevantProperties.length === 0) {
      return {
        summary: `No properties found${location ? ` in ${location}` : ''}.`,
        trends: [],
        opportunities: [],
        risks: [],
        averageMetrics: {
          price: 0,
          capRate: 0,
          roi: 0,
          pricePerSqft: 0
        }
      }
    }

    const avgPrice = relevantProperties.reduce((sum, p) => sum + p.price, 0) / relevantProperties.length
    const avgCapRate = relevantProperties.filter(p => p.capRate).reduce((sum, p) => sum + (p.capRate || 0), 0) / relevantProperties.filter(p => p.capRate).length || 0
    const avgROI = relevantProperties.filter(p => p.roi).reduce((sum, p) => sum + (p.roi || 0), 0) / relevantProperties.filter(p => p.roi).length || 0
    const avgPricePerSqft = relevantProperties.reduce((sum, p) => sum + (p.price / p.sqft), 0) / relevantProperties.length

    const prompt = spark.llmPrompt`You are a real estate market analyst. Analyze this market data and provide insights.

${location ? `Location: ${location}` : 'Overall Market'}
Number of Properties: ${relevantProperties.length}
Average Price: $${Math.round(avgPrice).toLocaleString()}
Average Cap Rate: ${avgCapRate.toFixed(2)}%
Average ROI: ${avgROI.toFixed(2)}%
Average Price/sqft: $${Math.round(avgPricePerSqft)}

Property Distribution:
${relevantProperties.slice(0, 20).map(p => `- ${p.title} in ${p.city}: $${(p.price / 1000000).toFixed(2)}M, ${p.bedrooms}BR, ${p.yearBuilt}, Cap: ${p.capRate || 'N/A'}%`).join('\n')}

Return a JSON object with:
- summary: 2-3 sentence market overview
- trends: array of 3-4 current market trends
- opportunities: array of 2-3 investment opportunities
- risks: array of 2-3 potential risks or concerns
- averageMetrics: object with price, capRate, roi, pricePerSqft (use the values provided above)

Be insightful and actionable. Return ONLY valid JSON.`

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analysis = JSON.parse(response)
      
      return {
        ...analysis,
        averageMetrics: {
          price: avgPrice,
          capRate: avgCapRate,
          roi: avgROI,
          pricePerSqft: avgPricePerSqft
        }
      }
    } catch (error) {
      return {
        summary: `Analysis of ${relevantProperties.length} properties${location ? ` in ${location}` : ''}.`,
        trends: ['Market data available for analysis'],
        opportunities: ['Multiple investment options available'],
        risks: ['Standard market risks apply'],
        averageMetrics: {
          price: avgPrice,
          capRate: avgCapRate,
          roi: avgROI,
          pricePerSqft: avgPricePerSqft
        }
      }
    }
  }

  async analyzePortfolioHealth(
    portfolio: Property[]
  ): Promise<PortfolioHealth> {
    if (portfolio.length === 0) {
      return {
        overallScore: 0,
        strengths: [],
        weaknesses: ['No properties in portfolio yet'],
        recommendations: ['Start by exploring available properties', 'Consider your investment goals'],
        metrics: {
          totalValue: 0,
          avgCapRate: 0,
          avgROI: 0,
          diversificationScore: 0,
          riskScore: 0
        }
      }
    }

    const totalValue = portfolio.reduce((sum, p) => sum + p.price, 0)
    const avgCapRate = portfolio.filter(p => p.capRate).reduce((sum, p) => sum + (p.capRate || 0), 0) / portfolio.filter(p => p.capRate).length || 0
    const avgROI = portfolio.filter(p => p.roi).reduce((sum, p) => sum + (p.roi || 0), 0) / portfolio.filter(p => p.roi).length || 0
    
    const cities = new Set(portfolio.map(p => p.city))
    const diversificationScore = Math.min((cities.size / portfolio.length) * 100, 100)
    
    const urgentFlags = portfolio.reduce((sum, p) => sum + p.complianceFlags.filter(f => f.severity === 'URGENT').length, 0)
    const riskScore = Math.min((urgentFlags / portfolio.length) * 100, 100)

    const prompt = spark.llmPrompt`You are a portfolio management advisor. Analyze this real estate portfolio comprehensively.

Portfolio Summary:
Total Properties: ${portfolio.length}
Total Value: $${(totalValue / 1000000).toFixed(2)}M
Average Cap Rate: ${avgCapRate.toFixed(2)}%
Average ROI: ${avgROI.toFixed(2)}%
Geographic Diversification: ${cities.size} cities
Compliance Issues: ${urgentFlags} urgent flags

Properties:
${portfolio.map(p => `- ${p.title} in ${p.city}: $${(p.price / 1000000).toFixed(2)}M, Cap: ${p.capRate || 'N/A'}%, Flags: ${p.complianceFlags.length}`).join('\n')}

Return a JSON object with:
- overallScore: portfolio health score 0-100
- strengths: array of 3-5 portfolio strengths
- weaknesses: array of 2-4 portfolio weaknesses or areas for improvement
- recommendations: array of 3-5 specific actionable recommendations

Be thorough and strategic. Return ONLY valid JSON.`

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analysis = JSON.parse(response)
      
      return {
        ...analysis,
        metrics: {
          totalValue,
          avgCapRate,
          avgROI,
          diversificationScore,
          riskScore
        }
      }
    } catch (error) {
      return {
        overallScore: 70,
        strengths: [`Portfolio of ${portfolio.length} properties`, `Total value of $${(totalValue / 1000000).toFixed(2)}M`],
        weaknesses: ['Needs detailed analysis'],
        recommendations: ['Review individual property performance', 'Consider diversification'],
        metrics: {
          totalValue,
          avgCapRate,
          avgROI,
          diversificationScore,
          riskScore
        }
      }
    }
  }

  async answerQuestion(
    question: string,
    context: {
      properties: Property[]
      portfolio: Property[]
      preferences: UserPreferences
      conversationHistory: ConversationMessage[]
    }
  ): Promise<string> {
    const prompt = spark.llmPrompt`You are an expert AI real estate concierge. Answer the user's question helpfully and conversationally.

User Question: "${question}"

Recent Conversation:
${context.conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}

Context:
- Available Properties: ${context.properties.length}
- User Portfolio: ${context.portfolio.length} properties
- User Preferences: ${JSON.stringify(context.preferences)}

Portfolio Summary:
${context.portfolio.length > 0 ? context.portfolio.map(p => `- ${p.title} in ${p.city}: $${(p.price / 1000000).toFixed(2)}M`).join('\n') : 'No properties yet'}

Provide a helpful, conversational response (2-4 sentences). Be specific and reference actual data when relevant. Return just the text response, no JSON.`

    try {
      const response = await spark.llm(prompt, 'gpt-4o-mini', false)
      return response
    } catch (error) {
      return "I'm having trouble processing that right now. Could you try asking in a different way?"
    }
  }

  async generateQuickActions(
    properties: Property[],
    portfolio: Property[],
    preferences: UserPreferences
  ): Promise<Array<{ label: string; action: string; icon: string }>> {
    const actions: Array<{ label: string; action: string; icon: string }> = []

    if (properties.length > 0) {
      actions.push({
        label: 'Find properties under $2M',
        action: 'search:price<2000000',
        icon: 'search'
      })

      const preferredCity = preferences.preferredCities[0]
      if (preferredCity) {
        actions.push({
          label: `Show ${preferredCity} properties`,
          action: `search:location:${preferredCity}`,
          icon: 'map-pin'
        })
      }

      const highROI = properties.filter(p => p.roi && p.roi > 10)
      if (highROI.length > 0) {
        actions.push({
          label: 'High ROI opportunities',
          action: 'search:roi>10',
          icon: 'trending-up'
        })
      }
    }

    if (portfolio.length > 0) {
      actions.push({
        label: 'Check portfolio health',
        action: 'analyze:portfolio',
        icon: 'heart'
      })

      const expiringLeases = portfolio.filter(p => {
        if (!p.leaseEndDate) return false
        const days = Math.floor((new Date(p.leaseEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return days > 0 && days <= 90
      })

      if (expiringLeases.length > 0) {
        actions.push({
          label: `${expiringLeases.length} leases expiring soon`,
          action: 'view:expiring-leases',
          icon: 'alert-triangle'
        })
      }
    }

    actions.push({
      label: 'Market overview',
      action: 'analyze:market',
      icon: 'bar-chart'
    })

    actions.push({
      label: 'Compare properties',
      action: 'compare:properties',
      icon: 'git-compare'
    })

    return actions.slice(0, 6)
  }

  calculateInvestmentProjection(
    property: Property,
    projectedRent: number,
    years: number = 5
  ): {
    yearlyProjections: Array<{
      year: number
      rent: number
      appreciation: number
      equity: number
      cashFlow: number
      totalReturn: number
    }>
    summary: {
      totalCashFlow: number
      totalAppreciation: number
      totalReturn: number
      avgAnnualReturn: number
    }
  } {
    const appreciationRate = 0.03
    const maintenanceRate = 0.01
    const downPayment = property.price * 0.25
    const loanAmount = property.price * 0.75
    const interestRate = 0.065
    const monthlyPayment = (loanAmount * (interestRate / 12) * Math.pow(1 + interestRate / 12, 360)) / (Math.pow(1 + interestRate / 12, 360) - 1)
    
    const yearlyProjections: Array<{
      year: number
      rent: number
      appreciation: number
      equity: number
      cashFlow: number
      totalReturn: number
    }> = []
    let cumulativeAppreciation = 0
    let cumulativeCashFlow = 0

    for (let year = 1; year <= years; year++) {
      const rentIncome = projectedRent * 12 * Math.pow(1.02, year - 1)
      const propertyValue = property.price * Math.pow(1 + appreciationRate, year)
      const appreciation = propertyValue - property.price
      const maintenance = propertyValue * maintenanceRate
      const annualDebt = monthlyPayment * 12
      const cashFlow = rentIncome - annualDebt - maintenance

      const remainingBalance = loanAmount * (Math.pow(1 + interestRate / 12, 360) - Math.pow(1 + interestRate / 12, year * 12)) / (Math.pow(1 + interestRate / 12, 360) - 1)
      const equity = propertyValue - remainingBalance

      cumulativeAppreciation = appreciation
      cumulativeCashFlow += cashFlow

      yearlyProjections.push({
        year,
        rent: rentIncome,
        appreciation: cumulativeAppreciation,
        equity,
        cashFlow,
        totalReturn: cumulativeCashFlow + cumulativeAppreciation
      })
    }

    const totalReturn = cumulativeCashFlow + cumulativeAppreciation
    const avgAnnualReturn = (totalReturn / downPayment / years) * 100

    return {
      yearlyProjections,
      summary: {
        totalCashFlow: cumulativeCashFlow,
        totalAppreciation: cumulativeAppreciation,
        totalReturn,
        avgAnnualReturn
      }
    }
  }
}

export const aiConciergeService = AIConciergeService.getInstance()
