import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tab';
import { Button } from '../../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { FaChartLine, FaUsers, FaTicketAlt, FaExchangeAlt } from 'react-icons/fa';
import { MdAccessTime, MdLocationOn } from 'react-icons/md';
import { motion } from 'framer-motion';
import { API_BASE_URL, API_GET_THEATER_BY_ID_URL } from '../../utils/api';

const containerVariants = {
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
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const TheaterAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('weekly');
  const [theaterId, setTheaterId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    sales: {
      salesData: [],
      totalRevenue: 0,
      totalTickets: 0,
      refundsProcessed: 0
    },
    demographics: {
      ageDistribution: [],
      locationDistribution: [],
      engagement: {
        returnRate: 0,
        avgVisits: 0,
        satisfactionScore: 0
      }
    },
    peakHours: {
      peakHours: [],
      popularMovieTimes: [],
      capacityUtilization: []
    }
  });

  const userId = useSelector((state) => state.user.auth.userInfo?.id);

  // Fetch theaterId
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

  // Fetch analytics data once theaterId is available
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!theaterId) {
        console.log('Waiting for theaterId...');
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
          params: { timeRange },
          withCredentials: true,
        };

        const [salesRes, demoRes, peakRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/theater/${theaterId}/sales`, config),
          axios.get(`${API_BASE_URL}/theater/${theaterId}/demographics`, config),
          axios.get(`${API_BASE_URL}/theater/${theaterId}/peak-hours`, config)
        ]);

        const newData = {
          sales: salesRes.data.data,
          demographics: demoRes.data.data,
          peakHours: peakRes.data.data
        };
        
        console.log('Analytics Data:', newData);
        setAnalyticsData(newData);
      } catch (err) {
        setError(axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : err.message || 'Error fetching analytics data');
        console.error('Error fetching analytics data:', err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [theaterId, timeRange]);

  // Custom tooltip formatter for INR
  const formatINR = (value) => `₹${value.toLocaleString('en-IN')}`;

  if (loading) return <div className="text-center py-10">Loading analytics dashboard...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <motion.header 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Reports & Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track performance, customer data, and theater usage insights
        </p>
      </motion.header>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <FaChartLine className="text-lg" />
            <span>Sales Reports</span>
          </TabsTrigger>
          <TabsTrigger value="demographics" className="flex items-center gap-2">
            <FaUsers className="text-lg" />
            <span>Customer Demographics</span>
          </TabsTrigger>
          <TabsTrigger value="peakHours" className="flex items-center gap-2">
            <MdAccessTime className="text-lg" />
            <span>Peak Hours Analysis</span>
          </TabsTrigger>
        </TabsList>

        {/* Sales Reports Tab */}
        <TabsContent value="sales">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <FaChartLine className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatINR(analyticsData.sales.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">+15% from last period</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                  <FaTicketAlt className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.sales.totalTickets.toLocaleString('en-IN')}</div>
                  <p className="text-xs text-muted-foreground">+8% from last period</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Refunds Processed</CardTitle>
                  <FaExchangeAlt className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.sales.refundsProcessed.toLocaleString('en-IN')}</div>
                  <p className="text-xs text-muted-foreground">-3% from last period</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sales Trends</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant={timeRange === 'daily' ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setTimeRange('daily')}
                    >
                      Daily
                    </Button>
                    <Button 
                      variant={timeRange === 'weekly' ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setTimeRange('weekly')}
                    >
                      Weekly
                    </Button>
                    <Button 
                      variant={timeRange === 'monthly' ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setTimeRange('monthly')}
                    >
                      Monthly
                    </Button>
                  </div>
                </div>
                <CardDescription>Revenue and ticket sales over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full"> {/* Increased height for visibility */}
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.sales.salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tickFormatter={formatINR} />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value, name) => name === 'Revenue' ? formatINR(value) : value} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="tickets" name="Tickets Sold" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                  <CardDescription>Customer age demographics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.demographics.ageDistribution}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {analyticsData.demographics.ageDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdLocationOn className="text-lg" />
                    Location Distribution
                  </CardTitle>
                  <CardDescription>Where our customers come from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.demographics.locationDistribution}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {analyticsData.demographics.locationDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Customer Engagement</CardTitle>
                <CardDescription>User activity and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <span className="text-3xl font-bold">{analyticsData.demographics.engagement.returnRate}%</span>
                    <span className="text-sm text-muted-foreground">Return Rate</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <span className="text-3xl font-bold">{analyticsData.demographics.engagement.avgVisits}</span>
                    <span className="text-sm text-muted-foreground">Avg. Visits per Month</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <span className="text-3xl font-bold">{analyticsData.demographics.engagement.satisfactionScore}</span>
                    <span className="text-sm text-muted-foreground">Satisfaction Score</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Peak Hours Tab */}
        <TabsContent value="peakHours">
          <motion.div 
            className="grid grid-cols-1 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Peak Ticket Sales Hours</CardTitle>
                  <CardDescription>When customers are most likely to purchase tickets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.peakHours.peakHours}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}`} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="tickets" 
                          name="Tickets Sold" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Most Popular Movie Times</CardTitle>
                  <CardDescription>Movie attendance by time of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.peakHours.popularMovieTimes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="movie" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}`} />
                        <Legend />
                        <Bar dataKey="morning" name="Morning (10am-2pm)" fill="#FFCE56" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="afternoon" name="Afternoon (2pm-6pm)" fill="#36A2EB" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="evening" name="Evening (6pm-10pm)" fill="#FF6384" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Capacity Utilization</CardTitle>
                  <CardDescription>Theater capacity usage throughout the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {analyticsData?.peakHours?.capacityUtilization?.map((item) => (
                      <div key={item.day} className="flex flex-col items-center">
                        <div className="text-sm font-medium">{item.day}</div>
                        <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-md mt-2 relative overflow-hidden">
                          <div 
                            className="absolute bottom-0 w-full bg-green-500 dark:bg-green-600 transition-all duration-500"
                            style={{ height: `${item.utilization}%` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                            {Math.round(item.utilization)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TheaterAnalyticsDashboard;