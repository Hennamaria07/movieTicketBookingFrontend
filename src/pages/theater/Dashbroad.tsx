import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tab';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { FiSettings, FiLogOut, FiFilm, FiDollarSign, FiUsers, FiStar, FiMoon, FiSun, FiArrowRight } from 'react-icons/fi';
import { FaCog, FaTicketAlt, FaCalendarAlt } from 'react-icons/fa';
import { AreaChart, BarChart, PieChart } from '../../components/ui/chart';
import { API_BASE_URL, API_GET_THEATER_BY_ID_URL } from '../../utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Custom animated counter component
const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
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
const StatusBadge = ({ status }) => {
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
  const [theaterId, setTheaterId] = useState('');
  const userId = useSelector((state: RootState) => state.user.auth.userInfo?.id);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalBookings: 0,
      totalRevenue: 0,
      avgOccupancy: 0,
      topMovie: { name: '', seatsSold: 0 }
    },
    revenueData: [],
    peakHoursData: [],
    categoryData: [],
    recentBookings: [],
    upcomingMovies: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch theaterId first
  useEffect(() => {
    const fetchTheaterId = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const theaterResponse = await axios.get(`${API_GET_THEATER_BY_ID_URL}/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const theaterData = theaterResponse.data.data;
        setTheaterId(theaterData?._id || '');
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
    }
  }, [userId]);

  // Fetch dashboard data once theaterId is available
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!theaterId) return; // Wait until theaterId is set

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        };

        const [
          overviewRes,
          revenueRes,
          peakHoursRes,
          categoriesRes,
          bookingsRes,
          showsRes
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/theater/${theaterId}/overview`, config),
          axios.get(`${API_BASE_URL}/theater/${theaterId}/revenue`, config),
          axios.get(`${API_BASE_URL}/theater/${theaterId}/peak-hours`, config),
          axios.get(`${API_BASE_URL}/theater/${theaterId}/categories`, config),
          axios.get(`${API_BASE_URL}/theater/${theaterId}/recent-bookings`, config),
          axios.get(`${API_BASE_URL}/theater/${theaterId}/upcoming-shows`, config)
        ]);

        const overview = overviewRes.data;
        const revenue = revenueRes.data;
        const peakHours = peakHoursRes.data;
        const categories = categoriesRes.data;
        const bookings = bookingsRes.data;
        const shows = showsRes.data;

        if (!overview.success || !revenue.success || !peakHours.success || 
            !categories.success || !bookings.success || !shows.success) {
          throw new Error('Failed to fetch dashboard data');
        }

        setDashboardData({
          overview: overview.data,
          revenueData: revenue.data,
          peakHoursData: peakHours.data,
          categoryData: categories.data,
          recentBookings: bookings.data,
          upcomingMovies: shows.data
        });
      } catch (err) {
        setError(axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : err.message || 'Error fetching dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [theaterId]);

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

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen mt-6 text-slate-900 dark:text-slate-50">
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
                <AnimatedCounter value={dashboardData.overview.totalBookings} />
              </div>
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
                <AnimatedCounter value={dashboardData.overview.totalRevenue} prefix="$" />
              </div>
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
                <AnimatedCounter value={dashboardData.overview.avgOccupancy} suffix="%" />
              </div>
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
                <span className="text-lg font-semibold">
                  {dashboardData.overview.topMovie?.name || 'N/A'}
                </span>
              </div>
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
                      data={dashboardData.revenueData}
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
                      data={dashboardData.peakHoursData}
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
                      data={dashboardData.categoryData}
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
                    {dashboardData.recentBookings.map((booking) => (
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
                  {dashboardData.upcomingMovies.map((movie) => (
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