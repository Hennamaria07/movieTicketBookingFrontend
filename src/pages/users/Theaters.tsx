import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  AiOutlineSearch, 
  AiOutlineEnvironment,
  AiOutlineStar,
  AiOutlineHeart,
  AiFillHeart,
  AiOutlinePhone
} from 'react-icons/ai'
import { BiCameraMovie } from 'react-icons/bi'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'
import { Skeleton } from '../../components/ui/skeleton'
import { Badge } from '../../components/ui/badge'
import { VoiceSearchButton } from '../../components/VoiceSearchButton'

interface Theater {
  id: string
  name: string
  location: string
  distance: string
  rating: number
  screens: string[]
  amenities: string[]
  image: string
}

const mockTheaters: Theater[] = [
  {
    id: '1',
    name: 'Cineplex Deluxe',
    location: '123 Movie St, Cinema City',
    distance: '2.5 km',
    rating: 4.5,
    screens: ['IMAX', '3D', 'Dolby Atmos'],
    amenities: ['Parking', 'Food Court', 'Wheelchair Access'],
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c'
  },
  // Add more theaters...
]

const amenityFilters = [
  'IMAX',
  '3D',
  'Dolby Atmos',
  'Parking',
  'Food Court',
  'Wheelchair Access'
]

const Theaters = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const { data: theaters, isLoading } = useQuery({
    queryKey: ['theaters'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockTheaters
    }
  })

  const filteredTheaters = theaters?.filter(theater => {
    const matchesSearch = theater.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      theater.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAmenities = selectedAmenities.length === 0 ||
      selectedAmenities.every(amenity => 
        theater.screens.includes(amenity) || theater.amenities.includes(amenity)
      )
    
    return matchesSearch && matchesAmenities
  })

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  return (
    <div className="max-w-screen min-h-screen pt-4">
      {/* Search Bar */}
      <div className="relative mb-6">
        <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search theaters..."
          className="pl-10 pr-12 bg-card/50 border-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <VoiceSearchButton 
          onTranscript={setSearchQuery}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        />
      </div>

      {/* Amenities and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        <div className="space-y-3">
          <h3 className="font-semibold">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {amenityFilters.map(amenity => (
              <Button
                key={amenity}
                variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAmenity(amenity)}
                className="rounded-full"
              >
                {amenity}
              </Button>
            ))}
          </div>
        </div>

        {/* View Toggle - Only visible on tablet and larger screens */}
        <div className="hidden sm:flex gap-2 justify-end mb-6">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            Grid
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Theaters Grid/List */}
      <div className={cn(
        "grid gap-4 md:gap-6",
        // Mobile: always grid
        "grid-cols-1",
        // Tablet and up: respect view toggle
        view === 'list' 
          ? "sm:grid-cols-1" 
          : "sm:grid-cols-2 lg:grid-cols-3"
      )}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <TheaterCardSkeleton 
                key={i} 
                view={view}
                className="sm:flex-row"
              />
            ))
          ) : (
            filteredTheaters?.map((theater) => (
              <TheaterCard 
                key={theater.id} 
                theater={theater}
                view={view}
                className="sm:flex-row"
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface TheaterCardProps {
  theater: Theater
  view: 'grid' | 'list'
  className?: string
}

const TheaterCard = ({ theater, view, className }: TheaterCardProps) => {
  const [isWatchlisted, setIsWatchlisted] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "group bg-card rounded-lg overflow-hidden",
        view === 'list' && className
      )}
    >
      <div className={cn(
        "relative",
        view === 'grid' ? "aspect-video" : "w-48 shrink-0"
      )}>
        <img 
          src={theater.image} 
          alt={theater.name}
          className="object-cover w-full h-full"
        />
        <button
          onClick={() => setIsWatchlisted(!isWatchlisted)}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white"
        >
          {isWatchlisted ? (
            <AiFillHeart className="h-5 w-5 text-red-500" />
          ) : (
            <AiOutlineHeart className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{theater.name}</h3>
          <div className="flex items-center gap-1 text-yellow-500">
            <AiOutlineStar className="h-4 w-4" />
            <span className="text-sm font-medium">{theater.rating}</span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <AiOutlineEnvironment className="h-4 w-4 shrink-0" />
            <span>{theater.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <BiCameraMovie className="h-4 w-4 shrink-0" />
            <div className="flex flex-wrap gap-1">
              {theater.screens.map(screen => (
                <Badge key={screen} variant="secondary">
                  {screen}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button className="flex-1">View Showtimes</Button>
          <Button variant="outline" size="icon">
            <AiOutlinePhone className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

const TheaterCardSkeleton = ({ view, className }: { 
  view: 'grid' | 'list'
  className?: string 
}) => (
  <div className={cn(
    "bg-card rounded-lg overflow-hidden",
    view === 'list' && className
  )}>
    <Skeleton className={cn(
      view === 'grid' ? "aspect-video w-full" : "w-48 h-full"
    )} />
    <div className="p-4 flex-1 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  </div>
)

export default Theaters 