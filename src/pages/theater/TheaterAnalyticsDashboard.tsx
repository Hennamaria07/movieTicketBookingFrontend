import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tab';
import { Button } from '../../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { FaChartLine, FaUsers, FaTicketAlt, FaExchangeAlt } from 'react-icons/fa';
import { MdAccessTime, MdLocationOn } from 'react-icons/md';
import { motion } from 'framer-motion';

// Sample data
const salesData = [
  { day: 'Mon', revenue: 1200, tickets: 85 },
  { day: 'Tue', revenue: 900, tickets: 65 },
  { day: 'Wed', revenue: 1500, tickets: 110 },
  { day: 'Thu', revenue: 2200, tickets: 150 },
  { day: 'Fri', revenue: 3500, tickets: 250 },
  { day: 'Sat', revenue: 4200, tickets: 300 },
  { day: 'Sun', revenue: 3800, tickets: 270 }
];

const demographicsData = [
  { name: '18-24', value: 25, color: '#FF6384' },
  { name: '25-34', value: 35, color: '#36A2EB' },
  { name: '35-44', value: 20, color: '#FFCE56' },
  { name: '45-54', value: 10, color: '#4BC0C0' },
  { name: '55+', value: 10, color: '#9966FF' }
];

const locationData = [
  { name: 'Downtown', value: 40, color: '#FF6384' },
  { name: 'Uptown', value: 25, color: '#36A2EB' },
  { name: 'Suburbs', value: 20, color: '#FFCE56' },
  { name: 'Other Areas', value: 15, color: '#4BC0C0' }
];

const peakHoursData = [
  { time: '10:00', tickets: 20 },
  { time: '12:00', tickets: 45 },
  { time: '14:00', tickets: 70 },
  { time: '16:00', tickets: 120 },
  { time: '18:00', tickets: 180 },
  { time: '20:00', tickets: 210 },
  { time: '22:00', tickets: 150 }
];

const popularMovieTimesData = [
  { movie: 'Action Movie', morning: 20, afternoon: 65, evening: 115 },
  { movie: 'Comedy', morning: 15, afternoon: 45, evening: 85 },
  { movie: 'Drama', morning: 10, afternoon: 35, evening: 60 },
  { movie: 'Sci-Fi', morning: 25, afternoon: 50, evening: 100 },
  { movie: 'Horror', morning: 5, afternoon: 25, evening: 70 }
];

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

const TheaterAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('weekly');

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
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <FaChartLine className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$17,300</div>
                  <p className="text-xs text-muted-foreground">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tickets Sold
                  </CardTitle>
                  <FaTicketAlt className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,230</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Refunds Processed
                  </CardTitle>
                  <FaExchangeAlt className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    -3% from last month
                  </p>
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
                <CardDescription>
                  Revenue and ticket sales over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                          borderRadius: '0.5rem',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }} 
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#8884d8" radius={[4, 4, 0, 0]} />
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
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={demographicsData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {demographicsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
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
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={locationData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {locationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
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
                    <span className="text-3xl font-bold">75%</span>
                    <span className="text-sm text-muted-foreground">Return Rate</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <span className="text-3xl font-bold">3.2</span>
                    <span className="text-sm text-muted-foreground">Avg. Visits per Month</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <span className="text-3xl font-bold">4.8</span>
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
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={peakHoursData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                            borderRadius: '0.5rem',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }} 
                        />
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
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={popularMovieTimesData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="movie" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                            borderRadius: '0.5rem',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }} 
                        />
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
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                      // Calculate utilization percentage - sample data
                      const utilization = [45, 35, 50, 65, 85, 95, 80][index];
                      return (
                        <div key={day} className="flex flex-col items-center">
                          <div className="text-sm font-medium">{day}</div>
                          <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-md mt-2 relative overflow-hidden">
                            <div 
                              className="absolute bottom-0 w-full bg-green-500 dark:bg-green-600 transition-all duration-500"
                              style={{ height: `${utilization}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                              {utilization}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
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