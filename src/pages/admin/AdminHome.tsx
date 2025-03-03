import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '../../components/ui/card';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tab';
import { FaUsers } from 'react-icons/fa';
import { GiTheater } from 'react-icons/gi';
import { MdAttachMoney, MdEventSeat } from 'react-icons/md';
import { FiSend } from 'react-icons/fi';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

// Chat Component from shadcn
import {
    Card as ChatCard,
    CardContent as ChatCardContent,
    CardFooter as ChatCardFooter,
    CardHeader as ChatCardHeader,
    CardTitle as ChatCardTitle,
} from "../../components/ui/card";

// Mock data remains unchanged
const revenueData = [
    { name: 'Jan', daily: 4000, weekly: 24000, monthly: 96000 },
    { name: 'Feb', daily: 3000, weekly: 18000, monthly: 75000 },
    { name: 'Mar', daily: 5000, weekly: 28000, monthly: 110000 },
    { name: 'Apr', daily: 6000, weekly: 32000, monthly: 125000 },
    { name: 'May', daily: 7000, weekly: 38000, monthly: 158000 },
    { name: 'Jun', daily: 8000, weekly: 46000, monthly: 182000 },
];

const userGrowthData = [
    { name: 'Jan', daily: 100, weekly: 720, monthly: 3100 },
    { name: 'Feb', daily: 120, weekly: 780, monthly: 3400 },
    { name: 'Mar', daily: 140, weekly: 850, monthly: 3650 },
    { name: 'Apr', daily: 160, weekly: 950, monthly: 3950 },
    { name: 'May', daily: 190, weekly: 1050, monthly: 4300 },
    { name: 'Jun', daily: 220, weekly: 1200, monthly: 4850 },
];

const recentActivities = [
    { id: 1, action: 'New theater added', user: 'John Doe', date: '2 hours ago', details: 'Cinema Palace - Downtown' },
    { id: 2, action: 'User account updated', user: 'Mary Smith', date: '5 hours ago', details: 'Role changed to Manager' },
    { id: 3, action: 'New promotion created', user: 'Alex Johnson', date: '1 day ago', details: 'Summer Special - 20% Off' },
    { id: 4, action: 'Ticket prices updated', user: 'Sarah Williams', date: '2 days ago', details: 'Premium seats - $25' },
    { id: 5, action: 'System maintenance', user: 'System', date: '3 days ago', details: 'Database optimization' },
];

const initialChatMessages = [
    { id: 1, role: "assistant", content: "Hello! How can I help you with the theater management system today?", timestamp: "09:30 AM" },
    { id: 2, role: "user", content: "I need to check recent bookings status", timestamp: "09:32 AM" },
    { id: 3, role: "assistant", content: "Sure! You can find all recent bookings in the 'Active Bookings' section. Currently there are 732 active bookings.", timestamp: "09:33 AM" },
];

// Interfaces remain unchanged
interface Activity {
    id: number;
    action: string;
    user: string;
    date: string;
    details: string;
}

interface SortConfig {
    key?: keyof Activity | null;
    direction: 'ascending' | 'descending';
}

