import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isFuture, differenceInMinutes, parse } from "date-fns";
import {
  AiOutlineSearch,
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineEnvironment,
  AiOutlineDownload,
  AiOutlineEdit,
  AiOutlineStar,
  AiOutlineFilter,
  AiOutlineDown,
} from "react-icons/ai";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { VoiceSearchButton } from "../../components/VoiceSearchButton";
import {
  API_GET_ALL_BOOKING_BASED_ON_LOGIN_USER_URL,
  API_GET_THEATER_SHOW_DETAILS_BY_SHOWID_URL,
  API_MODIFY_BOOKING_URL,
  API_COMFIRM_MODIFIED_BOOKING_PAYMENT,
} from "../../utils/api";
import { useSelector } from "react-redux";
import axios from "axios";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

interface Ticket {
  id: string;
  movieTitle: string;
  posterUrl: string;
  theater: string;
  location: string;
  showtime: string;
  seats: string[];
  status: "confirmed" | "pending" | "canceled";
  totalAmount: number;
  bookingDate: string;
  showtimeId?: string;
}

interface SeatCategory {
  id: string;
  name: string;
  price: number;
  color: string;
}

interface Seat {
  id: string;
  row: string;
  number: number;
  isAvailable: boolean;
  category: SeatCategory;
}

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
});

