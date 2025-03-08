import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tab';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FiSettings, FiLogOut, FiFilm, FiDollarSign, FiUsers, FiStar, FiMoon, FiSun, FiArrowRight } from 'react-icons/fi';
import { FaCog, FaTicketAlt, FaCalendarAlt } from 'react-icons/fa';
// import { Badge } from '@/components/ui/badge';
import { AreaChart, BarChart, PieChart } from '../../components/ui/chart';

// Mock data for the charts
const revenueData = [
  { date: 'Jan', value: 3200 },
  { date: 'Feb', value: 4500 },
  { date: 'Mar', value: 4200 },
  { date: 'Apr', value: 5600 },
  { date: 'May', value: 6700 },
  { date: 'Jun', value: 8900 },
  { date: 'Jul', value: 9800 },
];

const peakHoursData = [
  { hour: '10AM', bookings: 45 },
  { hour: '12PM', bookings: 78 },
  { hour: '2PM', bookings: 123 },
  { hour: '4PM', bookings: 156 },
  { hour: '6PM', bookings: 198 },
  { hour: '8PM', bookings: 210 },
  { hour: '10PM', bookings: 167 },
];

const categoryData = [
  { name: 'Action', value: 35 },
  { name: 'Drama', value: 20 },
  { name: 'Comedy', value: 25 },
  { name: 'Horror', value: 10 },
  { name: 'Sci-Fi', value: 10 },
];

const recentBookings = [
  { id: 1, movie: 'Interstellar', showtime: 'Today, 3:00 PM', seatType: 'Premium', amount: '$24.00' },
  { id: 2, movie: 'Inception', showtime: 'Today, 6:30 PM', seatType: 'Regular', amount: '$18.00' },
  { id: 3, movie: 'The Godfather', showtime: 'Today, 8:00 PM', seatType: 'VIP', amount: '$32.00' },
  { id: 4, movie: 'Pulp Fiction', showtime: 'Tomorrow, 2:00 PM', seatType: 'Regular', amount: '$18.00' },
  { id: 5, movie: 'The Dark Knight', showtime: 'Tomorrow, 7:00 PM', seatType: 'Premium', amount: '$24.00' },
];

const upcomingMovies = [
  { id: 1, title: 'Dune: Part Two', time: '3:00 PM, 6:00 PM, 9:00 PM', status: 'High Demand' },
  { id: 2, title: 'The Batman', time: '2:00 PM, 5:00 PM, 8:00 PM', status: 'Available' },
  { id: 3, title: 'Oppenheimer', time: '4:00 PM, 7:00 PM', status: 'Sold Out' },
  { id: 4, title: 'Deadpool & Wolverine', time: '1:00 PM, 4:00 PM, 7:00 PM, 10:00 PM', status: 'Available' },
];

// Custom animated counter component
const AnimatedCounter = ({ value, prefix = '', suffix = '' }: any) => {
  const [count, setCount] = useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (count < value) {
        setCount(prevCount => Math.min(prevCount + Math.ceil(value / 20), value));
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [count, value]);
  
  return (
    <span className="text-2xl font-bold">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let color;
  
  switch(status) {
    case 'High Demand':
      color = 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      break;
    case 'Available':
      color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      break;
    case 'Sold Out':
      color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      break;
    default:
      color = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
};

const TheaterDashboard = () => {
  const { theme, setTheme } = useTheme();
  
  const dashboardVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };
  
  return (
    <div className="min-h-screen mt-6 text-slate-900 dark:text-slate-50">
      {/* Header */}
      
      {/* Main content */}
      <motion.main
        className="container mx-auto px-4 py-6 space-y-6"
        variants={dashboardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, Admin</h2>
                  <p className="mt-1 opacity-90">Here's what's happening at Starlite Cinemas today</p>
                </div>
                <Button className="mt-4 md:mt-0 bg-white text-indigo-700 hover:bg-slate-100 hover:text-indigo-800">
                  View All Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Dashboard metrics */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FaTicketAlt className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                <AnimatedCounter value={1852} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FiDollarSign className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                <AnimatedCounter value={42865} prefix="$" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                +8.2% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Average Occupancy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FiUsers className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                <AnimatedCounter value={78} suffix="%" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                +3.7% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Top Performing Movie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FiStar className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                <span className="text-lg font-semibold">Dune: Part Two</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                96% seats sold
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Charts section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-bold mb-4">Statistics & Analytics</h2>
          <Tabs defaultValue="revenue">
            <TabsList className="mb-4">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="peaks">Peak Hours</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                  <CardDescription>Total ticket sales revenue for the past 7 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <AreaChart
                      data={revenueData}
                      index="date"
                      categories={["value"]}
                      colors={["indigo"]}
                      valueFormatter={(value) => `$${value.toLocaleString()}`}
                      className="h-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="peaks">
              <Card>
                <CardHeader>
                  <CardTitle>Peak Booking Hours</CardTitle>
                  <CardDescription>Number of bookings by hour</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BarChart
                      data={peakHoursData}
                      index="hour"
                      categories={["bookings"]}
                      colors={["amber"]}
                      valueFormatter={(value) => `${value} bookings`}
                      className="h-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Movie Category Distribution</CardTitle>
                  <CardDescription>Based on ticket sales in the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <PieChart
                      data={categoryData}
                      index="name"
                      category="value"
                      colors={["indigo", "violet", "amber", "emerald", "rose"]}
                      valueFormatter={(value) => `${value}%`}
                      className="h-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
        
        {/* Recent bookings and upcoming movies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent bookings table */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Last 5 bookings made on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Movie</TableHead>
                      <TableHead>Showtime</TableHead>
                      <TableHead>Seat Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.movie}</TableCell>
                        <TableCell>{booking.showtime}</TableCell>
                        <TableCell>{booking.seatType}</TableCell>
                        <TableCell className="text-right">{booking.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="ghost" className="w-full mt-4 text-indigo-600 dark:text-indigo-400">
                  View All Bookings <FiArrowRight className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Upcoming movies */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Shows</CardTitle>
                <CardDescription>Today and tomorrow's screenings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMovies.map((movie) => (
                    <motion.div 
                      key={movie.id}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{movie.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            <FaCalendarAlt className="inline mr-1" /> {movie.time}
                          </p>
                        </div>
                        <StatusBadge status={movie.status} />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-indigo-600 dark:text-indigo-400">
                  Manage All Shows <FiArrowRight className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.main>
      
    </div>
  );
};

export default TheaterDashboard;