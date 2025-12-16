import { useEffect, useState } from 'react'
import { marketDataService, MarketData, MarketTicker, MarketConfig } from '@/lib/market-data'

export function useMarketData(propertyId: string) {
  const [marketData, setMarketData] = useState<MarketData | undefined>(
    marketDataService.getMarketData(propertyId)
  )

  useEffect(() => {
    const unsubscribe = marketDataService.subscribe(propertyId, setMarketData)
    return unsubscribe
  }, [propertyId])

  return marketData
}

export function useMarketTickers() {
  const [tickers, setTickers] = useState<MarketTicker[]>(
    marketDataService.getMarketTickers()
  )

  useEffect(() => {
    const unsubscribe = marketDataService.subscribeTickers(setTickers)
    return unsubscribe
  }, [])

  return tickers
}

export function useMarketConfig() {
  const [config, setConfig] = useState<MarketConfig>(
    marketDataService.getConfig()
  )

  useEffect(() => {
    const unsubscribe = marketDataService.subscribeConfig(setConfig)
    return unsubscribe
  }, [])

  return config
}
