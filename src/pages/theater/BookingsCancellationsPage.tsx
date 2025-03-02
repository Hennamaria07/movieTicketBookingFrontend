import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tab';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { MdMovie, MdPerson, MdDateRange, MdEventSeat } from 'react-icons/md';
import { FaMoneyBillWave, FaBox, FaCheck, FaTimes, FaBuilding, FaTicketAlt } from 'react-icons/fa';

// Types for our data
interface BookedTicket {
  id: string;
  movie: string;
  customer: string;
  dateTime: string;
  seats: string[];
  status: 'confirmed' | 'checked-in' | 'expired';
}

interface RefundRequest {
  id: string;
  customer: string;
  movie: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface BulkTicketSale {
  id: string;
  company: string;
  movie: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'delivered';
}

// Sample data
const bookedTicketsData: BookedTicket[] = [
  { id: 'BK-1001', movie: 'Interstellar', customer: 'John Doe', dateTime: '2025-03-05 19:30', seats: ['A1', 'A2'], status: 'confirmed' },
  { id: 'BK-1002', movie: 'The Matrix Resurrections', customer: 'Jane Smith', dateTime: '2025-03-04 20:00', seats: ['C4', 'C5', 'C6'], status: 'checked-in' },
  { id: 'BK-1003', movie: 'Dune: Part Two', customer: 'Robert Johnson', dateTime: '2025-03-06 18:45', seats: ['F7'], status: 'expired' },
  { id: 'BK-1004', movie: 'Blade Runner 2049', customer: 'Sarah Williams', dateTime: '2025-03-07 21:15', seats: ['B10', 'B11'], status: 'confirmed' },
  { id: 'BK-1005', movie: 'Inception', customer: 'Michael Brown', dateTime: '2025-03-08 20:30', seats: ['D2', 'D3', 'D4', 'D5'], status: 'confirmed' },
];

const refundRequestsData: RefundRequest[] = [
  { id: 'RF-501', customer: 'Emma Davis', movie: 'Interstellar', amount: 45.90, status: 'pending' },
  { id: 'RF-502', customer: 'Thomas Wilson', movie: 'The Matrix Resurrections', amount: 32.50, status: 'approved' },
  { id: 'RF-503', customer: 'Lisa Anderson', movie: 'Dune: Part Two', amount: 16.25, status: 'rejected' },
  { id: 'RF-504', customer: 'Kevin Martin', movie: 'Blade Runner 2049', amount: 28.75, status: 'pending' },
  { id: 'RF-505', customer: 'Catherine Jones', movie: 'Inception', amount: 65.00, status: 'pending' },
];

const bulkTicketSalesData: BulkTicketSale[] = [
  { id: 'BLK-201', company: 'TechCorp Inc.', movie: 'Interstellar', quantity: 50, totalPrice: 850.00, status: 'confirmed' },
  { id: 'BLK-202', company: 'Globex Solutions', movie: 'The Matrix Resurrections', quantity: 30, totalPrice: 495.00, status: 'pending' },
  { id: 'BLK-203', company: 'Universal Media', movie: 'Dune: Part Two', quantity: 100, totalPrice: 1600.00, status: 'delivered' },
  { id: 'BLK-204', company: 'Acme Industries', movie: 'Blade Runner 2049', quantity: 25, totalPrice: 412.50, status: 'confirmed' },
  { id: 'BLK-205', company: 'Stark Enterprises', movie: 'Inception', quantity: 75, totalPrice: 1200.00, status: 'pending' },
];

const BookingsCancellationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("booked-tickets");
  
  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" | "success" = "default";
    let label = status;
    
    switch(status) {
      case 'confirmed':
      case 'approved':
      case 'delivered':
        variant = "success";
        break;
      case 'pending':
        variant = "secondary";
        break;
      case 'rejected':
      case 'expired':
        variant = "destructive";
        break;
      case 'checked-in':
        variant = "outline";
        break;
    }
    
    return (
      <Badge variant={variant} className="capitalize">
        {label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Bookings & Cancellations
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage theater bookings, refunds, and bulk sales in one place.
        </p>
      </div>

      <Tabs defaultValue="booked-tickets" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="booked-tickets" className="flex items-center gap-2">
            <FaTicketAlt className="w-4 h-4" />
            <span className="hidden sm:inline">View Booked Tickets</span>
            <span className="sm:hidden">Tickets</span>
          </TabsTrigger>
          <TabsTrigger value="refund-requests" className="flex items-center gap-2">
            <FaMoneyBillWave className="w-4 h-4" />
            <span className="hidden sm:inline">Refund Requests</span>
            <span className="sm:hidden">Refunds</span>
          </TabsTrigger>
          <TabsTrigger value="bulk-sales" className="flex items-center gap-2">
            <FaBox className="w-4 h-4" />
            <span className="hidden sm:inline">Bulk Ticket Sales</span>
            <span className="sm:hidden">Bulk</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="booked-tickets">
          <Card>
            <CardHeader>
              <CardTitle>Booked Tickets</CardTitle>
              <CardDescription>
                View and manage all individual ticket bookings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
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
                    {bookedTicketsData.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell className="hidden md:table-cell">{ticket.movie}</TableCell>
                        <TableCell>{ticket.customer}</TableCell>
                        <TableCell className="hidden lg:table-cell">{ticket.dateTime}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {ticket.seats.join(', ')}
                        </TableCell>
                        <TableCell>{renderStatusBadge(ticket.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refund-requests">
          <Card>
            <CardHeader>
              <CardTitle>Refund Requests</CardTitle>
              <CardDescription>
                Process customer refund requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Refund ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Movie</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          <FaMoneyBillWave className="w-4 h-4" />
                          <span>Amount</span>
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refundRequestsData.map((refund) => (
                      <TableRow key={refund.id}>
                        <TableCell className="font-medium">{refund.id}</TableCell>
                        <TableCell>{refund.customer}</TableCell>
                        <TableCell className="hidden md:table-cell">{refund.movie}</TableCell>
                        <TableCell>${refund.amount.toFixed(2)}</TableCell>
                        <TableCell>{renderStatusBadge(refund.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {refund.status === 'pending' && (
                              <>
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                  <FaCheck className="w-3 h-3" />
                                  <span className="hidden sm:inline">Approve</span>
                                </Button>
                                <Button variant="outline" size="sm" className="flex items-center gap-1 text-destructive border-destructive hover:bg-destructive/10">
                                  <FaTimes className="w-3 h-3" />
                                  <span className="hidden sm:inline">Reject</span>
                                </Button>
                              </>
                            )}
                            {refund.status !== 'pending' && (
                              <Button variant="outline" size="sm">
                                Details
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-sales">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Ticket Sales</CardTitle>
              <CardDescription>
                Manage corporate and group ticket purchases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          <FaBuilding className="w-4 h-4" />
                          <span>Company</span>
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">Movie</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <FaTicketAlt className="w-4 h-4" />
                          <span>Quantity</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          <FaMoneyBillWave className="w-4 h-4" />
                          <span>Total</span>
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkTicketSalesData.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.id}</TableCell>
                        <TableCell>{sale.company}</TableCell>
                        <TableCell className="hidden md:table-cell">{sale.movie}</TableCell>
                        <TableCell className="hidden sm:table-cell">{sale.quantity}</TableCell>
                        <TableCell>${sale.totalPrice.toFixed(2)}</TableCell>
                        <TableCell>{renderStatusBadge(sale.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingsCancellationsPage;