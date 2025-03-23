import React, { useState } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
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
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { MdAttachMoney, MdReplay, MdTheaters } from 'react-icons/md';
import { FaHourglassHalf, FaUserCircle, FaMoneyBillWave, FaCreditCard, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { BiHash } from 'react-icons/bi';
import { API_BASE_URL } from '../../utils/api';

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

interface SortConfig {
  key: keyof Transaction | keyof TheaterCommission | null;
  direction: 'ascending' | 'descending';
}

// API Functions
const fetchTransactions = async () => {
  console.log('Fetching all transactions'); // Debug log
  const response = await axios.get(`${API_BASE_URL}/admin/transactions`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return response.data.data;
};

const fetchCommissions = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/commissions`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return response.data.data;
};

const updateCommission = async ({ theaterId, ticketPercentage, fixedFee }: any) => {
  const response = await axios.put(
    `${API_BASE_URL}/admin/commissions`,
    { theaterId, ticketPercentage, fixedFee },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data.data;
};

const fetchAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/analytics`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return response.data.data;
};

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
const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string; decimals?: number }> = ({
  value,
  prefix = '₹',
  suffix = '',
  decimals = 2,
}) => {
  const [count, setCount] = React.useState<number>(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (count < value) {
        setCount((prevCount) => Math.min(prevCount + Math.ceil(value / 20), value));
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [count, value]);

  return (
    <span className="text-xl sm:text-2xl font-bold">
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const AdminFinanceDashboard: React.FC = () => {
  const [filter, setFilter] = useState<FilterState>({ date: '', status: 'all', paymentMethod: 'all' });
  const [selectedTab, setSelectedTab] = useState('transaction');
  const [commissionChanges, setCommissionChanges] = useState<{
    [key: number]: { ticketPercentage: number; fixedFee: number };
  }>({});
  const [transactionSortConfig, setTransactionSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
  const [commissionSortConfig, setCommissionSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });

  const { data: allTransactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'], // No filter in queryKey since filtering is frontend
    queryFn: fetchTransactions,
  });

  const { data: theaterCommissions = [], isLoading: commissionsLoading } = useQuery<TheaterCommission[]>({
    queryKey: ['commissions'],
    queryFn: fetchCommissions,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
  });

  const commissionMutation = useMutation({
    mutationFn: updateCommission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
    },
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilter((prev) => {
      const newFilter = { ...prev, [key]: value };
      console.log('Filter updated:', newFilter); // Debug log
      return newFilter;
    });
  };

  // Frontend Filtering Logic
  const filteredTransactions = React.useMemo(() => {
    let result = [...allTransactions];

    if (filter.date) {
      result = result.filter((t) => t.date === filter.date);
    }
    if (filter.status !== 'all') {
      result = result.filter((t) => t.status === filter.status);
    }
    if (filter.paymentMethod !== 'all') {
      result = result.filter((t) => t.paymentMethod === filter.paymentMethod);
    }

    return result;
  }, [allTransactions, filter]);

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.status === 'Completed' ? t.amount : 0), 0);
  const pendingCount = filteredTransactions.filter((t) => t.status === 'Pending').length;
  const completedCount = filteredTransactions.filter((t) => t.status === 'Completed').length;
  const refundedAmount = filteredTransactions.filter((t) => t.status === 'Refunded').reduce((sum, t) => sum + t.amount, 0);

  const handleCommissionChange = (index: number, field: 'ticketPercentage' | 'fixedFee', value: number) => {
    setCommissionChanges((prev) => ({
      ...prev,
      [index]: { ...prev[index], [field]: value },
    }));
  };

  const saveCommission = (index: number) => {
    const changes = commissionChanges[index];
    if (changes) {
      commissionMutation.mutate({
        theaterId: theaterCommissions[index].theaterName,
        ticketPercentage: changes.ticketPercentage,
        fixedFee: changes.fixedFee,
      });
      setCommissionChanges((prev: any) => ({ ...prev, [index]: undefined }));
    }
  };

  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/export`, {
        params: { format },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `finance_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Sorting Functions
  const requestSort = (key: keyof Transaction | keyof TheaterCommission, table: 'transaction' | 'commission') => {
    const setSortConfig = table === 'transaction' ? setTransactionSortConfig : setCommissionSortConfig;
    const currentSortConfig = table === 'transaction' ? transactionSortConfig : commissionSortConfig;
    let direction: 'ascending' | 'descending' = 'ascending';
    if (currentSortConfig.key === key && currentSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Transaction | keyof TheaterCommission, table: 'transaction' | 'commission') => {
    const sortConfig = table === 'transaction' ? transactionSortConfig : commissionSortConfig;
    if (sortConfig.key !== key) return <FaSort className="ml-1" />;
    return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
  };

  const sortedTransactions = React.useMemo(() => {
    let sortableItems = [...filteredTransactions];
    if (transactionSortConfig.key) {
      sortableItems.sort((a, b) => {
        const key = transactionSortConfig.key as keyof Transaction;
        const aValue = a[key];
        const bValue = b[key];
        if (aValue < bValue) return transactionSortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return transactionSortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredTransactions, transactionSortConfig]);

  const sortedCommissions = React.useMemo(() => {
    let sortableItems = [...theaterCommissions];
    if (commissionSortConfig.key) {
      sortableItems.sort((a, b) => {
        const key = commissionSortConfig.key as keyof TheaterCommission;
        const aValue = a[key];
        const bValue = b[key];
        if (aValue < bValue) return commissionSortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return commissionSortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [theaterCommissions, commissionSortConfig]);

  if (transactionsLoading || commissionsLoading || analyticsLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

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
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <MdAttachMoney className="h-4 w-4" /> Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MdAttachMoney className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                  <AnimatedCounter value={totalRevenue} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <FaHourglassHalf className="h-4 w-4" /> Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FaHourglassHalf className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
                  <AnimatedCounter value={pendingCount} decimals={0} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <AiOutlineCheckCircle className="h-4 w-4" /> Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AiOutlineCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                  <AnimatedCounter value={completedCount} decimals={0} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <MdReplay className="h-4 w-4" /> Refunded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MdReplay className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                  <AnimatedCounter value={refundedAmount} />
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
                {transactionsLoading ? (
                  <div className="text-center py-4">Loading transactions...</div>
                ) : (
                  <>
                    <div className="md:hidden space-y-4">
                      <AnimatePresence>
                        {sortedTransactions.map((t) => (
                          <motion.div key={t.id} variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
                            <Card>
                              <CardContent className="p-4 text-sm">
                                <div className="flex justify-between">
                                  <span>
                                    <BiHash /> {t.id}
                                  </span>
                                  <Badge
                                    className={
                                      t.status === 'Completed'
                                        ? 'bg-green-100 text-green-800'
                                        : t.status === 'Pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : t.status === 'Refunded'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-red-100 text-red-800'
                                    }
                                  >
                                    {t.status}
                                  </Badge>
                                </div>
                                <p>
                                  <FaUserCircle /> {t.userName}
                                </p>
                                <p>
                                  <MdTheaters /> {t.theaterName}
                                </p>
                                <p>
                                  <FaMoneyBillWave /> ₹{t.amount.toFixed(2)}
                                </p>
                                <p>
                                  <FaCreditCard /> {t.paymentMethod}
                                </p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <div className="hidden md:block rounded-lg shadow-sm border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-zinc-950 border-b">
                            <TableHead
                              className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                              onClick={() => requestSort('id', 'transaction')}
                            >
                              <div className="flex items-center">
                                <BiHash className="mr-2 h-4 w-4" /> ID {getSortIcon('id', 'transaction')}
                              </div>
                            </TableHead>
                            <TableHead
                              className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                              onClick={() => requestSort('userName', 'transaction')}
                            >
                              <div className="flex items-center">
                                <FaUserCircle className="mr-2 h-4 w-4" /> User {getSortIcon('userName', 'transaction')}
                              </div>
                            </TableHead>
                            <TableHead
                              className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                              onClick={() => requestSort('theaterName', 'transaction')}
                            >
                              <div className="flex items-center">
                                <MdTheaters className="mr-2 h-4 w-4" /> Theater {getSortIcon('theaterName', 'transaction')}
                              </div>
                            </TableHead>
                            <TableHead
                              className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                              onClick={() => requestSort('amount', 'transaction')}
                            >
                              <div className="flex items-center">
                                <FaMoneyBillWave className="mr-2 h-4 w-4" /> Amount {getSortIcon('amount', 'transaction')}
                              </div>
                            </TableHead>
                            <TableHead
                              className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                              onClick={() => requestSort('paymentMethod', 'transaction')}
                            >
                              <div className="flex items-center">
                                <FaCreditCard className="mr-2 h-4 w-4" /> Method {getSortIcon('paymentMethod', 'transaction')}
                              </div>
                            </TableHead>
                            <TableHead
                              className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                              onClick={() => requestSort('status', 'transaction')}
                            >
                              <div className="flex items-center">
                                Status {getSortIcon('status', 'transaction')}
                              </div>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                          <AnimatePresence>
                            {sortedTransactions.map((t) => (
                              <motion.tr
                                key={t.id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                              >
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                  {t.id}
                                </TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                  {t.userName}
                                </TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                  {t.theaterName}
                                </TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                  ₹{t.amount.toFixed(2)}
                                </TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                  {t.paymentMethod}
                                </TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                  <Badge
                                    className={
                                      t.status === 'Completed'
                                        ? 'bg-green-100 text-green-800'
                                        : t.status === 'Pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : t.status === 'Refunded'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-red-100 text-red-800'
                                    }
                                  >
                                    {t.status}
                                  </Badge>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
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
                      <TableRow className="bg-slate-50 dark:bg-zinc-950 border-b">
                        <TableHead
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                          onClick={() => requestSort('theaterName', 'commission')}
                        >
                          <div className="flex items-center">
                            Theater {getSortIcon('theaterName', 'commission')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                          onClick={() => requestSort('ticketPercentage', 'commission')}
                        >
                          <div className="flex items-center">
                            Ticket % {getSortIcon('ticketPercentage', 'commission')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                          onClick={() => requestSort('fixedFee', 'commission')}
                        >
                          <div className="flex items-center">
                            Fixed Fee {getSortIcon('fixedFee', 'commission')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                          onClick={() => requestSort('totalEarned', 'commission')}
                        >
                          <div className="flex items-center">
                            Earned {getSortIcon('totalEarned', 'commission')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                          onClick={() => requestSort('pendingApproval', 'commission')}
                        >
                          <div className="flex items-center">
                            Status {getSortIcon('pendingApproval', 'commission')}
                          </div>
                        </TableHead>
                        <TableHead className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                          <div className="flex items-center justify-end">Actions</div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedCommissions.map((t, i) => (
                        <TableRow key={i}>
                          <TableCell className="px-6 py-4 whitespace-nowrap">{t.theaterName}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            {commissionChanges[i] ? (
                              <Input
                                type="number"
                                value={commissionChanges[i].ticketPercentage}
                                onChange={(e) => handleCommissionChange(i, 'ticketPercentage', parseFloat(e.target.value))}
                                className="w-20 text-sm"
                              />
                            ) : (
                              `${t.ticketPercentage}%`
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            {commissionChanges[i] ? (
                              <Input
                                type="number"
                                value={commissionChanges[i].fixedFee}
                                onChange={(e) => handleCommissionChange(i, 'fixedFee', parseFloat(e.target.value))}
                                className="w-20 text-sm"
                              />
                            ) : (
                              `₹${t.fixedFee}`
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">₹{t.totalEarned.toLocaleString()}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">{t.pendingApproval ? 'Pending' : 'Active'}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                            {commissionChanges[i] ? (
                              <Button size="sm" onClick={() => saveCommission(i)}>
                                Save
                              </Button>
                            ) : t.pendingApproval ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    Review
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve Changes?</AlertDialogTitle>
                                    <AlertDialogDescription>Confirm commission update for {t.theaterName}.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Reject</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => (t.pendingApproval = false)}>Approve</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setCommissionChanges({
                                    ...commissionChanges,
                                    [i]: { ticketPercentage: t.ticketPercentage, fixedFee: t.fixedFee },
                                  })
                                }
                              >
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
                    <BarChart data={sortedCommissions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="theaterName" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value}`} />
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
                    <LineChart data={analytics?.revenueTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value}`} />
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
                  {analytics?.anomalies?.map((anomaly: any, index: number) => (
                    <p key={index} className="text-sm text-red-600 dark:text-red-400">
                      {anomaly.message}
                    </p>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer>
                      <BarChart data={analytics?.paymentMethods || []}>
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

// Create QueryClient
const queryClient = new QueryClient();

// Wrap the component with QueryClientProvider
const AdminFinanceDashboardWithProvider = () => (
  <QueryClientProvider client={queryClient}>
    <AdminFinanceDashboard />
  </QueryClientProvider>
);

export default AdminFinanceDashboardWithProvider;