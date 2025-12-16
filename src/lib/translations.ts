export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ar' | 'ru'

export interface TranslationStrings {
  patternDetected: string
  pattern: string
  confidence: string
  volatility: string
  volume: string
  time: string
  marketAlert: string
  patternDetails: string
  priceChange: string
}

const translations: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    patternDetected: 'pattern detected',
    pattern: 'Pattern',
    confidence: 'Confidence',
    volatility: 'Volatility',
    volume: 'Volume',
    time: 'Time',
    marketAlert: 'Market Alert',
    patternDetails: 'Pattern Details',
    priceChange: 'Price Change'
  },
  es: {
    patternDetected: 'patrón detectado',
    pattern: 'Patrón',
    confidence: 'Confianza',
    volatility: 'Volatilidad',
    volume: 'Volumen',
    time: 'Hora',
    marketAlert: 'Alerta de Mercado',
    patternDetails: 'Detalles del Patrón',
    priceChange: 'Cambio de Precio'
  },
  fr: {
    patternDetected: 'motif détecté',
    pattern: 'Motif',
    confidence: 'Confiance',
    volatility: 'Volatilité',
    volume: 'Volume',
    time: 'Heure',
    marketAlert: 'Alerte de Marché',
    patternDetails: 'Détails du Motif',
    priceChange: 'Variation de Prix'
  },
  de: {
    patternDetected: 'Muster erkannt',
    pattern: 'Muster',
    confidence: 'Vertrauen',
    volatility: 'Volatilität',
    volume: 'Volumen',
    time: 'Zeit',
    marketAlert: 'Marktwarnung',
    patternDetails: 'Musterdetails',
    priceChange: 'Preisänderung'
  },
  it: {
    patternDetected: 'schema rilevato',
    pattern: 'Schema',
    confidence: 'Confidenza',
    volatility: 'Volatilità',
    volume: 'Volume',
    time: 'Ora',
    marketAlert: 'Allerta di Mercato',
    patternDetails: 'Dettagli dello Schema',
    priceChange: 'Variazione di Prezzo'
  },
  pt: {
    patternDetected: 'padrão detectado',
    pattern: 'Padrão',
    confidence: 'Confiança',
    volatility: 'Volatilidade',
    volume: 'Volume',
    time: 'Hora',
    marketAlert: 'Alerta de Mercado',
    patternDetails: 'Detalhes do Padrão',
    priceChange: 'Mudança de Preço'
  },
  zh: {
    patternDetected: '检测到模式',
    pattern: '模式',
    confidence: '置信度',
    volatility: '波动性',
    volume: '交易量',
    time: '时间',
    marketAlert: '市场警报',
    patternDetails: '模式详情',
    priceChange: '价格变动'
  },
  ja: {
    patternDetected: 'パターンを検出',
    pattern: 'パターン',
    confidence: '信頼度',
    volatility: 'ボラティリティ',
    volume: '出来高',
    time: '時刻',
    marketAlert: '市場アラート',
    patternDetails: 'パターン詳細',
    priceChange: '価格変動'
  },
  ar: {
    patternDetected: 'تم اكتشاف النمط',
    pattern: 'النمط',
    confidence: 'الثقة',
    volatility: 'التقلب',
    volume: 'الحجم',
    time: 'الوقت',
    marketAlert: 'تنبيه السوق',
    patternDetails: 'تفاصيل النمط',
    priceChange: 'تغيير السعر'
  },
  ru: {
    patternDetected: 'обнаружен паттерн',
    pattern: 'Паттерн',
    confidence: 'Уверенность',
    volatility: 'Волатильность',
    volume: 'Объем',
    time: 'Время',
    marketAlert: 'Рыночное Оповещение',
    patternDetails: 'Детали Паттерна',
    priceChange: 'Изменение Цены'
  }
}

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ar: 'العربية',
  ru: 'Русский'
}

export function getTranslations(language: SupportedLanguage): TranslationStrings {
  return translations[language] || translations.en
}

export function getSupportedLanguages(): SupportedLanguage[] {
  return Object.keys(translations) as SupportedLanguage[]
}

export function getLanguageName(language: SupportedLanguage): string {
  return languageNames[language] || language
}