const Ticket = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const userId = useSelector((state: any) => state.user.auth.userInfo.id);
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await axios.get(`${API_GET_ALL_BOOKING_BASED_ON_LOGIN_USER_URL}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      const bookings = response.data.data;
      return bookings.map((booking: any) => {
        const dateStr = new Date(booking.showtimeId.Date).toISOString().split("T")[0];
        const timeStr = Array.isArray(booking.showtimeId.startTime)
          ? booking.showtimeId.startTime[0]
          : booking.showtimeId.startTime;
        const showtimeDate = parse(`${dateStr} ${timeStr}`, "yyyy-MM-dd hh:mm a", new Date());

        return {
          id: booking._id,
          movieTitle: booking.showtimeId.showName,
          posterUrl: booking.showtimeId.image?.url || "https://via.placeholder.com/300x400",
          theater: booking.theaterId.name,
          location: booking.theaterId.location,
          showtime: showtimeDate.toISOString(),
          seats: booking.seats.map((seat: any) => seat.seatNumber),
          status:
            booking.transactionStatus === "Paid"
              ? "confirmed"
              : booking.transactionStatus === "Pending"
              ? "pending"
              : "canceled",
          totalAmount: booking.totalAmount,
          bookingDate: booking.bookingDate,
          showtimeId: booking.showtimeId?._id || null,
        };
      }) as Ticket[];
    },
    enabled: !!userId,
  });

  const filteredTickets = tickets
    ?.filter((ticket) => {
      const matchesSearch =
        ticket.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.theater.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();
        case "alphabetical":
          return a.movieTitle.localeCompare(b.movieTitle);
        default:
          return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
      }
    });

  const upcomingTickets = filteredTickets?.filter((ticket) =>
    isFuture(new Date(ticket.bookingDate))
  );

  const pastTickets = filteredTickets?.filter((ticket) =>
    !isFuture(new Date(ticket.bookingDate))
  );

  return (
    <div className="max-w-screen min-h-screen space-y-6 pt-4">
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
            <SelectItem value="newest">Newest Booking First</SelectItem>
            <SelectItem value="oldest">Oldest Booking First</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">Upcoming Shows</h2>
        <div className="grid gap-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              Array(2)
                .fill(0)
                .map((_, i) => <TicketCardSkeleton key={i} />)
            ) : upcomingTickets?.length === 0 ? (
              <p className="text-center text-muted-foreground">No upcoming shows found</p>
            ) : (
              upcomingTickets?.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} isUpcoming showBookingDate />
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Past Shows</h2>
        <div className="grid gap-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <TicketCardSkeleton key={i} />)
            ) : pastTickets?.length === 0 ? (
              <p className="text-center text-muted-foreground">No past shows found</p>
            ) : (
              pastTickets?.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} showBookingDate />)
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

interface TicketCardProps {
  ticket: Ticket;
  isUpcoming?: boolean;
  showBookingDate?: boolean;
}

const TicketCard = ({ ticket, isUpcoming, showBookingDate }: TicketCardProps) => {
  const showtime = new Date(ticket.showtime);
  const bookingDate = new Date(ticket.bookingDate);
  const minutesToShow = differenceInMinutes(showtime, new Date());
  const hoursToShow = Math.floor(minutesToShow / 60);
  const remainingMinutes = minutesToShow % 60;
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>(ticket.seats);
  const queryClient = useQueryClient();

  const generateAndDownloadQR = async () => {
    try {
      const qrData = JSON.stringify({
        id: ticket.id,
        movieTitle: ticket.movieTitle,
        theater: ticket.theater,
        showtime: ticket.showtime,
        seats: ticket.seats,
        status: ticket.status,
      });

      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      });

      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = `ticket_${ticket.id}_qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code.");
    }
  };

  const { data: showDetails, isLoading: isShowLoading } = useQuery({
    queryKey: ["showtime", ticket.showtimeId],
    queryFn: async () => {
      if (!ticket.showtimeId) throw new Error("Showtime ID is undefined");
      const dateStr = ticket.showtime.split("T")[0];
      const response = await axios.get(
        `${API_GET_THEATER_SHOW_DETAILS_BY_SHOWID_URL}/${ticket.showtimeId}?date=${dateStr}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const showData = response.data;
      if (!showData || !showData.screenId || !showData.bookedSeat) {
        throw new Error("Show details data is undefined or missing required fields");
      }
      return showData;
    },
    enabled: isModifyModalOpen && !!ticket.showtimeId,
  });

  const modifyMutation = useMutation({
    mutationFn: async ({ bookingId, newSeats }: { bookingId: string; newSeats: string[] }) => {
      const seatDetails = newSeats.map((seatNumber) => {
        const seat = generateSeats().find((s: Seat) => s.id === seatNumber);
        return {
          seatNumber,
          seatType: seat?.category.id || "regular",
        };
      });

      const response = await axios.put(
        `${API_MODIFY_BOOKING_URL}/${bookingId}/modify`,
        { seats: seatDetails },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setIsModifyModalOpen(false);
      if (data.refund) {
        toast.success(
          `Booking modified successfully. Refund of ₹${(data.refund.amount / 100).toFixed(2)} processed.`
        );
      } else if (!data.order) {
        toast.success("Booking modified successfully.");
      }
    },
    onError: (error) => {
      console.error("Error modifying booking:", error);
      toast.error("Failed to modify booking. Please try again.");
    },
  });

  const handleModifyBooking = async () => {
    if (!ticket.showtimeId) {
      console.error("Cannot modify booking: showtimeId is undefined");
      toast.error("Cannot modify booking: Showtime information missing");
      return;
    }

    try {
      const response = await modifyMutation.mutateAsync({
        bookingId: ticket.id,
        newSeats: selectedSeats,
      });

      if (response.order) {
        const options = {
          key: response.order.key,
          amount: response.order.amount, // Amount is in paise (e.g., 34400 for 344 INR)
          currency: response.order.currency,
          order_id: response.order.id,
          handler: async (paymentResponse: any) => {
            await axios.post(
              `${API_COMFIRM_MODIFIED_BOOKING_PAYMENT}/${ticket.id}`,
              {
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                bookingId: ticket.id,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
              }
            );
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            setIsModifyModalOpen(false);
            toast.success(
              `Payment of ₹${(response.order.amount / 100).toFixed(2)} completed successfully. Booking modified.`
            );
          },
          prefill: {
            name: "User Name", // Replace with actual user data
            email: "user@example.com",
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", () => {
          toast.error("Payment failed. Please try again.");
        });
        rzp.open();
      }
    } catch (error) {
      console.error("Error modifying booking:", error);
      toast.error("Failed to modify booking. Please try again.");
    }
  };

  const generateSeats = () => {
    if (!showDetails?.screenId || !showDetails?.bookedSeat) return [];
    const seats: Seat[] = [];
    const defaultCategory =
      showDetails.screenId.seatCategories.find((cat: any) => cat.id === "regular") || {
        id: "regular",
        name: "Regular",
        price: 100,
        color: "bg-blue-500",
      };

    for (let rowIndex = 0; rowIndex < showDetails.screenId.rows; rowIndex++) {
      const rowLetter = String.fromCharCode(65 + rowIndex);
      const rowNum = rowIndex + 1;

      for (let seatNum = 1; seatNum <= showDetails.screenId.seatsPerRow; seatNum++) {
        const specialSeat = showDetails.screenId.specialSeats.find(
          (ss: any) => ss.row === rowNum && ss.seat === seatNum
        );
        const category = specialSeat
          ? showDetails.screenId.seatCategories.find((cat: any) => cat.id === specialSeat.categoryId) || defaultCategory
          : defaultCategory;

        const isBooked = showDetails.bookedSeat.some(
          (bs: any) => bs.row === rowNum && bs.seat === seatNum
        ) && !ticket.seats.includes(`${rowLetter}${seatNum}`);

        seats.push({
          id: `${rowLetter}${seatNum}`,
          row: rowLetter,
          number: seatNum,
          isAvailable: !isBooked,
          category,
        });
      }
    }
    return seats;
  };

  const seats = generateSeats();
  const seatsPerRow = showDetails?.screenId?.seatsPerRow || 0;
  const rowCount = showDetails?.screenId?.rows || 0;

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat || !seat.isAvailable) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return total + (seat?.category.price || 0);
    }, 0);
  };

  const priceDifference = calculateTotal() - ticket.totalAmount;

  return (
    <>
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
                <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2">
                  {ticket.movieTitle}
                </h3>
                <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <AiOutlineCalendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{format(showtime, "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <AiOutlineClockCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{format(showtime, "p")}</span>
                  </div>
                  {showBookingDate && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <AiOutlineCalendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Booked on: {format(bookingDate, "PPP")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <AiOutlineEnvironment className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="line-clamp-1">
                      {ticket.theater}, {ticket.location}
                    </span>
                  </div>
                </div>
              </div>
              <Badge
                variant={
                  ticket.status === "confirmed"
                    ? "default"
                    : ticket.status === "pending"
                    ? "secondary"
                    : "destructive"
                }
                className="capitalize text-xs sm:text-sm"
              >
                {ticket.status}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-4 text-xs sm:text-sm">
              <div>
                Seats: <span className="font-medium">{ticket.seats.join(", ")}</span>
              </div>
              <div>
                Amount: <span className="font-medium">₹{ticket.totalAmount.toFixed(2)}</span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                    onClick={generateAndDownloadQR}
                  >
                    <AiOutlineDownload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Download QR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                    onClick={() => setIsModifyModalOpen(true)}
                    disabled={!ticket.showtimeId}
                  >
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

      <Dialog open={isModifyModalOpen} onOpenChange={setIsModifyModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Modify Booking - {ticket.movieTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isShowLoading ? (
              <div>Loading seat layout...</div>
            ) : !ticket.showtimeId ? (
              <div className="text-center text-muted-foreground">
                Cannot load seat layout: Showtime information missing
              </div>
            ) : !showDetails || !showDetails.screenId || !showDetails.bookedSeat ? (
              <div className="text-center text-muted-foreground">
                Unable to load seat layout: Show details unavailable
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
                              const seat = seats.find((s) => s.id === seatId);
                              const isSelected = selectedSeats.includes(seatId);
                              const isAvailable = seat?.isAvailable ?? false;
                              const categoryColor = seat?.category.color || "bg-gray-500";

                              return (
                                <button
                                  key={seatIndex}
                                  onClick={() => handleSeatClick(seatId)}
                                  className={cn(
                                    "w-6 h-6 rounded-t-lg text-xs font-medium transition-all duration-200 transform",
                                    categoryColor,
                                    isSelected ? "ring-2 ring-white scale-110 z-10 text-white" : "",
                                    !isSelected && isAvailable ? "hover:scale-105 text-white" : "",
                                    !isAvailable ? "bg-gray-500 cursor-not-allowed text-white" : ""
                                  )}
                                  disabled={!isAvailable}
                                  title={`${seatId} - ${seat?.category.name || "Unknown"} (${
                                    isAvailable ? "Available" : "Booked"
                                  }) - ₹${seat?.category.price || 0}`}
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
                      {showDetails.screenId.seatCategories.map((category: any) => (
                        <div key={category.id} className="flex items-center">
                          <div className={`w-4 h-4 rounded ${category.color} mr-1`}></div>
                          <span className="text-sm">
                            {category.name} (₹{category.price})
                          </span>
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
                          {selectedSeats.map((seatId) => {
                            const seat = seats.find((s) => s.id === seatId);
                            return (
                              <Badge key={seatId} className={`${seat?.category.color} text-white`}>
                                {seatId} (₹{seat?.category.price})
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
                    <span>Total: ₹{calculateTotal()}</span>
                  </div>
                  <div className={priceDifference !== 0 ? "text-lg font-semibold" : ""}>
                    {priceDifference > 0 ? (
                      <span className="text-red-500">
                        Additional Payment: ₹{priceDifference}
                      </span>
                    ) : priceDifference < 0 ? (
                      <span className="text-green-500">
                        Refund: ₹{Math.abs(priceDifference)}
                      </span>
                    ) : (
                      <span>No price change</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModifyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleModifyBooking}
              disabled={modifyMutation.isPending || selectedSeats.length === 0 || isShowLoading || !ticket.showtimeId}
            >
              {modifyMutation.isPending
                ? "Processing..."
                : priceDifference > 0
                ? `Pay ₹${priceDifference} and Confirm`
                : "Confirm Modification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

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
);

export default Ticket;