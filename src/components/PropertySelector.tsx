import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Property } from '@/lib/types'
import { Check, Camera, ArrowLeftRight, X, Search, Sparkles, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { Slider } from './ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { soundManager } from '@/lib/sound-manager'

interface PropertySelectorProps {
  properties: Property[]
  mode: 'ar' | 'comparison'
  maxSelection: number
  onConfirm: (selectedProperties: Property[]) => void
  onClose: () => void
}

interface FilterState {
  priceRange: [number, number]
  bedrooms: number | null
  bathrooms: number | null
  location: string
}

export function PropertySelector({ 
  properties, 
  mode, 
  maxSelection,
  onConfirm, 
  onClose 
}: PropertySelectorProps) {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const maxPrice = Math.max(...properties.map(p => p.price))
  const minPrice = Math.min(...properties.map(p => p.price))
  
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [minPrice, maxPrice],
    bedrooms: null,
    bathrooms: null,
    location: ''
  })

  const uniqueLocations = Array.from(new Set(
    properties.map(p => `${p.city}, ${p.state}`)
  )).sort()

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPrice = 
      property.price >= filters.priceRange[0] && 
      property.price <= filters.priceRange[1]
    
    const matchesBedrooms = 
      filters.bedrooms === null || property.bedrooms === filters.bedrooms
    
    const matchesBathrooms = 
      filters.bathrooms === null || property.bathrooms === filters.bathrooms
    
    const matchesLocation = 
      filters.location === '' || 
      filters.location === 'all' ||
      `${property.city}, ${property.state}` === filters.location

    return matchesSearch && matchesPrice && matchesBedrooms && matchesBathrooms && matchesLocation
  })

  const activeFiltersCount = [
    filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice,
    filters.bedrooms !== null,
    filters.bathrooms !== null,
    filters.location !== '' && filters.location !== 'all'
  ].filter(Boolean).length

  const resetFilters = () => {
    setFilters({
      priceRange: [minPrice, maxPrice],
      bedrooms: null,
      bathrooms: null,
      location: ''
    })
    soundManager.play('glassTap')
  }

  const toggleProperty = (property: Property) => {
    soundManager.play('glassTap')
    
    setSelectedProperties(prev => {
      const isSelected = prev.find(p => p.id === property.id)
      
      if (isSelected) {
        return prev.filter(p => p.id !== property.id)
      } else if (prev.length < maxSelection) {
        return [...prev, property]
      }
      
      return prev
    })
  }

  const handleConfirm = () => {
    if (selectedProperties.length === maxSelection) {
      soundManager.play('success')
      onConfirm(selectedProperties)
    }
  }

  const isSelected = (propertyId: string) => 
    selectedProperties.some(p => p.id === propertyId)

  const getSelectionNumber = (propertyId: string) => 
    selectedProperties.findIndex(p => p.id === propertyId) + 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-5xl h-full max-h-[90vh] flex flex-col bg-card/95 backdrop-blur-2xl border-border/40">
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <div className="flex items-center gap-4">
            {mode === 'ar' ? (
              <Camera className="w-6 h-6 text-rose-blush dark:text-moonlit-lavender" />
            ) : (
              <ArrowLeftRight className="w-6 h-6 text-rose-blush dark:text-moonlit-lavender" />
            )}
            <div>
              <h2 className="text-2xl font-serif text-foreground">
                {mode === 'ar' ? 'Select Property for AR View' : 'Select Properties to Compare'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'ar' 
                  ? 'Choose a property to visualize in augmented reality'
                  : `Select ${maxSelection} properties to compare side by side`
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-rose-blush/10 dark:hover:bg-moonlit-lavender/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="px-6 py-4 border-b border-border/40 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, city, state, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-24"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowFilters(!showFilters)
                soundManager.play('glassTap')
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-rose-blush dark:bg-moonlit-lavender text-white px-1.5 py-0 text-xs min-w-[20px]">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <Card className="p-4 bg-muted/30 border-border/40">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground">Advanced Filters</h3>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetFilters}
                          className="text-xs h-7"
                        >
                          Reset All
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                        <span>Price Range</span>
                        <span className="text-foreground font-semibold">
                          ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
                        </span>
                      </label>
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => setFilters({ ...filters, priceRange: value as [number, number] })}
                        min={minPrice}
                        max={maxPrice}
                        step={10000}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Bedrooms</label>
                        <Select
                          value={filters.bedrooms?.toString() || 'all'}
                          onValueChange={(value) => {
                            soundManager.play('glassTap')
                            setFilters({ 
                              ...filters, 
                              bedrooms: value === 'all' ? null : parseInt(value) 
                            })
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            {Array.from(new Set(properties.map(p => p.bedrooms))).sort((a, b) => a - b).map(beds => (
                              <SelectItem key={beds} value={beds.toString()}>
                                {beds} {beds === 1 ? 'bed' : 'beds'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Bathrooms</label>
                        <Select
                          value={filters.bathrooms?.toString() || 'all'}
                          onValueChange={(value) => {
                            soundManager.play('glassTap')
                            setFilters({ 
                              ...filters, 
                              bathrooms: value === 'all' ? null : parseInt(value) 
                            })
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            {Array.from(new Set(properties.map(p => p.bathrooms))).sort((a, b) => a - b).map(baths => (
                              <SelectItem key={baths} value={baths.toString()}>
                                {baths} {baths === 1 ? 'bath' : 'baths'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Location</label>
                      <Select
                        value={filters.location || 'all'}
                        onValueChange={(value) => {
                          soundManager.play('glassTap')
                          setFilters({ 
                            ...filters, 
                            location: value === 'all' ? '' : value 
                          })
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All locations</SelectItem>
                          {uniqueLocations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                  isSelected={isSelected(property.id)}
                  selectionNumber={getSelectionNumber(property.id)}
                  onToggle={() => toggleProperty(property)}
                  disabled={!isSelected(property.id) && selectedProperties.length >= maxSelection}
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredProperties.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <Search className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No properties found matching your search</p>
            </motion.div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between p-6 border-t border-border/40 bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {selectedProperties.length} of {maxSelection} selected
            </div>
            {filteredProperties.length !== properties.length && (
              <Badge variant="secondary" className="text-xs">
                {filteredProperties.length} of {properties.length} showing
              </Badge>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedProperties.length !== maxSelection}
              className="bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
            >
              {mode === 'ar' ? 'Open AR View' : 'Compare Properties'}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

interface PropertyCardProps {
  property: Property
  index: number
  isSelected: boolean
  selectionNumber: number
  onToggle: () => void
  disabled: boolean
}

function PropertyCard({ 
  property, 
  index, 
  isSelected, 
  selectionNumber, 
  onToggle,
  disabled 
}: PropertyCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        layout: { duration: 0.3 }
      }}
    >
      <motion.button
        onClick={onToggle}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`
          relative w-full rounded-xl overflow-hidden text-left transition-all duration-300
          ${isSelected 
            ? 'ring-2 ring-rose-blush dark:ring-moonlit-lavender ring-offset-2 ring-offset-background' 
            : 'hover:ring-2 hover:ring-border/50'
          }
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="relative aspect-[4/3]">
          <img
            src={property.imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-semibold text-sm">
                  {selectionNumber}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {property.isCurated && (
            <Badge className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white border-white/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Curated
            </Badge>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
            <h3 className="text-white font-serif font-semibold text-lg line-clamp-1">
              {property.title}
            </h3>
            <p className="text-white/80 text-sm">
              {property.city}, {property.state}
            </p>
            <p className="text-white font-semibold text-xl">
              ${property.price.toLocaleString()}
            </p>
            <p className="text-white/70 text-xs">
              {property.bedrooms} bed • {property.bathrooms} bath • {property.sqft.toLocaleString()} sq ft
            </p>
          </div>
        </div>

        <div 
          className={`
            absolute inset-0 pointer-events-none transition-opacity duration-300
            ${isSelected ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div className="absolute inset-0 bg-rose-blush/10 dark:bg-moonlit-lavender/10" />
        </div>
      </motion.button>
    </motion.div>
  )
}
