import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { 
  AiOutlineSearch, 
  AiFillStar,
  AiOutlineCamera,
  AiOutlineVideoCamera,
  AiOutlineLike,
  AiOutlineDislike,
  AiFillLike,
  AiFillDislike,
  AiOutlineMessage,
  AiOutlineWarning,
  AiOutlineBarChart
} from 'react-icons/ai'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tab'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import { VoiceSearchButton } from '../../components/VoiceSearchButton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

interface Reply {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: string
}

interface Review {
  id: string
  movieId: string
  movieTitle: string
  moviePoster: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  content: string
  sentiment: 'positive' | 'neutral' | 'negative'
  hasSpoilers: boolean
  upvotes: number
  downvotes: number
  images: string[]
  videoUrl?: string
  createdAt: string
  isUserVoted?: 'up' | 'down'
  replies: Reply[]
}

const mockReviews: Review[] = [
  {
    id: '1',
    movieId: 'm1',
    movieTitle: 'Inception',
    moviePoster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    userId: 'u1',
    userName: 'John Doe',
    userAvatar: 'https://ui-avatars.com/api/?name=John+Doe',
    rating: 4.5,
    content: 'A mind-bending masterpiece that challenges your perception of reality...',
    sentiment: 'positive',
    hasSpoilers: true,
    upvotes: 150,
    downvotes: 12,
    images: ['https://example.com/image1.jpg'],
    createdAt: '2024-03-10T14:22:00',
    isUserVoted: 'up',
    replies: []
  },
  // Add more reviews...
]

const Review = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('helpful')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('all-reviews')

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockReviews
    }
  })

  const filteredReviews = reviews?.filter(review => {
    const matchesSearch = review.movieTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRating = ratingFilter === 'all' || 
      Math.floor(review.rating) === parseInt(ratingFilter)
    
    return matchesSearch && matchesRating
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'rating':
        return b.rating - a.rating
      case 'ai':
        // AI recommendation logic here
        return 0
      default: // helpful
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
    }
  })

  return (
    <div className="max-w-screen min-h-screen space-y-6 pt-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12"
          />
          <VoiceSearchButton 
            onTranscript={setSearchQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="helpful">Most Helpful</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="ai">AI Recommended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {[5, 4, 3, 2, 1].map(rating => (
              <SelectItem key={rating} value={rating.toString()}>
                {rating} Stars
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all-reviews">All Reviews</TabsTrigger>
          <TabsTrigger value="my-reviews">My Reviews</TabsTrigger>
          <TabsTrigger value="watch-party">Watch Party</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
        </TabsList>

        <TabsContent value="all-reviews" className="space-y-6">
          {/* Analytics Section */}
          <section className="bg-card rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AiOutlineBarChart className="h-5 w-5" />
              Review Analytics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Add charts and analytics here */}
            </div>
          </section>

          {/* Reviews Grid */}
          <div className="grid gap-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <ReviewCardSkeleton key={i} />
                ))
              ) : (
                filteredReviews?.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Other tab contents */}
      </Tabs>
    </div>
  )
}

interface ReviewCardProps {
  review: Review
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [voteStatus, setVoteStatus] = useState(review.isUserVoted)
  const [showReplies, setShowReplies] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [upvotes, setUpvotes] = useState(review.upvotes)
  const [downvotes, setDownvotes] = useState(review.downvotes)

  const handleVote = (type: 'up' | 'down') => {
    if (voteStatus === type) {
      // Remove vote
      setVoteStatus(undefined)
      if (type === 'up') {
        setUpvotes(prev => prev - 1)
      } else {
        setDownvotes(prev => prev - 1)
      }
    } else {
      // Add/change vote
      if (voteStatus === 'up' && type === 'down') {
        setUpvotes(prev => prev - 1)
        setDownvotes(prev => prev + 1)
      } else if (voteStatus === 'down' && type === 'up') {
        setDownvotes(prev => prev - 1)
        setUpvotes(prev => prev + 1)
      } else {
        if (type === 'up') {
          setUpvotes(prev => prev + 1)
        } else {
          setDownvotes(prev => prev + 1)
        }
      }
      setVoteStatus(type)
    }
  }

  const handleReply = () => {
    if (!replyText.trim()) return

    // Add reply logic here
    toast.success("Reply posted successfully!", {
      description: "Your reply has been added to the discussion"
    })
    setReplyText('')
    setShowReplies(true)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-card rounded-lg overflow-hidden"
    >
      <div className="p-3 sm:p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          <img 
            src={review.moviePoster}
            alt={review.movieTitle}
            className="w-20 h-28 sm:w-16 sm:h-24 rounded-md object-cover"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-base sm:text-lg">{review.movieTitle}</h3>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                  <img 
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                  />
                  <span>{review.userName}</span>
                  <span>•</span>
                  <span>{format(new Date(review.createdAt), 'PP')}</span>
                </div>
              </div>
              <Badge 
                variant={
                  review.sentiment === 'positive' 
                    ? 'default'
                    : review.sentiment === 'neutral'
                      ? 'secondary'
                      : 'destructive'
                }
                className="text-xs"
              >
                {review.sentiment}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <AiFillStar 
                  key={i}
                  className={cn(
                    "h-3 w-3 sm:h-4 sm:w-4",
                    i < Math.floor(review.rating) ? "text-yellow-500" : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 sm:space-y-4">
          {review.hasSpoilers && !isExpanded ? (
            <div className="bg-muted/50 p-3 sm:p-4 rounded-md">
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                This review contains spoilers
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-2 w-full h-8 sm:h-9 text-xs sm:text-sm"
                onClick={() => setIsExpanded(true)}
              >
                <AiOutlineWarning className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Reveal Spoiler
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xs sm:text-sm">{review.content}</p>
              {review.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin">
                  {review.images.map((image, i) => (
                    <img 
                      key={i}
                      src={image}
                      alt={`Review image ${i + 1}`}
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-md object-cover"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleVote('up')}
              className={cn(
                "h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3",
                voteStatus === 'up' ? "text-primary" : ""
              )}
            >
              {voteStatus === 'up' ? (
                <AiFillLike className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              ) : (
                <AiOutlineLike className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              )}
              {upvotes}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleVote('down')}
              className={cn(
                "h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3",
                voteStatus === 'down' ? "text-destructive" : ""
              )}
            >
              {voteStatus === 'down' ? (
                <AiFillDislike className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              ) : (
                <AiOutlineDislike className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              )}
              {downvotes}
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            <AiOutlineMessage className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {review.replies?.length || 0} Replies
          </Button>
          <div className="flex-1" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <AiOutlineCamera className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <AiOutlineVideoCamera className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Replies Section */}
        {showReplies && (
          <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-border">
            <div className="space-y-3 sm:space-y-4">
              {review.replies?.map((reply) => (
                <div key={reply.id} className="flex gap-2 sm:gap-3">
                  <img 
                    src={reply.userAvatar}
                    alt={reply.userName}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs sm:text-sm">{reply.userName}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {format(new Date(reply.createdAt), 'PP')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm mt-1">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
              <img 
                src="https://ui-avatars.com/api/?name=Current+User"
                alt="Current User"
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
              />
              <div className="flex-1">
                <Input
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="bg-muted text-xs sm:text-sm h-8 sm:h-9"
                />
                <Button 
                  size="sm" 
                  className="mt-2 h-8 sm:h-9 text-xs sm:text-sm"
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                >
                  Post Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const ReviewCardSkeleton = () => (
  <div className="bg-card rounded-lg p-4">
    <div className="flex gap-4 mb-4">
      <Skeleton className="w-16 h-24 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
)

export default Review
