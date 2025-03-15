import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { API_GET_THEATER_SHOW_DETAILS_BY_SHOWID_URL } from '../../utils/api';
import { cn } from '../../lib/utils';
import { useNavigate, useParams } from 'react-router-dom';

interface Theater {
  _id: string;
  name: string;
  location: string;
  phone?: string | number;
}

interface SeatCategory {
  id: string;
  name: string;
  price: number;
  color: string;
}

interface SpecialSeat {
  row: number;
  seat: number;
  categoryId: string;
}

interface Screen {
  _id: string;
  hallName: string;
  rows: number;
  seatsPerRow: number;
  seatCategories: SeatCategory[];
  specialSeats: SpecialSeat[];
}

interface Showtime {
  _id: string;
  theaterId: Theater;
  screenId: Screen;
  showName: string;
  startTime: string;
  endTime: string;
  Date: string;
  status: 'avaliable' | 'high demand' | 'sold out' | 'cancelled';
  totalSeats: number;
  avaliableSeats: number;
  image?: {
    publicId: string;
    url: string;
  };
  genre: string[];
}

interface Seat {
  id: string;
  row: string;
  number: number;
  isAvailable: boolean;
  category: SeatCategory;
}


const Booking = () => {
  const navigate = useNavigate();
  const { id: showId } = useParams<{ id: string }>();

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const { data: showDetails, isLoading, error } = useQuery<Showtime>({
    queryKey: ['showtime', showId],
    queryFn: async () => {
      if (!showId) throw new Error('Show ID is required');
      const response = await axios.get(`${API_GET_THEATER_SHOW_DETAILS_BY_SHOWID_URL}/${showId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
      });
      console.log(response, '<===');
      return response.data;
    },
    enabled: !!showId,
    staleTime: 5 * 60 * 1000,
    // cacheTime: 10 * 60 * 1000,
  });

  const generateSeats = (screen: Screen, availableSeats: number): Seat[] => {
    const seats: Seat[] = [];
    const defaultCategory = screen.seatCategories.find(cat => cat.id === 'regular') || screen.seatCategories[0];

    for (let rowIndex = 0; rowIndex < screen.rows; rowIndex++) {
      const rowLetter = String.fromCharCode(65 + rowIndex);
      for (let seatNum = 1; seatNum <= screen.seatsPerRow; seatNum++) {
        const specialSeat = screen.specialSeats.find(
          ss => ss.row === rowIndex + 1 && ss.seat === seatNum
        );
        const category = specialSeat 
          ? screen.seatCategories.find(cat => cat.id === specialSeat.categoryId) || defaultCategory
          : defaultCategory;

        const seatIndex = rowIndex * screen.seatsPerRow + (seatNum - 1);
        seats.push({
          id: `${rowLetter}${seatNum}`,
          row: rowLetter,
          number: seatNum,
          isAvailable: seatIndex < availableSeats,
          category
        });
      }
    }
    return seats;
  };

  const seats = showDetails?.screenId 
    ? generateSeats(showDetails.screenId, showDetails.avaliableSeats) 
    : [];
  const seatsPerRow = showDetails?.screenId.seatsPerRow || 0;
  const rowCount = showDetails?.screenId.rows || 0;

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || !seat.isAvailable) return;

    setSelectedSeats(prev => 
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.id === seatId);
      return total + (seat?.category.price || 0);
    }, 0);
  };

  const handleBooking = () => {
    if (!showId || selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    const bookingData = {
      showId,
      seats: selectedSeats.map(seatId => ({
        seatId,
        category: seats.find(s => s.id === seatId)?.category
      })),
      total: calculateTotal(),
      showDetails
    };

    navigate('/booking/confirmation', { state: bookingData });
  };

  if (!showId) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p>No show ID provided. Please select a show to book.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p>Failed to load show details: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Book Your Tickets</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Show Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Show Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div>Loading show details...</div>
            ) : showDetails ? (
              <>
                <div>
                  <label className="block text-sm font-medium">Theater</label>
                  <p>{showDetails.theaterId.name} - {showDetails.theaterId.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Screen</label>
                  <p>{showDetails.screenId.hallName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Show</label>
                  <p>{showDetails.showName}</p>
                  <p>{new Date(showDetails.Date).toLocaleDateString()} {showDetails.startTime}</p>
                  <p>Status: {showDetails.status}</p>
                </div>
                {showDetails.image && (
                  <div>
                    <img 
                      src={showDetails.image.url} 
                      alt={showDetails.showName} 
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </>
            ) : (
              <div>No show details available</div>
            )}
          </CardContent>
        </Card>

        {/* Seat Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{showDetails?.screenId.hallName || 'Seat'} Layout</CardTitle>
              <div className="flex items-center">
                <span className="text-sm mr-2">
                  {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading seats...</div>
            ) : !showDetails ? (
              <div className="text-center text-muted-foreground">
                Loading show details...
              </div>
            ) : showDetails.status === 'sold out' || showDetails.status === 'cancelled' ? (
              <div className="text-center text-muted-foreground">
                Booking not available - Show is {showDetails.status}
              </div>
            ) : (
              <div>
                <div className="mb-8 text-center">
                  <div className="h-6 mx-auto w-4/5 rounded-t-3xl bg-gray-300 dark:bg-gray-600"></div>
                  <p className="mt-1 text-sm text-gray-500">SCREEN</p>
                </div>

                <div className="overflow-x-auto pb-4">
                  <div className="inline-block min-w-full">
                    <div className="text-center mb-6">
                      {Array.from({ length: rowCount }).map((_, rowIndex) => {
                        const rowLetter = String.fromCharCode(65 + rowIndex);
                        return (
                          <div key={rowIndex} className="flex justify-center my-1 gap-1">
                            <div className="w-6 flex items-center justify-center text-sm">
                              {rowLetter}
                            </div>
                            {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
                              const seatNum = seatIndex + 1;
                              const seatId = `${rowLetter}${seatNum}`;
                              const seat = seats.find(s => s.id === seatId);
                              const isSelected = selectedSeats.includes(seatId);
                              const isAvailable = seat?.isAvailable ?? false;
                              const categoryColor = seat?.category.color || 'bg-gray-500';

                              return (
                                <button
                                  key={seatIndex}
                                  onClick={() => handleSeatClick(seatId)}
                                  className={cn(
                                    'w-6 h-6 rounded-t-lg text-xs font-medium transition-all duration-200 transform',
                                    categoryColor,
                                    isSelected ? 'ring-2 ring-white scale-110 z-10 text-white' : '',
                                    !isSelected && isAvailable ? 'hover:scale-105 text-white' : '',
                                    !isAvailable ? 'bg-gray-500 cursor-not-allowed text-white' : ''
                                  )}
                                  disabled={!isAvailable}
                                  title={`${seatId} - ${seat?.category.name || 'Unknown'} (${isAvailable ? 'Available' : 'Booked'}) - $${seat?.category.price || 0}`}
                                >
                                  {seatNum}
                                </button>
                              );
                            })}
                            <div className="w-6 flex items-center justify-center text-sm">
                              {rowLetter}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                      {showDetails.screenId.seatCategories.map(category => (
                        <div key={category.id} className="flex items-center">
                          <div className={`w-4 h-4 rounded ${category.color} mr-1`}></div>
                          <span className="text-sm">{category.name} (${category.price})</span>
                        </div>
                      ))}
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-gray-500 mr-1"></div>
                        <span className="text-sm">Booked</span>
                      </div>
                    </div>

                    {selectedSeats.length > 0 && (
                      <div className="mt-4 p-3 rounded bg-gray-100 dark:bg-gray-800">
                        <h3 className="font-medium mb-2">Selected Seats</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSeats.map(seatId => {
                            const seat = seats.find(s => s.id === seatId);
                            return (
                              <Badge key={seatId} className={`${seat?.category.color} text-white`}>
                                {seatId} (${seat?.category.price})
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="mr-2">Selected Seats: {selectedSeats.length}</span>
                    <span>Total: ${calculateTotal()}</span>
                  </div>
                  <Button 
                    onClick={handleBooking} 
                    disabled={selectedSeats.length === 0 || showDetails.avaliableSeats === 0}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Booking;