import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Play, Calendar, Clock, ChevronRight, 
   Users, MessageCircle, Copy, Check 
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"
import { Movie, Offer } from "../../types/movie"
import { nowShowingMovies, comingSoonMovies, offers, bannerImages } from "../../data/mockData"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltips"
import { Skeleton } from "../../components/ui/skeleton"
import { MovieCard } from "../../components/cards/MovieCard"

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.5 }
}

const Home = () => {
  const [loading, setLoading] = useState(true)
  const [activeMovies, setActiveMovies] = useState<Movie[]>([])
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([])
  const [currentOffers, setCurrentOffers] = useState<Offer[]>([])
  const navigate = useNavigate()
  const [imagesLoaded, setImagesLoaded] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setActiveMovies(nowShowingMovies)
        setUpcomingMovies(comingSoonMovies)
        setCurrentOffers(offers)
      } catch {
        toast.error("Failed to fetch movies and offers")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      try {
        await Promise.all(
          bannerImages.map((image) => {
            return new Promise((resolve, reject) => {
              const img = new Image()
              img.src = `https://image.tmdb.org/t/p/original${image.backdropPath}`
              img.onload = resolve
              img.onerror = reject
            })
          })
        )
        setImagesLoaded(true)
      } catch (error) {
        console.error('Failed to load banner images:', error)
        setImagesLoaded(true) // Show banner anyway
      }
    }

    loadImages()
  }, [])

  const handleBooking = (movieId: string) => {
    navigate(`/booking/${movieId}`)
  }


  const handleCreateParty = () => {
    navigate("/watch-party/create")
  }

  const handleClaimOffer = (offer: Offer) => {
    toast.success("Offer Claimed!", {
      description: `You've claimed ${offer.title}`
    })
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Hero Section */}
      <section className="relative h-[500px] -mt-6 -mx-6 overflow-hidden">
        {/* Movie Backdrop Slider */}
        <AnimatePresence>
          {imagesLoaded && (
            <div className="absolute inset-0">
              {bannerImages.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  className="absolute inset-0"
                  initial={{ opacity: index === 0 ? 1 : 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    scale: [1.1, 1, 1, 1.1]
                  }}
                  transition={{
                    duration: 8,
                    delay: index * 8,
                    repeat: Infinity,
                    repeatDelay: (bannerImages.length - 1) * 8,
                    ease: "easeInOut"
                  }}
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/original${movie.backdropPath}`}
                    alt={movie.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Floating Movie Elements */}
        <div className="absolute inset-0">
          {bannerImages.map((movie, i) => (
            <motion.div
              key={movie.id}
              className="absolute w-32 h-48 rounded-lg overflow-hidden shadow-2xl"
              style={{
                left: `${20 + i * 30}%`,
                top: '20%',
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
          ))}
        </div>

        {/* Animated Circles */}
        <div className="absolute inset-0">
          {[1, 2, 3, 4].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2 border-white/20"
              style={{
                width: `${100 + i * 40}px`,
                height: `${100 + i * 40}px`,
                left: `${70 + i * 5}%`,
                top: `${30 + i * 5}%`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Sparkles */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-4"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              Experience Movies Like Never Before
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Book your tickets for the latest movies and enjoy exclusive offers
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-white/90 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Book Now <Play className="ml-2 h-4 w-4" />
                </span>
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Now Showing Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Now Showing</h2>
          <Button variant="ghost" onClick={() => navigate("/movies")}>
            View All <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="wait">
            {loading ? (
              // Add loading skeletons here
              Array(4).fill(0).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))
            ) : (
              activeMovies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  variant="simple" 
                  onBook={() => handleBooking(movie.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Coming Soon</h2>
          <Button variant="ghost">
            View All <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((movie) => (
            <ComingSoonCard key={movie} />
          ))}
        </div>
      </section>

      {/* Offers Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Exclusive Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <OfferCardSkeleton key={i} />
              ))
            ) : (
              currentOffers.map((offer) => (
                <OfferCard 
                  key={offer.id} 
                  offer={offer}
                  onClaim={() => handleClaimOffer(offer)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Social Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          className="bg-card p-6 rounded-lg space-y-4"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5" /> Watch Party
          </h3>
          <p className="text-muted-foreground">
            Invite friends and enjoy movies together. Create your watch party now!
          </p>
          <Button variant="outline" onClick={handleCreateParty}>
            Create Party
          </Button>
        </motion.div>
        <div className="bg-card p-6 rounded-lg space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" /> Movie Discussions
          </h3>
          <p className="text-muted-foreground">
            Join the conversation about your favorite movies and discover new ones.
          </p>
          <Button variant="outline">Join Discussion</Button>
        </div>
      </section>
    </div>
  )
}

const MovieCardSkeleton = () => (
  <div className="bg-card rounded-lg overflow-hidden">
    <Skeleton className="aspect-[2/3] w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
)

const ComingSoonCard = () => (
  <motion.div 
    className="group relative bg-card rounded-lg overflow-hidden"
    whileHover={{ y: -5 }}
  >
    <div className="aspect-[2/3] bg-muted" />
    <div className="p-4">
      <h3 className="font-semibold mb-1">Upcoming Movie</h3>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <span className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" /> Dec 25
        </span>
        <span>•</span>
        <span className="flex items-center">
          <Clock className="h-4 w-4 mr-1" /> 2h 15m
        </span>
      </div>
      <Button variant="outline" className="w-full">Notify Me</Button>
    </div>
  </motion.div>
)

interface OfferCardProps {
  offer: Offer
  onClaim: () => void
}

const OfferCard = ({ offer, onClaim }: OfferCardProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(offer.code)
    setCopied(true)
    toast.success("Code Copied!", {
      description: "Paste the code at checkout"
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div 
      className={cn(
        "bg-gradient-to-r p-6 rounded-lg text-white",
        offer.gradient
      )}
      whileHover={{ scale: 1.02 }}
    >
      <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
      <p className="text-white/80 mb-4">{offer.description}</p>
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30"
                onClick={handleCopyCode}
              >
                {offer.code}
                {copied ? (
                  <Check className="ml-2 h-4 w-4" />
                ) : (
                  <Copy className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to copy code</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button 
          variant="secondary" 
          className="bg-white/20 hover:bg-white/30"
          onClick={onClaim}
        >
          Claim
        </Button>
      </div>
    </motion.div>
  )
}

const OfferCardSkeleton = () => (
  <div className="bg-card rounded-lg p-6 space-y-3">
    <Skeleton className="h-6 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
)

export default Home