// Counter component remains unchanged
const Counter = ({ value, duration = 1.5 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value.toString().replace(/,/g, ''));
        const incrementTime = (duration / end) * 1000;

        const timer = setInterval(() => {
            start += Math.ceil(end / (duration * 100));
            if (start > end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <>{count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</>;
};

const AdminDashboard: React.FC = () => {
    const [chartTimeframe, setChartTimeframe] = useState('weekly');
    const [chatVisible, setChatVisible] = useState(false);
    const [chatMessages, setChatMessages] = useState(initialChatMessages);
    const [newMessage, setNewMessage] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });

    const toggleChat = () => setChatVisible(!chatVisible);

    const sendMessage = () => {
        if (newMessage.trim() === '') return;

        const userMessage = {
            id: chatMessages.length + 1,
            role: "user" as const,
            content: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatMessages([...chatMessages, userMessage]);
        setNewMessage('');

        setTimeout(() => {
            const assistantMessage = {
                id: chatMessages.length + 2,
                role: "assistant" as const,
                content: "I've received your message. How else can I assist you with the theater management system?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages(prev => [...prev, assistantMessage]);
        }, 1000);
    };

    // Sorting logic remains unchanged
    const sortedActivities = useMemo(() => {
        let sortableActivities = [...recentActivities];
        if (sortConfig.key !== null) {
            sortableActivities.sort((a, b) => {
                const key = sortConfig.key as keyof Activity;
                if (a[key] < b[key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[key] > b[key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableActivities;
    }, [sortConfig]);

    const requestSort = (key: keyof Activity) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Activity) => {
        if (sortConfig.key !== key) return <FaSort className="ml-1" />;
        if (sortConfig.direction === 'ascending') return <FaSortUp className="ml-1" />;
        return <FaSortDown className="ml-1" />;
    };

    // Animation variants remain unchanged
    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="min-h-screen  text-slate-900 dark:text-slate-200">
            {/* Main Content */}
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                <main className="space-y-6 md:space-y-8">
                    {/* System Overview Section */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold mb-4">System Overview</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
                                <Card>
                                    <CardContent className="pt-4 md:pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
                                                <p className="text-2xl md:text-3xl font-bold"><Counter value={4852} /></p>
                                            </div>
                                            <motion.div whileHover={{ scale: 1.1 }} className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                <FaUsers className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                                            </motion.div>
                                        </div>
                                        <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
                                            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-green-500 font-medium flex items-center">
                                                🔼 12.4%
                                            </motion.span>
                                            <span className="ml-2 text-slate-500 dark:text-slate-400">from last month</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                            <motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
                                <Card>
                                    <CardContent className="pt-4 md:pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">Total Theaters</p>
                                                <p className="text-2xl md:text-3xl font-bold"><Counter value={68} duration={1} /></p>
                                            </div>
                                            <motion.div whileHover={{ scale: 1.1 }} className="h-10 w-10 md:h-12 md:w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                                <GiTheater className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                                            </motion.div>
                                        </div>
                                        <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
                                            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="text-green-500 font-medium flex items-center">
                                                🔼 4.8%
                                            </motion.span>
                                            <span className="ml-2 text-slate-500 dark:text-slate-400">from last month</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                            <motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
                                <Card>
                                    <CardContent className="pt-4 md:pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
                                                <p className="text-2xl md:text-3xl font-bold">$<Counter value={1200000} duration={2} /></p>
                                            </div>
                                            <motion.div whileHover={{ scale: 1.1 }} className="h-10 w-10 md:h-12 md:w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                                <MdAttachMoney className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                                            </motion.div>
                                        </div>
                                        <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
                                            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="text-green-500 font-medium flex items-center">
                                                🔼 8.2%
                                            </motion.span>
                                            <span className="ml-2 text-slate-500 dark:text-slate-400">from last month</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                            <motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.4 }}>
                                <Card>
                                    <CardContent className="pt-4 md:pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">Active Bookings</p>
                                                <p className="text-2xl md:text-3xl font-bold"><Counter value={732} duration={1.2} /></p>
                                            </div>
                                            <motion.div whileHover={{ scale: 1.1 }} className="h-10 w-10 md:h-12 md:w-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                                                <MdEventSeat className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
                                            </motion.div>
                                        </div>
                                        <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
                                            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="text-red-500 font-medium flex items-center">
                                                🔽 2.1%
                                            </motion.span>
                                            <span className="ml-2 text-slate-500 dark:text-slate-400">from last week</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </section>

                    {/* Performance Reports Section */}
                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                            <h2 className="text-xl md:text-2xl font-bold">Performance Reports</h2>
                            <Tabs value={chartTimeframe} onValueChange={setChartTimeframe} className="w-full sm:w-auto">
                                <TabsList className="flex justify-start sm:justify-end">
                                    <TabsTrigger value="daily" className="flex-1 sm:flex-none">Daily</TabsTrigger>
                                    <TabsTrigger value="weekly" className="flex-1 sm:flex-none">Weekly</TabsTrigger>
                                    <TabsTrigger value="monthly" className="flex-1 sm:flex-none">Monthly</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base md:text-lg">Revenue Trends</CardTitle>
                                    <CardDescription className="text-xs md:text-sm">
                                        {chartTimeframe === 'daily' ? 'Daily' : chartTimeframe === 'weekly' ? 'Weekly' : 'Monthly'} revenue over the last 6 months
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 md:h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.1} />
                                                <XAxis dataKey="name" fontSize={12} />
                                                <YAxis fontSize={12} />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey={chartTimeframe} stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base md:text-lg">User Growth</CardTitle>
                                    <CardDescription className="text-xs md:text-sm">
                                        {chartTimeframe === 'daily' ? 'Daily' : chartTimeframe === 'weekly' ? 'Weekly' : 'Monthly'} user registrations over the last 6 months
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 md:h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.1} />
                                                <XAxis dataKey="name" fontSize={12} />
                                                <YAxis fontSize={12} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey={chartTimeframe} fill="#8884d8" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.section>

                    {/* Recent Activity Section */}
                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
                        <h2 className="text-xl md:text-2xl font-bold mb-4">Recent Activity & Alerts</h2>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base md:text-lg">Recent Admin Actions</CardTitle>
                                <CardDescription className="text-xs md:text-sm">The latest actions performed by administrators</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                {/* Mobile View - Cards */}
                                <div className="md:hidden space-y-4">
                                    {sortedActivities.map((activity) => (
                                        <Card key={activity.id} className="p-3">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">{activity.action}</h3>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">{activity.date}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    <p><span className="font-medium">User:</span> {activity.user}</p>
                                                    <p><span className="font-medium">Details:</span> {activity.details}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                {/* Desktop View - Table */}
                                <div className="hidden md:block bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border overflow-x-auto">
                                    <table className="w-full min-w-[600px]">
                                        <thead className="bg-slate-50 dark:bg-zinc-950 border-b">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('action')}>
                                                    <div className="flex items-center">Action {getSortIcon('action')}</div>
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('user')}>
                                                    <div className="flex items-center">User {getSortIcon('user')}</div>
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('details')}>
                                                    <div className="flex items-center">Details {getSortIcon('details')}</div>
                                                </th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('date')}>
                                                    <div className="flex items-center justify-end">Time {getSortIcon('date')}</div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {sortedActivities.map((activity, index) => (
                                                <motion.tr
                                                    key={activity.id}
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.8 + (index * 0.1) }}
                                                >
                                                    <td className="px-4 py-2 text-sm font-medium text-slate-900 dark:text-white">{activity.action}</td>
                                                    <td className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">{activity.user}</td>
                                                    <td className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">{activity.details}</td>
                                                    <td className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 text-right">{activity.date}</td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.section>
                </main>

                {/* Chat Toggle Button for Mobile */}
                <div className="fixed bottom-4 right-4 md:hidden">
                    <Button
                        size="icon"
                        className="rounded-full"
                        onClick={toggleChat}
                    >
                        {chatVisible ? '×' : '💬'}
                    </Button>
                </div>

                {/* Chat Interface */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: chatVisible ? 0 : '100%' }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-0 right-0 w-full sm:w-80 md:w-96 max-h-[80vh] z-40 md:bottom-4 md:right-4"
                >
                    <ChatCard className="shadow-xl border-slate-200 dark:border-slate-700">
                        <ChatCardHeader className="flex justify-between items-center">
                            <ChatCardTitle className="text-base md:text-lg">Support Chat</ChatCardTitle>
                            <Button size="sm" variant="ghost" onClick={toggleChat}>×</Button>
                        </ChatCardHeader>
                        <ChatCardContent className="h-64 md:h-80 overflow-y-auto pb-0">
                            <div className="space-y-4 p-2">
                                {chatMessages.map((message) => (
                                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[80%] rounded-lg p-2 md:p-3 ${message.role === "user" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                                            <div className="text-xs md:text-sm">{message.content}</div>
                                            <div className="mt-1 text-xs opacity-70 text-right">{message.timestamp}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ChatCardContent>
                        <ChatCardFooter className="border-t p-2 md:p-4">
                            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex w-full items-center space-x-2">
                                <Input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 text-sm"
                                />
                                <Button size="icon" type="submit">
                                    <FiSend className="h-4 w-4" />
                                    <span className="sr-only">Send</span>
                                </Button>
                            </form>
                        </ChatCardFooter>
                    </ChatCard>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;