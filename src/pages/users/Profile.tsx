import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  AiOutlineCamera,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineEdit,
  AiOutlineStar,
  AiOutlineWallet,
  AiOutlineSetting,
  AiOutlineLock,
  AiOutlineLogout,
  AiOutlineQrcode,
  AiOutlineDelete
} from 'react-icons/ai'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tab'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { cn } from '../../lib/utils'

interface Booking {
  id: string
  movieTitle: string
  date: string
  time: string
  theater: string
  seats: string[]
  status: 'upcoming' | 'completed' | 'cancelled'
}

interface Review {
  id: string
  movieTitle: string
  rating: number
  review: string
  date: string
}

const mockBookings: Booking[] = [
  {
    id: '1',
    movieTitle: 'Dune: Part Two',
    date: '2024-03-15',
    time: '19:30',
    theater: 'IMAX Cinema City',
    seats: ['G12', 'G13'],
    status: 'upcoming'
  },
  {
    id: '2',
    movieTitle: 'Poor Things',
    date: '2024-03-08',
    time: '20:00',
    theater: 'Cineplex Downtown',
    seats: ['F5'],
    status: 'completed'
  }
]

const mockReviews: Review[] = [
  {
    id: '1',
    movieTitle: 'Poor Things',
    rating: 4.5,
    review: 'A masterpiece of imagination and visual storytelling...',
    date: '2024-03-09'
  }
]

const Profile = () => {
  const [activeTab, setActiveTab] = useState('bookings')
  const [points] = useState(500)
  const [walletBalance] = useState(149.99)
  const [avatarUrl, setAvatarUrl] = useState("/avatars/user.png")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadPhoto = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setAvatarUrl(imageUrl)
      toast.success('Profile photo updated!')
    }
  }

  const handleDownloadTicket = (bookingId: string) => {
    // Implement ticket download logic
    toast.success('Ticket downloaded!')
  }

  const handleCancelBooking = (bookingId: string) => {
    // Implement booking cancellation logic
    toast.success('Booking cancelled! Refund initiated.')
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="relative overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <button 
                onClick={handleUploadPhoto}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              >
                <AiOutlineCamera className="h-6 w-6 text-white" />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">John Doe</h2>
              <div className="flex flex-col md:flex-row gap-4 mt-2 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <AiOutlineMail className="h-4 w-4" />
                  john.doe@example.com
                </span>
                <span className="flex items-center gap-2">
                  <AiOutlinePhone className="h-4 w-4" />
                  +1 234 567 8900
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <AiOutlineEdit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <AiOutlineSetting className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 -z-10" />
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AiOutlineStar className="h-5 w-5 text-yellow-500" />
              Loyalty Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{points} points</div>
            <Progress value={50} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AiOutlineWallet className="h-5 w-5 text-green-500" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletBalance}</div>
            <Button variant="outline" size="sm" className="mt-2">
              Add Money
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AiOutlineLock className="h-5 w-5 text-blue-500" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full">
              Enable 2FA
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          {mockBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle>{booking.movieTitle}</CardTitle>
                <CardDescription>
                  {booking.theater} • {booking.date} at {booking.time}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Seats:</span>
                    <span className="font-medium">{booking.seats.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className={cn(
                      "font-medium",
                      booking.status === 'upcoming' && "text-blue-500",
                      booking.status === 'completed' && "text-green-500",
                      booking.status === 'cancelled' && "text-red-500"
                    )}>
                      {booking.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadTicket(booking.id)}
                  >
                    <AiOutlineQrcode className="h-4 w-4 mr-2" />
                    Download Ticket
                  </Button>
                  {booking.status === 'upcoming' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {mockReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>{review.movieTitle}</CardTitle>
                  <div className="flex items-center gap-1">
                    <AiOutlineStar className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">{review.rating}</span>
                  </div>
                </div>
                <CardDescription>{new Date(review.date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{review.review}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <AiOutlineEdit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <AiOutlineDelete className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <AiOutlineLock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AiOutlineSetting className="h-4 w-4 mr-2" />
                Notification Preferences
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-500">
                <AiOutlineLogout className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile
