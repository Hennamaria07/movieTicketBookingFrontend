import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { MdMovie, MdPerson, MdDateRange, MdEventSeat } from 'react-icons/md';
import { FaTicketAlt } from 'react-icons/fa';
import { API_BASE_URL, API_GET_THEATER_BY_ID_URL } from '../../utils/api';

// Type for booked ticket data
interface BookedTicket {
  id: string;
  movie: string;
  customer: string;
  dateTime: string;
  seats: string[];
  status: 'confirmed' | 'checked-in' | 'expired';
}

// Modal component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Fetch bookings for a theater
const fetchTheaterBookings = async (theaterId: string): Promise<BookedTicket[]> => {
  const response = await axios.get(`${API_BASE_URL}/user/bookings/theater/${theaterId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  console.log('Bookings Response:', response.data);
  return response.data.data.map((booking: any) => ({
    id: booking.id,
    movie: booking.showtime.showName,
    customer: `${booking.user.firstName} ${booking.user.lastName}`,
    dateTime: `${new Date(booking.showtime.date).toLocaleDateString()} ${booking.showtime.startTime}`,
    seats: booking.seats.map((seat: any) => seat.seatNumber),
    status: booking.transactionStatus === 'Paid' ? 'confirmed' :
            booking.transactionStatus === 'Refunded' ? 'expired' : 'checked-in',
  }));
};

const TheaterAnalyticsDashboard: React.FC = () => {
  const [theaterId, setTheaterId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<BookedTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userId = useSelector((state: any) => state.user.auth.userInfo?.id);

  // Fetch theaterId
  useEffect(() => {
    const fetchTheaterId = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const theaterResponse = await axios.get(`${API_GET_THEATER_BY_ID_URL}/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const theaterData = theaterResponse.data.data;
        setTheaterId(theaterData?._id || '');
        console.log('Theater ID fetched:', theaterData?._id);
      } catch (err) {
        setError(axios.isAxiosError(err) && err.response?.status === 404 
          ? 'Theater not found' 
          : err.message || 'Error fetching theater data');
        console.error('Error fetching theater data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTheaterId();
    } else {
      console.log('No userId found');
    }
  }, [userId]);

  // Fetch booked tickets using React Query
  const { data: bookedTickets, isLoading: bookingsLoading, error: bookingsError } = useQuery<BookedTicket[], Error>({
    queryKey: ['theaterBookings', theaterId],
    queryFn: () => fetchTheaterBookings(theaterId),
    enabled: !!theaterId,
  });

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    let variant: 'default' | 'outline' | 'destructive' | 'secondary' = 'default';
    switch (status) {
      case 'confirmed':
        variant = 'default';
        break;
      case 'pending':
        variant = 'secondary';
        break;
      case 'expired':
        variant = 'destructive';
        break;
      case 'checked-in':
        variant = 'outline';
        break;
      default:
        variant = 'default';
    }
    return <Badge variant={variant} className="capitalize">{status}</Badge>;
  };

  // Handle details button click
  const handleDetailsClick = (ticket: BookedTicket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
console.log()
  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Theater Bookings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage all bookings for your theater</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaTicketAlt className="w-5 h-5" />
            Booked Tickets
          </CardTitle>
          <CardDescription>Overview of all ticket bookings for your theater.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {bookingsLoading ? (
              <p className="text-center py-4">Loading bookings...</p>
            ) : bookingsError ? (
              <p className="text-center py-4 text-red-500">Error loading bookings: {bookingsError.message}</p>
            ) : !bookedTickets || bookedTickets.length === 0 ? (
              <p className="text-center py-4">No bookings found for this theater.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <MdMovie className="w-4 h-4" />
                        <span>Movie</span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <MdPerson className="w-4 h-4" />
                        <span>Customer</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <MdDateRange className="w-4 h-4" />
                        <span>Date & Time</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <MdEventSeat className="w-4 h-4" />
                        <span>Seats</span>
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookedTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="hidden md:table-cell">{ticket.movie}</TableCell>
                      <TableCell>{ticket.customer}</TableCell>
                      <TableCell className="hidden lg:table-cell">{ticket.dateTime}</TableCell>
                      <TableCell className="hidden sm:table-cell">{ticket.seats.join(', ')}</TableCell>
                      <TableCell>{renderStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDetailsClick(ticket)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedTicket && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Booking Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Booking ID</p>
                <p>{selectedTicket.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Movie</p>
                <p>{selectedTicket.movie}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p>{selectedTicket.customer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p>{selectedTicket.dateTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Seats</p>
                <p>{selectedTicket.seats.join(', ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                {renderStatusBadge(selectedTicket.status)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TheaterAnalyticsDashboard;