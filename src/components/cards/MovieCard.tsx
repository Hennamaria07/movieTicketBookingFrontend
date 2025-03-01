import { useState } from "react"
import { motion } from "framer-motion"
import { AiFillHeart, AiOutlineHeart, AiOutlineClockCircle } from "react-icons/ai"
import { BiCameraMovie } from "react-icons/bi"
import { Star } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"
import { Movie } from "../../types/movie"
import { BookingModal } from "../modals/BookingModal"

interface MovieCardProps {
  movie: Movie
  variant?: 'default' | 'simple'
  onBook?: () => void
  className?: string
}

export const MovieCard = ({ 
  movie, 
  variant = 'default',
  onBook,
  className 
}: MovieCardProps) => {
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const handleBookClick = () => {
    if (onBook) {
      onBook()
    } else {
      setIsBookingOpen(true)
    }
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        whileHover={variant === 'simple' ? { y: -5 } : undefined}
        className={cn(
          "group relative bg-card rounded-lg overflow-hidden",
          className
        )}
      >
        <div className="aspect-[3/4] relative w-full">
          <img 
            src={movie.poster} 
            alt={movie.title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
          {variant === 'default' && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 flex items-center justify-center">
                <Button 
                  onClick={handleBookClick}
                  size="sm"
                  className="sm:text-base text-sm"
                >
                  Book Now
                </Button>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsWatchlisted(!isWatchlisted)}
            className="absolute top-2 right-2 p-1.5 sm:p-2 rounded-full bg-black/20 backdrop-blur-sm text-white"
          >
            {isWatchlisted ? (
              <AiFillHeart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            ) : (
              <AiOutlineHeart className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
        </div>
        <div className="p-2 sm:p-4">
          <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-1">
            {movie.title}
          </h3>
          {variant === 'default' ? (
            <>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                <BiCameraMovie className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="line-clamp-1">{movie.genre.join(', ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <AiOutlineClockCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{movie.duration}</span>
                </div>
                <div className="text-xs sm:text-sm font-medium">
                  ⭐ {movie.rating}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <span className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" /> {movie.rating}
                </span>
                <span>•</span>
                <span>{movie.duration}</span>
              </div>
              <Button className="w-full" onClick={handleBookClick}>
                Book Now
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {!onBook && (
        <BookingModal 
          movie={movie}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </>
  )
} 