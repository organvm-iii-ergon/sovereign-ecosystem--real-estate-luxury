import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Property } from '@/lib/types'
import { Home, Maximize, Calendar, DollarSign, TrendingUp, ArrowUpRight, MapPin, Layers } from 'lucide-react'
import { LivePriceDisplay } from './LivePriceDisplay'
import { PriceSparkline } from './PriceSparkline'
import { CuratedBadge } from './CuratedBadge'
import { soundManager } from '@/lib/sound-manager'
import { Badge } from './ui/badge'

interface FlippablePropertyCardProps {
  property: Property
  index: number
}

export function FlippablePropertyCard({ property, index }: FlippablePropertyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    soundManager.play('cardFlip')
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="perspective-1000 w-full h-full">
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1]
        }}
      >
        <CardFront property={property} onFlip={handleFlip} />
        <CardBack property={property} onFlip={handleFlip} />
      </motion.div>
    </div>
  )
}

interface CardSideProps {
  property: Property
  onFlip: () => void
}

function CardFront({ property, onFlip }: CardSideProps) {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full backface-hidden"
      style={{ backfaceVisibility: 'hidden' }}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden bg-card/70 backdrop-blur-2xl shadow-2xl shadow-rose-blush/10 dark:shadow-moonlit-violet/20 border border-border/30 dark:border-border/20">
        {property.isCurated && <CuratedBadge />}

        <div className="relative h-3/5">
          <img
            src={property.imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/40 to-transparent backdrop-blur-[2px]" />
          
          <button
            onClick={onFlip}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 flex items-center justify-center hover:bg-card/90 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-rose-blush/50 dark:focus:ring-moonlit-lavender/50 focus:ring-offset-2 focus:ring-offset-card"
            aria-label="Flip card to see more details"
          >
            <Layers className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-6">
          <div>
            <h2 className="text-4xl font-light text-foreground mb-2 leading-tight tracking-wide">
              {property.title}
            </h2>
            <p className="text-muted-foreground text-lg font-light flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {property.city}, {property.state}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2 font-light">Live Price</p>
                <LivePriceDisplay
                  propertyId={property.id}
                  originalPrice={property.price}
                  size="lg"
                  showTrend={true}
                />
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2 font-light">24h Trend</p>
                <PriceSparkline propertyId={property.id} width={100} height={40} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1 font-light">Yield</p>
                <p className="text-2xl font-light text-foreground">
                  {property.capRate ? `${property.capRate}%` : '—'}
                </p>
              </div>
              <div className="flex gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  <span>{property.bedrooms} bed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="w-5 h-5" />
                  <span>{property.sqft.toLocaleString()} sqft</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CardBack({ property, onFlip }: CardSideProps) {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full backface-hidden"
      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden bg-card/70 backdrop-blur-2xl shadow-2xl shadow-rose-blush/10 dark:shadow-moonlit-violet/20 border border-border/30 dark:border-border/20">
        <button
          onClick={onFlip}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 flex items-center justify-center hover:bg-card/90 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50 transition-all duration-300 hover:scale-110 z-10 focus:outline-none focus:ring-2 focus:ring-rose-blush/50 dark:focus:ring-moonlit-lavender/50 focus:ring-offset-2 focus:ring-offset-card"
          aria-label="Flip card back to front"
        >
          <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-8 h-full overflow-y-auto">
          <h3 className="text-3xl font-light text-foreground mb-6 tracking-wide">Property Details</h3>
          
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-xl border border-border/30 dark:border-border/20">
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-light">Financial Overview</h4>
              <div className="space-y-4">
                <DetailRow
                  icon={<DollarSign className="w-4 h-4" />}
                  label="List Price"
                  value={`$${property.price.toLocaleString()}`}
                />
                <DetailRow
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Current Rent"
                  value={property.currentRent ? `$${property.currentRent.toLocaleString()}/mo` : '—'}
                />
                <DetailRow
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Cap Rate"
                  value={property.capRate ? `${property.capRate}%` : '—'}
                  highlight={true}
                />
                <DetailRow
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Annual ROI"
                  value={property.roi ? `${property.roi}%` : '—'}
                  highlight={true}
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-xl border border-border/30 dark:border-border/20">
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-light">Property Information</h4>
              <div className="space-y-4">
                <DetailRow
                  icon={<Home className="w-4 h-4" />}
                  label="Bedrooms"
                  value={`${property.bedrooms}`}
                />
                <DetailRow
                  icon={<Home className="w-4 h-4" />}
                  label="Bathrooms"
                  value={`${property.bathrooms}`}
                />
                <DetailRow
                  icon={<Maximize className="w-4 h-4" />}
                  label="Square Footage"
                  value={`${property.sqft.toLocaleString()} sqft`}
                />
                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Year Built"
                  value={`${property.yearBuilt}`}
                />
              </div>
            </div>

            {property.complianceFlags && property.complianceFlags.length > 0 && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-xl border border-border/30 dark:border-border/20">
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-light">Compliance Alerts</h4>
                <div className="space-y-2">
                  {property.complianceFlags.map((flag, idx) => (
                    <Badge
                      key={idx}
                      variant={flag.severity === 'URGENT' ? 'destructive' : 'secondary'}
                      className="w-full justify-start text-left py-2 px-3"
                    >
                      <span className="text-xs">{flag.message}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-blush/10 to-rose-gold/10 dark:from-moonlit-violet/10 dark:to-moonlit-lavender/10 backdrop-blur-xl border border-rose-blush/20 dark:border-moonlit-lavender/20">
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-light">Price Performance</h4>
              <PriceSparkline propertyId={property.id} width={280} height={80} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface DetailRowProps {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}

function DetailRow({ icon, label, value, highlight }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm font-medium ${highlight ? 'text-rose-blush dark:text-moonlit-lavender' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  )
}
