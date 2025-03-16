import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import axios from 'axios';
import { API_BOOK_SHOW_URL, API_COMFIRM_BOOKING_PAYMENT } from '../../utils/api';
import { useSelector } from 'react-redux';

// Define interfaces for type safety
interface Seat {
  seatId: string;
  category: {
    name: string;
    price: number;
    color: string;
  };
}

interface BookingData {
  showId: string;
  seats: Seat[];
  total: number;
  showDetails: any; // Refine this based on your Showtime interface
}

interface Order {
  id: string;
  amount: number;
  currency: string;
  key: string;
}

const Payment = () => {
  const { state: bookingData } = useLocation() as { state: BookingData | undefined };
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null); // Store booking ID
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = useSelector((state: any) => state.user.auth.userInfo.id)

  useEffect(() => {
    if (!bookingData) {
      navigate(-1);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await axios.post(API_BOOK_SHOW_URL, {
          showtimeId: bookingData.showId, // Match backend expectation
          seats: bookingData.seats.map((s) => ({
            totalSeats: 1,
            seatType: s.category.name,
            seatNumber: s.seatId,
            price: s.category.price,
          })),
          userId, // Replace with actual user ID from auth context
          theaterId: bookingData.showDetails.theaterId, // Adjust based on your showDetails structure
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setOrder(response.data.order);
        setBookingId(response.data.data._id); // Store the booking ID from the response
      } catch (err) {
        setError('Error creating order. Please try again.');
        console.error('Error creating order:', err);
      }
    };

    fetchOrder();
  }, [bookingData, navigate]);

  const handlePayment = () => {
    if (!order || !bookingData || !bookingId) {
      setError('Order, booking data, or booking ID is missing.');
      return;
    }

    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      handler: async (response: any) => {
        setLoading(true);
        try {
          const bookingResponse = await axios.patch(API_COMFIRM_BOOKING_PAYMENT, {
            bookingId: bookingId, // Use the stored booking ID
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (bookingResponse.data.success) {
            navigate('/booking/confirmation', {
              state: { ...bookingData, payment: bookingResponse.data.data },
            });
          }
        } catch (err) {
          setError('Payment confirmation failed. Please contact support.');
          console.error('Payment confirmation failed:', err);
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3399cc',
      },
      modal: {
        ondismiss: () => {
          setError('Payment was cancelled.');
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    if (!rzp) {
      setError('Razorpay SDK not loaded. Please ensure the script is included.');
      return;
    }
    rzp.open();
  };

  // Ensure Razorpay script is loaded
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => console.log('Razorpay SDK loaded');
    script.onerror = () => setError('Failed to load Razorpay SDK.');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!bookingData) return <div>Redirecting...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Payment</h1>
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <p>Total Amount: ₹{(bookingData.total).toFixed(2)}</p>
              <p>Selected Seats: {bookingData.seats.map((s) => s.seatId).join(', ')}</p>
            </div>
            <Button onClick={handlePayment} disabled={loading || !order}>
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;