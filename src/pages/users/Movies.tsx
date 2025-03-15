import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  AiOutlineSearch, 
} from 'react-icons/ai';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../components/ui/skeleton';
import { MovieCard } from "../../components/cards/MovieCard";
import { VoiceSearchButton } from '../../components/VoiceSearchButton';
import { API_GET_ALL_ONGOING_SHOWS_URL, API_GET_ALL_UPCOMING_SHOWS_URL } from '../../utils/api';

const tabs = [
  { id: 'now-showing', label: 'Now Showing' },
  { id: 'coming-soon', label: 'Coming Soon' },
  { id: 'trending', label: 'Trending' },
];

const genres = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 
  'Sci-Fi', 'Thriller', 'Documentary', 'Adventure', 'Fantasy', 'Animation'
];

// Define the Movie interface based on your Showtime schema
interface Movie {
  _id: string;
  showName: string;
  Date: string;
  startTime: string;
  endTime: string;
  theaterId: { _id: string; name: string };
  screenId: { _id: string; hallName: string };
  totalSeats: number;
  avaliableSeats: number;
  status: 'avaliable' | 'high demand' | 'sold out' | 'cancelled';
  image?: {
    publicId: string;
    url: string;
  };
  genre: string[];
}

// Function to convert 24-hour time to 12-hour format with AM/PM
const formatTimeTo12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hourNum = parseInt(hours, 10);
  const period = hourNum >= 12 ? 'PM' : 'AM';
  const adjustedHour = hourNum % 12 || 12; // Convert 0 or 12 to 12
  return `${adjustedHour}:${minutes} ${period}`;
}

const api = axios.create({
  baseURL: 'http://localhost:5000', // Adjust base URL as needed
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

const Movies = () => {
  const [activeTab, setActiveTab] = useState('now-showing');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: movies, isLoading } = useQuery<Movie[]>({
    queryKey: ['movies', activeTab],
    queryFn: async () => {
      let url = '';
      switch (activeTab) {
        case 'now-showing':
          url = API_GET_ALL_ONGOING_SHOWS_URL;
          break;
        case 'coming-soon':
          url = API_GET_ALL_UPCOMING_SHOWS_URL;
          break;
        case 'trending':
          // For now, we'll use ongoing shows for trending as an example
          // You might want to add a specific trending endpoint later
          url = API_GET_ALL_ONGOING_SHOWS_URL;
          break;
        default:
          url = API_GET_ALL_ONGOING_SHOWS_URL;
      }

      const response = await api.get(url);
      console.log(response, '<===');
      // Assuming the API returns an array of shows directly
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const filteredMovies = movies?.filter(movie => {
    const matchesGenre = selectedGenres.length === 0 || 
      movie.genre.some(g => selectedGenres.includes(g));
    const matchesSearch = movie.showName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <div className="max-w-screen min-h-screen pt-4">
      {/* Search Bar */}
      <div className="relative mb-6">
        <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search movies..."
          className="pl-10 pr-12 bg-card/50 border-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <VoiceSearchButton 
          onTranscript={setSearchQuery}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative",
              activeTab === tab.id 
                ? "text-foreground" 
                : "text-muted-foreground"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Genres */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Genres</h3>
        <div className="flex flex-wrap gap-2">
          {genres.map(genre => (
            <Button
              key={genre}
              variant={selectedGenres.includes(genre) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleGenre(genre)}
              className="rounded-full"
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))
          ) : filteredMovies?.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">
              No movies found matching your criteria.
            </div>
          ) : (
            filteredMovies?.map((movie) => (
              <MovieCard 
                key={movie._id} 
                movie={{
                  id: movie._id,
                  title: movie.showName,
                  genre: movie.genre,
                  poster: movie.image?.url || 'https://via.placeholder.com/300x400',
                  rating: 0, // Add rating logic if available in API
                  duration: `${formatTimeTo12Hour(movie.startTime)} - ${formatTimeTo12Hour(movie.endTime)}`,
                  releaseDate: new Date(movie.Date).toLocaleDateString(),
                  // Add other fields as needed for MovieCard
                }} 
                variant="default" 
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MovieCardSkeleton = () => (
  <div className="bg-card rounded-lg overflow-hidden">
    <Skeleton className="aspect-[3/4] w-full" />
    <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
      <Skeleton className="h-3 sm:h-4 w-2/3" />
      <Skeleton className="h-3 sm:h-4 w-1/2" />
      <div className="flex justify-between">
        <Skeleton className="h-3 sm:h-4 w-1/4" />
        <Skeleton className="h-3 sm:h-4 w-1/4" />
      </div>
    </div>
  </div>
);

export default Movies;