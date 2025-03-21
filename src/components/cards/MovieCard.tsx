import { useState } from "react";
import { motion } from "framer-motion";
import { AiFillHeart, AiOutlineHeart, AiOutlineClockCircle } from "react-icons/ai";
import { BiCameraMovie } from "react-icons/bi";
import { Star } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom"; // Added import for navigation

interface Movie {
  id: string;
  title: string;
  genre: string[];
  poster: string;
  rating: number;
  duration: string;
  releaseDate: string;
  showTime?: string; // Made optional as it wasn't in the previous interface
  theater: string;
  screen: string;
  availability: string | number; // Updated to match previous code
  status?: string; // Made optional as it was commented out
}

interface MovieCardProps {
  movie: Movie;
  variant?: "default" | "simple";
  onBook?: () => void;
  className?: string;
}

export const MovieCard = ({
  movie,
  variant = "default",
  onBook,
  className,
}: MovieCardProps) => {
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const navigate = useNavigate(); // Added navigation hook

  const handleBookClick = () => {
    if (onBook) {
      onBook();
    } else {
      navigate(`/booking/${movie.id}`); // Navigate directly to booking page
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={variant === "simple" ? { y: -5 } : undefined}
      className={cn(
        "group relative bg-card rounded-lg overflow-hidden cursor-pointer", // Added cursor-pointer
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
        {variant === "default" && (
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
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigation when clicking watchlist
            setIsWatchlisted(!isWatchlisted);
          }}
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
        {variant === "default" ? (
          <>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
              <BiCameraMovie className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="line-clamp-1">{movie.genre.join(", ")}</span>
            </div>
            <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <AiOutlineClockCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{movie.duration} hr</span>
              </div>
              <div className="flex items-center justify-between">
                <span>
                  {movie.theater} - {movie.screen}
                </span>
                <div className="font-medium">
                  ⭐ {movie.rating}
                </div>
              </div>
              <div>Seats: {movie.availability}</div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" /> {movie.rating}
                </span>
                <span>•</span>
                <span>{movie.duration}</span>
              </div>
              {movie.showTime && (
                <div className="line-clamp-1">
                  {movie.showTime} at {movie.theater}
                </div>
              )}
              <div className="flex justify-between">
                <span>{movie.screen}</span>
                <span>{movie.availability} seats</span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleBookClick}
              disabled={
                movie.status === "sold out" || movie.status === "cancelled"
              }
            >
              Book Now
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};