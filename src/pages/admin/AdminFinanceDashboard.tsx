import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '../../components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tab';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../../components/ui/select';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, 
  AlertDialogTrigger 
} from '../../components/ui/alert-dialog';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { MdAttachMoney, MdReplay, MdTheaters } from 'react-icons/md';
import { FaHourglassHalf, FaUserCircle, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { BiHash } from 'react-icons/bi';

// Types
type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';
interface Transaction {
  id: string;
  userName: string;
  theaterName: string;
  amount: number;
  paymentMethod: string;
  status: TransactionStatus;
  date: string;
}

interface TheaterCommission {
  theaterName: string;
  ticketPercentage: number;
  fixedFee: number;
  totalEarned: number;
  pendingApproval: boolean;
}

interface FilterState {
  date: string;
  status: string;
  paymentMethod: string;
}

// Sample Data
const transactionData: Transaction[] = [
  { id: 'TXN-001', userName: 'John Doe', theaterName: 'Grand Cinema', amount: 120.50, paymentMethod: 'Credit Card', status: 'Completed', date: '2025-03-01' },
  { id: 'TXN-002', userName: 'Jane Smith', theaterName: 'Starlight Theater', amount: 85.75, paymentMethod: 'PayPal', status: 'Pending', date: '2025-03-02' },
  { id: 'TXN-003', userName: 'Mike Johnson', theaterName: 'City View Cinemas', amount: 45.00, paymentMethod: 'Debit Card', status: 'Completed', date: '2025-03-02' },
  { id: 'TXN-004', userName: 'Sarah Williams', theaterName: 'Grand Cinema', amount: 110.25, paymentMethod: 'Credit Card', status: 'Refunded', date: '2025-03-01' },
  { id: 'TXN-005', userName: 'David Brown', theaterName: 'Starlight Theater', amount: 65.50, paymentMethod: 'PayPal', status: 'Failed', date: '2025-03-03' },
];

const theaterCommissions: TheaterCommission[] = [
  { theaterName: 'Grand Cinema', ticketPercentage: 8.5, fixedFee: 250, totalEarned: 15250, pendingApproval: false },
  { theaterName: 'Starlight Theater', ticketPercentage: 7.0, fixedFee: 200, totalEarned: 12800, pendingApproval: true },
  { theaterName: 'City View Cinemas', ticketPercentage: 9.5, fixedFee: 300, totalEarned: 18500, pendingApproval: false },
];

const revenueData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 15000 },
  { month: 'Mar', revenue: 18000 },
  { month: 'Apr', revenue: 16000 },
  { month: 'May', revenue: 21000 },
  { month: 'Jun', revenue: 25000 },
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

