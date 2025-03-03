import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { useTheme } from '../../components/ui/theme-provider';
import { motion } from 'framer-motion';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUsers, FaArrowDown, FaFileAlt } from 'react-icons/fa';
import { MdPersonAdd, MdStorage } from 'react-icons/md';
import { AiOutlineEye, AiOutlineGlobal } from 'react-icons/ai';
import { BiPulse } from 'react-icons/bi';
import { HiOutlineRefresh } from 'react-icons/hi';

// Mock data for demonstration
const trafficData = [
 { day: 'Mon', users: 120, pageViews: 450 },
 { day: 'Tue', users: 150, pageViews: 520 },
 { day: 'Wed', users: 180, pageViews: 610 },
 { day: 'Thu', users: 160, pageViews: 590 },
 { day: 'Fri', users: 200, pageViews: 700 },
 { day: 'Sat', users: 240, pageViews: 800 },
 { day: 'Sun', users: 220, pageViews: 750 },
];

const sourceData = [
 { name: 'Direct', value: 40, color: '#8884d8' },
 { name: 'Organic', value: 25, color: '#82ca9d' },
 { name: 'Referral', value: 15, color: '#ffc658' },
 { name: 'Social', value: 20, color: '#ff8042' },
];

const pageData = [
 { id: 1, name: 'Home Page', views: 12500, timeSpent: '2:35', bounceRate: 32.4 },
 { id: 2, name: 'Ticket Booking', views: 8750, timeSpent: '4:12', bounceRate: 18.7 },
 { id: 3, name: 'Show Details', views: 7200, timeSpent: '3:45', bounceRate: 24.3 },
 { id: 4, name: 'Membership', views: 5300, timeSpent: '2:15', bounceRate: 38.1 },
 { id: 5, name: 'Contact Us', views: 3800, timeSpent: '1:45', bounceRate: 45.2 },
];

const regionData = [
 { region: 'North America', sessions: 45 },
 { region: 'Europe', sessions: 30 },
 { region: 'Asia', sessions: 20 },
 { region: 'Others', sessions: 5 },
];

const serverStatus = [
 { name: 'Web Server', status: 'healthy', uptime: '99.99%', load: '42%' },
 { name: 'Database', status: 'healthy', uptime: '99.95%', load: '38%' },
 { name: 'API Gateway', status: 'warning', uptime: '99.87%', load: '72%' },
 { name: 'Storage', status: 'healthy', uptime: '99.98%', load: '25%' },
];

