import { useState } from "react"
import { Dialog, DialogContent } from "../ui/dialog"
import { Button } from "../ui/button"
import { Movie } from "../../types/movie"
import { AiOutlineClockCircle, AiOutlineCalendar } from "react-icons/ai"
import { format } from "date-fns"
import { cn } from "../../lib/utils"

interface BookingModalProps {
  movie: Movie
  isOpen: boolean
  onClose: () => void
}

const showtimes = [
  "10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM", "10:00 PM"
]

const seats = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  status: Math.random() > 0.3 ? "available" : "booked"
}))

export const BookingModal = ({ movie, isOpen, onClose }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])

  const handleSeatClick = (seatId: number) => {
    setSelectedSeats(prev => 
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    )
  }

  const handleBooking = () => {
    // Handle booking logic here
    console.log({
      movie,
      date: selectedDate,
      time: selectedTime,
      seats: selectedSeats
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div className="grid md:grid-cols-2 h-[80vh] overflow-hidden">
          {/* Movie Info - Left Side */}
          <div className="p-6 border-r border-border">
            <img 
              src={movie.poster} 
              alt={movie.title}
              className="w-full rounded-lg"
            />
            <div className="mt-4 space-y-2">
              <h2 className="text-xl font-bold">{movie.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AiOutlineClockCircle />
                <span>{movie.duration}</span>
              </div>
            </div>
          </div>

          {/* Booking Options - Right Side */}
          <div className="p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <h3 className="font-semibold mb-2">Select Date</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() + i)
                    return (
                      <Button
                        key={i}
                        variant={selectedDate.getDate() === date.getDate() ? "default" : "outline"}
                        onClick={() => setSelectedDate(date)}
                        className="flex-shrink-0"
                      >
                        <div className="text-center">
                          <div className="text-sm">{format(date, 'EEE')}</div>
                          <div className="text-lg font-bold">{format(date, 'd')}</div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Showtime Selection */}
              <div>
                <h3 className="font-semibold mb-2">Select Time</h3>
                <div className="grid grid-cols-3 gap-2">
                  {showtimes.map(time => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Seat Selection */}
              {selectedTime && (
                <div>
                  <h3 className="font-semibold mb-2">Select Seats</h3>
                  <div className="grid grid-cols-8 gap-2">
                    {seats.map(seat => (
                      <button
                        key={seat.id}
                        disabled={seat.status === "booked"}
                        onClick={() => handleSeatClick(seat.id)}
                        className={cn(
                          "w-8 h-8 rounded-md text-sm font-medium transition-colors",
                          seat.status === "booked" 
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : selectedSeats.includes(seat.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80"
                        )}
                      >
                        {seat.id}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Button */}
              <Button 
                className="w-full"
                disabled={!selectedTime || selectedSeats.length === 0}
                onClick={handleBooking}
              >
                Book {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 