// AnimatedCounter Component
const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string; decimals?: number }> = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
  const [count, setCount] = React.useState<number>(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (count < value) {
        setCount(prevCount => Math.min(prevCount + Math.ceil(value / 20), value));
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [count, value]);

  return (
    <span className="text-xl sm:text-2xl font-bold">
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
};

const AdminFinanceDashboard: React.FC = () => {
  const [filter, setFilter] = useState<FilterState>({ date: '', status: 'all', paymentMethod: 'all' });
  const [selectedTab, setSelectedTab] = useState('transaction');
  const [commissionChanges, setCommissionChanges] = useState<{ [key: number]: { ticketPercentage: number; fixedFee: number } }>({});

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  const filteredTransactions = transactionData.filter((t) => (
    (!filter.date || t.date === filter.date) &&
    (filter.status === 'all' || t.status === filter.status) &&
    (filter.paymentMethod === 'all' || t.paymentMethod === filter.paymentMethod)
  ));

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.status === 'Completed' ? t.amount : 0), 0);
  const pendingCount = filteredTransactions.filter(t => t.status === 'Pending').length;
  const completedCount = filteredTransactions.filter(t => t.status === 'Completed').length;
  const refundedAmount = filteredTransactions.filter(t => t.status === 'Refunded').reduce((sum, t) => sum + t.amount, 0);

  const handleCommissionChange = (index: number, field: 'ticketPercentage' | 'fixedFee', value: number) => {
    setCommissionChanges((prev) => ({
      ...prev,
      [index]: { ...prev[index], [field]: value },
    }));
  };

  const saveCommission = (index: number) => {
    const changes = commissionChanges[index];
    if (changes) {
      theaterCommissions[index] = { 
        ...theaterCommissions[index], 
        ...changes, 
        pendingApproval: Math.abs(changes.ticketPercentage - theaterCommissions[index].ticketPercentage) > 1 
      };
    }
    setCommissionChanges((prev: any) => ({ ...prev, [index]: undefined }));
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    console.log(`Exporting as ${format}`); // Replace with actual export logic
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6">
      <motion.div className="max-w-7xl mx-auto space-y-6" variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" variants={itemVariants}>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Revenue & Finance Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monitor, manage, and analyze financials</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => exportReport('csv')} className="w-full sm:w-auto">Export CSV</Button>
        </motion.div>

        {/* Overview Cards */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <Card className="w-full">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</CardTitle>
                <MdAttachMoney className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MdAttachMoney className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                  <AnimatedCounter value={totalRevenue} prefix="$" decimals={2} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="w-full">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending</CardTitle>
                <FaHourglassHalf className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FaHourglassHalf className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
                  <AnimatedCounter value={pendingCount} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="w-full">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</CardTitle>
                <AiOutlineCheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AiOutlineCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                  <AnimatedCounter value={completedCount} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="w-full">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Refunded</CardTitle>
                <MdReplay className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MdReplay className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                  <AnimatedCounter value={refundedAmount} prefix="$" decimals={2} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 gap-2">
            <TabsTrigger value="transaction" className="text-xs sm:text-sm">Transactions</TabsTrigger>
            <TabsTrigger value="commission" className="text-xs sm:text-sm">Commissions</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
          </TabsList>

          {/* Transaction Monitoring */}
          <TabsContent value="transaction">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <Select value={filter.status} onValueChange={(v) => handleFilterChange('status', v)}>
                    <SelectTrigger className="w-full sm:w-40 text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filter.paymentMethod} onValueChange={(v) => handleFilterChange('paymentMethod', v)}>
                    <SelectTrigger className="w-full sm:w-40 text-sm">
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="date" 
                    value={filter.date} 
                    onChange={(e) => handleFilterChange('date', e.target.value)} 
                    className="w-full sm:w-40 text-sm" 
                  />
                </div>
                <div className="md:hidden space-y-4">
                  <AnimatePresence>
                    {filteredTransactions.map((t) => (
                      <motion.div key={t.id} variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
                        <Card>
                          <CardContent className="p-4 text-sm">
                            <div className="flex justify-between">
                              <span><BiHash /> {t.id}</span>
                              <Badge className={t.status === 'Completed' ? 'bg-green-100 text-green-800' : t.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : t.status === 'Refunded' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}>{t.status}</Badge>
                            </div>
                            <p><FaUserCircle /> {t.userName}</p>
                            <p><MdTheaters /> {t.theaterName}</p>
                            <p><FaMoneyBillWave /> ${t.amount.toFixed(2)}</p>
                            <p><FaCreditCard /> {t.paymentMethod}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="hidden md:block bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <thead className="bg-slate-50 dark:bg-zinc-950 border-b">
                          <tr>
                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase"><BiHash /> ID</TableHead>
                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase"><FaUserCircle /> User</TableHead>
                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase"><MdTheaters /> Theater</TableHead>
                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase"><FaMoneyBillWave /> Amount</TableHead>
                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase"><FaCreditCard /> Method</TableHead>
                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</TableHead>
                          </tr>
                        </thead>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                        <AnimatePresence>
                          {filteredTransactions.map((t) => (
                            <motion.tr 
                              key={t.id} 
                              variants={itemVariants} 
                              initial="hidden" 
                              animate="visible" 
                              exit="hidden" 
                              className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                              <TableCell className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{t.id}</TableCell>
                              <TableCell className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{t.userName}</TableCell>
                              <TableCell className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{t.theaterName}</TableCell>
                              <TableCell className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">${t.amount.toFixed(2)}</TableCell>
                              <TableCell className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{t.paymentMethod}</TableCell>
                              <TableCell className="px-4 py-3">
                                <Badge className={t.status === 'Completed' ? 'bg-green-100 text-green-800' : t.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : t.status === 'Refunded' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}>{t.status}</Badge>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commission Management */}
          <TabsContent value="commission">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commission Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Theater</TableHead>
                        <TableHead>Ticket %</TableHead>
                        <TableHead>Fixed Fee</TableHead>
                        <TableHead>Earned</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {theaterCommissions.map((t, i) => (
                        <TableRow key={i}>
                          <TableCell>{t.theaterName}</TableCell>
                          <TableCell>
                            {commissionChanges[i] ? (
                              <Input 
                                type="number" 
                                value={commissionChanges[i].ticketPercentage} 
                                onChange={(e) => handleCommissionChange(i, 'ticketPercentage', parseFloat(e.target.value))} 
                                className="w-20 text-sm" 
                              />
                            ) : t.ticketPercentage}%
                          </TableCell>
                          <TableCell>
                            {commissionChanges[i] ? (
                              <Input 
                                type="number" 
                                value={commissionChanges[i].fixedFee} 
                                onChange={(e) => handleCommissionChange(i, 'fixedFee', parseFloat(e.target.value))} 
                                className="w-20 text-sm" 
                              />
                            ) : `$${t.fixedFee}`}
                          </TableCell>
                          <TableCell>${t.totalEarned.toLocaleString()}</TableCell>
                          <TableCell>{t.pendingApproval ? 'Pending' : 'Active'}</TableCell>
                          <TableCell className="text-right">
                            {commissionChanges[i] ? (
                              <Button size="sm" onClick={() => saveCommission(i)}>Save</Button>
                            ) : t.pendingApproval ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">Review</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve Changes?</AlertDialogTitle>
                                    <AlertDialogDescription>Confirm commission update for {t.theaterName}.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Reject</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => t.pendingApproval = false}>Approve</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => setCommissionChanges({ ...commissionChanges, [i]: { ticketPercentage: t.ticketPercentage, fixedFee: t.fixedFee } })}>
                                Edit
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 h-64">
                  <ResponsiveContainer>
                    <BarChart data={theaterCommissions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="theaterName" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalEarned" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics & Reports */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Anomalies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-600 dark:text-red-400">High refund rate detected: 5.2%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer>
                      <BarChart data={[{ name: 'Credit', value: 60 }, { name: 'Debit', value: 25 }, { name: 'PayPal', value: 15 }]}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminFinanceDashboard;