import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { format, isFuture, differenceInMinutes } from 'date-fns'
import { 
  AiOutlineSearch,
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineEnvironment,
  AiOutlineDownload,
  AiOutlineEdit,
  AiOutlineStar,
  AiOutlineFilter,
  AiOutlineDown
} from 'react-icons/ai'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import { VoiceSearchButton } from '../../components/VoiceSearchButton'

interface Ticket {
  id: string
  movieTitle: string
  posterUrl: string
  theater: string
  location: string
  showtime: string
  seats: string[]
  status: 'confirmed' | 'pending' | 'canceled'
  totalAmount: number
  bookingDate: string
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    movieTitle: 'Inception',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    theater: 'Cineplex Deluxe',
    location: 'Downtown Mall, Cinema City',
    showtime: '2024-03-15T18:30:00',
    seats: ['F12', 'F13'],
    status: 'confirmed',
    totalAmount: 32.00,
    bookingDate: '2024-03-10T14:22:00'
  },
  // Add more tickets...
]

const Ticket = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockTickets
    }
  })

  const filteredTickets = tickets?.filter(ticket => {
    const matchesSearch = ticket.movieTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      ticket.theater.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.showtime).getTime() - new Date(b.showtime).getTime()
      case 'alphabetical':
        return a.movieTitle.localeCompare(b.movieTitle)
      default: // newest
        return new Date(b.showtime).getTime() - new Date(a.showtime).getTime()
    }
  })

  const upcomingTickets = filteredTickets?.filter(ticket => 
    isFuture(new Date(ticket.showtime))
  )

  const pastTickets = filteredTickets?.filter(ticket => 
    !isFuture(new Date(ticket.showtime))
  )

  return (
    <div className="max-w-screen min-h-screen space-y-6 pt-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12"
          />
          <VoiceSearchButton 
            onTranscript={setSearchQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <AiOutlineFilter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <AiOutlineDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upcoming Tickets */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Upcoming Shows</h2>
        <div className="grid gap-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              Array(2).fill(0).map((_, i) => (
                <TicketCardSkeleton key={i} />
              ))
            ) : (
              upcomingTickets?.map((ticket) => (
                <TicketCard 
                  key={ticket.id} 
                  ticket={ticket}
                  isUpcoming
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Past Tickets */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Past Shows</h2>
        <div className="grid gap-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <TicketCardSkeleton key={i} />
              ))
            ) : (
              pastTickets?.map((ticket) => (
                <TicketCard 
                  key={ticket.id} 
                  ticket={ticket}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}

interface TicketCardProps {
  ticket: Ticket
  isUpcoming?: boolean
}

const TicketCard = ({ ticket, isUpcoming }: TicketCardProps) => {
  const showtime = new Date(ticket.showtime)
  const minutesToShow = differenceInMinutes(showtime, new Date())
  const hoursToShow = Math.floor(minutesToShow / 60)
  const remainingMinutes = minutesToShow % 60

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-card rounded-lg overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-48 shrink-0">
          <img 
            src={ticket.posterUrl}
            alt={ticket.movieTitle}
            className="w-full h-40 sm:h-full object-cover sm:aspect-auto"
          />
        </div>
        <div className="flex-1 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-4">
            <div>
              <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2">{ticket.movieTitle}</h3>
              <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1 sm:gap-2">
                  <AiOutlineCalendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{format(showtime, 'PPP')}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <AiOutlineClockCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{format(showtime, 'p')}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <AiOutlineEnvironment className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="line-clamp-1">{ticket.theater}, {ticket.location}</span>
                </div>
              </div>
            </div>
            <Badge 
              variant={
                ticket.status === 'confirmed' 
                  ? 'default'
                  : ticket.status === 'pending'
                    ? 'secondary'
                    : 'destructive'
              }
              className="capitalize text-xs sm:text-sm"
            >
              {ticket.status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-4 text-xs sm:text-sm">
            <div>
              Seats: <span className="font-medium">{ticket.seats.join(', ')}</span>
            </div>
            <div>
              Amount: <span className="font-medium">${ticket.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {isUpcoming && minutesToShow > 0 && (
            <div className="mb-2 sm:mb-4">
              <div className="text-xs sm:text-sm font-medium">
                Time until show:
                <span className="ml-2 text-primary">
                  {hoursToShow}h {remainingMinutes}m
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {isUpcoming ? (
              <>
                <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                  <AiOutlineDownload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Download QR
                </Button>
                <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                  <AiOutlineEdit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Modify
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                <AiOutlineStar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Write Review
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const TicketCardSkeleton = () => (
  <div className="bg-card rounded-lg overflow-hidden">
    <div className="flex flex-col sm:flex-row">
      <Skeleton className="w-full sm:w-48 aspect-[2/3] sm:aspect-auto" />
      <div className="flex-1 p-4 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </div>
  </div>
)

export default Ticket