const SystemAnalyticsPage: React.FC = () => {
 const { theme, setTheme } = useTheme();
 const [activeUsers, setActiveUsers] = useState(123);
 const [timeFrame, setTimeFrame] = useState('weekly');
 const [isCollapsed, setIsCollapsed] = useState({
   traffic: false,
   realtime: false,
 });

 // Simulate changing active users for the real-time display
 useEffect(() => {
   const interval = setInterval(() => {
     setActiveUsers((prev) => Math.floor(prev + (Math.random() * 10) - 3));
   }, 5000);
   return () => clearInterval(interval);
 }, []);

 // Animation variants for sections
 const sectionVariants = {
   hidden: { opacity: 0, y: 20 },
   visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
 };

 const cardVariants = {
   hidden: { opacity: 0, scale: 0.9 },
   visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
 };

 const toggleSection = (section: 'traffic' | 'realtime') => {
   setIsCollapsed(prev => ({
     ...prev,
     [section]: !prev[section]
   }));
 };

 return (
   <div className="container mx-auto px-4 py-8">
     <motion.div 
       initial={{ opacity: 0, y: -20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5 }}
       className="flex justify-between items-center mb-8"
     >
       <div>
         <h1 className="text-3xl font-bold dark:text-white">System Analytics Dashboard</h1>
         <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time performance insights and traffic analysis</p>
       </div>
       
     </motion.div>

     {/* Section 1: Traffic Reports */}
     <motion.div 
       initial="hidden"
       animate="visible"
       variants={sectionVariants}
       className="mb-10"
     >
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-semibold dark:text-white">
           Traffic Reports 📊
         </h2>
        <div className='flex items-center gap-4'>
        <Select value={timeFrame} onValueChange={setTimeFrame}>
           <SelectTrigger className="w-32">
             <SelectValue placeholder="Time Frame" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="daily">Daily</SelectItem>
             <SelectItem value="weekly">Weekly</SelectItem>
             <SelectItem value="monthly">Monthly</SelectItem>
             <SelectItem value="yearly">Yearly</SelectItem>
           </SelectContent>
         </Select>
         <Button size="sm" variant="outline" className="flex items-center gap-1">
           <HiOutlineRefresh className="h-4 w-4" />
           Refresh
         </Button>
        </div>
       </div>
           {/* Overview Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             <motion.div variants={cardVariants}>
               <Card className="overflow-hidden dark:border-slate-700 ">
                 <CardHeader className="bg-blue-50 dark:bg-blue-900/20 pb-2">
                   <CardTitle className="text-lg text-blue-600 dark:text-blue-400 flex items-center gap-2">
                     <FaUsers className="h-5 w-5" />
                     Total Visitors
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-4">
                   <div className="text-3xl font-bold mb-1 dark:text-white">24,532</div>
                   <p className="text-sm text-green-600 dark:text-green-500 flex items-center">
                     +12.5% <span className="ml-1 text-slate-600 dark:text-slate-400">vs last period</span>
                   </p>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div variants={cardVariants}>
               <Card className="overflow-hidden dark:border-slate-700 ">
                 <CardHeader className="bg-green-50 dark:bg-green-900/20 pb-2">
                   <CardTitle className="text-lg text-green-600 dark:text-green-400 flex items-center gap-2">
                     <MdPersonAdd className="h-5 w-5" />
                     New Users
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-4">
                   <div className="text-3xl font-bold mb-1 dark:text-white">1,248</div>
                   <p className="text-sm text-green-600 dark:text-green-500 flex items-center">
                     +8.3% <span className="ml-1 text-slate-600 dark:text-slate-400">vs last period</span>
                   </p>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div variants={cardVariants}>
               <Card className="overflow-hidden dark:border-slate-700 ">
                 <CardHeader className="bg-purple-50 dark:bg-purple-900/20 pb-2">
                   <CardTitle className="text-lg text-purple-600 dark:text-purple-400 flex items-center gap-2">
                     <AiOutlineEye className="h-5 w-5" />
                     Page Views
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-4">
                   <div className="text-3xl font-bold mb-1 dark:text-white">86,425</div>
                   <p className="text-sm text-green-600 dark:text-green-500 flex items-center">
                     +15.2% <span className="ml-1 text-slate-600 dark:text-slate-400">vs last period</span>
                   </p>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div variants={cardVariants}>
               <Card className="overflow-hidden dark:border-slate-700 ">
                 <CardHeader className="bg-amber-50 dark:bg-amber-900/20 pb-2">
                   <CardTitle className="text-lg text-amber-600 dark:text-amber-400 flex items-center gap-2">
                     <FaArrowDown className="h-5 w-5" />
                     Bounce Rate
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-4">
                   <div className="text-3xl font-bold mb-1 dark:text-white">32.4%</div>
                   <p className="text-sm text-red-600 dark:text-red-500 flex items-center">
                     +2.1% <span className="ml-1 text-slate-600 dark:text-slate-400">vs last period</span>
                   </p>
                 </CardContent>
               </Card>
             </motion.div>
           </div>

           {/* Graph-based Traffic Trends */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
             <motion.div 
               variants={cardVariants}
               className="lg:col-span-2"
             >
               <Card className="h-full dark:border-slate-700 ">
                 <CardHeader>
                   <CardTitle>Daily Active Users</CardTitle>
                   <CardDescription>User traffic trends over the past week</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={trafficData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                         <XAxis dataKey="day" className="text-xs fill-slate-600 dark:fill-slate-400" />
                         <YAxis className="text-xs fill-slate-600 dark:fill-slate-400" />
                         <Tooltip 
                           contentStyle={{ 
                             backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                             borderColor: theme === 'dark' ? '#475569' : '#e2e8f0',
                             color: theme === 'dark' ? '#f8fafc' : '#334155'
                           }} 
                         />
                         <Legend />
                         <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                         <Line type="monotone" dataKey="pageViews" stroke="#82ca9d" strokeWidth={2} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div variants={cardVariants}>
               <Card className="h-full dark:border-slate-700 ">
                 <CardHeader>
                   <CardTitle>Traffic Sources</CardTitle>
                   <CardDescription>Distribution of visitor origins</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="h-80 flex items-center justify-center">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={sourceData}
                           cx="50%"
                           cy="50%"
                           labelLine={false}
                           outerRadius={80}
                           fill="#8884d8"
                           dataKey="value"
                           label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                           className="text-xs font-medium fill-slate-700 dark:fill-slate-300"
                         >
                           {sourceData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                         <Tooltip
                           contentStyle={{ 
                             backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                             borderColor: theme === 'dark' ? '#475569' : '#e2e8f0',
                             color: theme === 'dark' ? '#f8fafc' : '#334155'
                           }}
                         />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                 </CardContent>
               </Card>
             </motion.div>
           </div>

           {/* Table for Most Visited Pages */}
           <motion.div variants={cardVariants}>
             <Card className="dark:border-slate-700 ">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <FaFileAlt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                   Most Visited Pages
                 </CardTitle>
                 <CardDescription>Top performing pages by visitor traffic</CardDescription>
               </CardHeader>
               <CardContent>
                 <Table>
                   <TableHeader>
                     <TableRow className="">
                       <TableHead className="w-[300px]">Page Name</TableHead>
                       <TableHead className="text-right">Views</TableHead>
                       <TableHead className="text-right">Avg Time Spent</TableHead>
                       <TableHead className="text-right">Bounce Rate</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {pageData.map((page) => (
                       <TableRow key={page.id} className="">
                         <TableCell className="font-medium">{page.name}</TableCell>
                         <TableCell className="text-right">{page.views.toLocaleString()}</TableCell>
                         <TableCell className="text-right">{page.timeSpent}</TableCell>
                         <TableCell className="text-right">
                           <Badge variant={page.bounceRate < 30 ? "outline" : page.bounceRate < 40 ? "secondary" : "destructive"} className="ml-auto">
                             {page.bounceRate}%
                           </Badge>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </CardContent>
             </Card>
           </motion.div>
     </motion.div>

     {/* Section 2: Real-Time Analytics */}
     <motion.div 
       initial="hidden"
       animate="visible"
       variants={sectionVariants}
       className="mb-10"
     >
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-semibold flex items-center gap-2 dark:text-white">
           Real-Time Analytics ⏳
         </h2>
         <Button
           variant="ghost"
           size="sm"
           onClick={() => toggleSection('realtime')}
           className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
         >
           {isCollapsed.realtime ? 'Expand' : 'Collapse'}
         </Button>
       </div>

       {!isCollapsed.realtime && (
         <>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             {/* Live Visitor Count */}
             <motion.div variants={cardVariants}>
               <Card className="dark:border-slate-700 ">
                 <CardHeader className="pb-3">
                   <CardTitle className="flex items-center gap-2">
                     <BiPulse className="h-5 w-5 text-red-500" />
                     Live Visitor Count
                   </CardTitle>
                   <CardDescription>Users currently active on the platform</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="flex items-center">
                     <div className="relative bg-slate-100 dark:bg-slate-700 h-32 w-full rounded-md overflow-hidden">
                       <div className="absolute inset-0 flex items-center justify-center">
                         <div className="text-4xl font-bold dark:text-white">{activeUsers}</div>
                       </div>
                       <div className="absolute bottom-0 left-0 right-0 h-1">
                         <div className="h-full bg-green-500 animate-pulse"></div>
                       </div>
                     </div>
                   </div>
                   <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                     <span>Updated just now</span>
                     <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                       Live
                     </Badge>
                   </div>
                 </CardContent>
               </Card>
             </motion.div>

             {/* Active Sessions by Region */}
             <motion.div variants={cardVariants}>
               <Card className="dark:border-slate-700 ">
                 <CardHeader className="pb-3">
                   <CardTitle className="flex items-center gap-2">
                     <AiOutlineGlobal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                     Active Sessions by Region
                   </CardTitle>
                   <CardDescription>Geographic distribution of current users</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="h-40">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={regionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                         <XAxis type="number" className="text-xs fill-slate-600 dark:fill-slate-400" />
                         <YAxis dataKey="region" type="category" className="text-xs fill-slate-600 dark:fill-slate-400" />
                         <Tooltip
                           contentStyle={{ 
                             backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                             borderColor: theme === 'dark' ? '#475569' : '#e2e8f0',
                             color: theme === 'dark' ? '#f8fafc' : '#334155'
                           }}
                         />
                         <Bar dataKey="sessions" fill="#8884d8" radius={[0, 4, 4, 0]} />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </CardContent>
               </Card>
             </motion.div>
           </div>

           {/* User Activity Heatmap */}
           <motion.div variants={cardVariants} className="mb-8">
             <Card className="dark:border-slate-700 ">
               <CardHeader>
                 <CardTitle>User Activity Heatmap</CardTitle>
                 <CardDescription>Visualization of user interaction patterns across pages</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-7 gap-1">
                   {Array.from({ length: 24 }).map((_, i) => (
                     <div key={i} className="aspect-square rounded-sm relative overflow-hidden group">
                       <div 
                         className="absolute inset-0 bg-blue-500 opacity-20 dark:opacity-40"
                         style={{ 
                           opacity: Math.max(0.1, Math.min(0.8, Math.random())),
                           backgroundColor: theme === 'dark' ? '#3b82f6' : '#3b82f6'
                         }}
                       ></div>
                       <div className="invisible group-hover:visible absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs">
                         {Math.floor(Math.random() * 100)}
                       </div>
                     </div>
                   ))}
                 </div>
                 <div className="mt-4 flex justify-between items-center">
                   <div className="text-sm text-slate-500 dark:text-slate-400">
                     Each cell represents an hour of activity
                   </div>
                   <div className="flex items-center">
                     <div className="w-24 h-2 bg-gradient-to-r from-blue-100 to-blue-600 dark:from-blue-900 dark:to-blue-400 rounded-full"></div>
                     <div className="flex justify-between w-24 text-xs mt-1">
                       <span className="text-slate-500 dark:text-slate-400">Low</span>
                       <span className="text-slate-500 dark:text-slate-400">High</span>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </motion.div>

           {/* Live Server Status */}
           <motion.div variants={cardVariants}>
             <Card className="dark:border-slate-700 ">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <MdStorage className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                   Live Server Status
                 </CardTitle>
                 <CardDescription>Real-time monitoring of system components</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {serverStatus.map((server, index) => (
                     <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                       <div className="flex items-center gap-3">
                         <div className={`h-3 w-3 rounded-full ${
                           server.status === 'healthy' 
                             ? 'bg-green-500 dark:bg-green-400' 
                             : server.status === 'warning' 
                               ? 'bg-amber-500 dark:bg-amber-400' 
                               : 'bg-red-500 dark:bg-red-400'
                         }`}></div>
                         <div>
                           <div className="font-medium dark:text-white">{server.name}</div>
                           <div className="text-sm text-slate-500 dark:text-slate-400">Uptime: {server.uptime}</div>
                         </div>
                       </div>
                       <div>
                         <Badge variant={
                           parseInt(server.load) < 50 
                             ? "outline" 
                             : parseInt(server.load) < 80 
                               ? "secondary" 
                               : "destructive"
                         }>
                           Load: {server.load}
                         </Badge>
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           </motion.div>
         </>
       )}
     </motion.div>
   </div>
 );
};

export default SystemAnalyticsPage;