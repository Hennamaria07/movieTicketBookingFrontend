import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const Confirmation = () => {
  const { state: bookingData } = useLocation();

  if (!bookingData) return <div>Booking not found</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Booking Confirmed</h1>
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>Theater: {bookingData.showDetails.theaterId.name}</p>
            <p>Show: {bookingData.showDetails.showName}</p>
            <p>Date & Time: {new Date(bookingData.showDetails.Date).toLocaleDateString()} {bookingData.showDetails.startTime}</p>
          </div>
          <div>
            <h3 className="font-medium">Selected Seats</h3>
            <div className="flex flex-wrap gap-2">
              {bookingData.seats.map((s: any) => (
                <Badge key={s.seatId} className={`${s.category.color} text-white`}>
                  {s.seatId} (${s.category.price})
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p>Total Amount: ₹{bookingData.total / 100}</p>
            <p>Transaction Status: {bookingData.payment?.transactionStatus}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Confirmation;