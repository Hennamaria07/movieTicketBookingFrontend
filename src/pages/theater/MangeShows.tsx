import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiFilm, FiDollarSign, FiUsers, FiPlus, FiEdit, FiTrash2, FiSearch, FiCalendar, FiX, FiSun, FiMoon
} from 'react-icons/fi';
import { FaTicketAlt, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search } from 'lucide-react';
import { useTheme } from '../../components/ui/theme-provider';

// Interfaces
interface Show {
    id: number;
    movie: string;
    date: string;
    time: string;
    theater: string;
    price: number;
    capacity: number;
    booked: number;
    status: 'Available' | 'High Demand' | 'Sold Out' | 'Cancelled';
}

interface FormData {
    movie: string;
    date: string;
    time: string;
    theater: string;
    price: string;
    capacity: string;
    status: 'Available' | 'High Demand' | 'Sold Out' | 'Cancelled';
}

interface SortConfig {
    key?: keyof Show | null;
    direction: 'ascending' | 'descending';
}

// Mock data
const initialShows: Show[] = [
    {
        id: 1,
        movie: 'Dune: Part Two',
        date: '2025-02-28',
        time: '15:00',
        theater: 'Grand Auditorium',
        price: 24.00,
        capacity: 200,
        booked: 160,
        status: 'Available'
    },
    {
        id: 2,
        movie: 'The Batman',
        date: '2025-02-28',
        time: '18:30',
        theater: 'Skyview IMAX',
        price: 28.00,
        capacity: 180,
        booked: 170,
        status: 'High Demand'
    },
    {
        id: 3,
        movie: 'Oppenheimer',
        date: '2025-02-28',
        time: '20:15',
        theater: 'Starlight Room',
        price: 22.00,
        capacity: 120,
        booked: 120,
        status: 'Sold Out'
    },
    {
        id: 4,
        movie: 'Deadpool & Wolverine',
        date: '2025-03-01',
        time: '16:45',
        theater: 'Grand Auditorium',
        price: 24.00,
        capacity: 200,
        booked: 85,
        status: 'Available'
    },
    {
        id: 5,
        movie: 'Interstellar',
        date: '2025-03-01',
        time: '14:30',
        theater: 'Skyview IMAX',
        price: 26.00,
        capacity: 180,
        booked: 50,
        status: 'Available'
    },
    {
        id: 6,
        movie: 'The Godfather',
        date: '2025-03-01',
        time: '19:00',
        theater: 'Cinema Paradiso',
        price: 18.00,
        capacity: 80,
        booked: 25,
        status: 'Available'
    },
];

const movies: string[] = [
    'Dune: Part Two', 'The Batman', 'Oppenheimer',
    'Deadpool & Wolverine', 'Interstellar', 'The Godfather'
];

const theaters: string[] = [
    'Grand Auditorium',
    'Skyview IMAX',
    'Starlight Room',
    'Cinema Paradiso'
];

// StatusBadge Component
const StatusBadge: React.FC<{ status: Show['status'] }> = ({ status }) => {
    let color: string;
    switch (status) {
        case 'High Demand':
            color = 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
            break;
        case 'Available':
            color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
            break;
        case 'Sold Out':
            color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
            break;
        case 'Cancelled':
            color = 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100';
            break;
        default:
            color = 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100';
    }
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {status}
        </span>
    );
};

// AnimatedCounter Component
const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({ value, prefix = '', suffix = '' }) => {
    const [count, setCount] = useState<number>(0);

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
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
};

const ManageShowsPage: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [shows, setShows] = useState<Show[]>(initialShows);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingShow, setEditingShow] = useState<Show | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all'); // Changed to 'all' for consistency
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
    const [formData, setFormData] = useState<FormData>({
        movie: '', date: '', time: '', theater: '', price: '', capacity: '', status: 'Available'
    });

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } }
    };

    // Calculate statistics
    const totalShows = shows.length;
    const totalAvailableSeats = shows.reduce((total, show) => 
        show.status !== 'Cancelled' ? total + (show.capacity - show.booked) : total, 0);
    const totalRevenue = shows.reduce((total, show) => total + (show.booked * show.price), 0);
    const totalCapacity = shows.reduce((total, show) => 
        show.status !== 'Cancelled' ? total + show.capacity : total, 0);
    const bookedPercentage = Math.round((shows.reduce((total, show) => total + show.booked, 0) / totalCapacity) * 100);

    // Filtering and sorting
    const filteredShows = useMemo(() => {
        return shows.filter(show => {
            const matchesSearch = show.movie.toLowerCase().includes(searchQuery.toLowerCase()) ||
                show.theater.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDate = !dateFilter || show.date.includes(dateFilter);
            const matchesStatus = statusFilter === 'all' || !statusFilter || show.status === statusFilter;
            return matchesSearch && matchesDate && matchesStatus;
        });
    }, [shows, searchQuery, dateFilter, statusFilter]);

    const sortedShows = useMemo(() => {
        let sortableShows = [...filteredShows];
        if (sortConfig.key !== null) {
            sortableShows.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableShows;
    }, [filteredShows, sortConfig]);

    const requestSort = (key: keyof Show) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Show) => {
        if (sortConfig.key !== key) return <FaSort className="ml-1" />;
        if (sortConfig.direction === 'ascending') return <FaSortUp className="ml-1" />;
        return <FaSortDown className="ml-1" />;
    };

    // Form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        if (editingShow) {
            const updatedShows = shows.map(show =>
                show.id === editingShow.id ? {
                    ...formData,
                    id: show.id,
                    booked: show.booked,
                    price: parseFloat(formData.price),
                    capacity: parseInt(formData.capacity)
                } : show
            );
            setShows(updatedShows);
        } else {
            const newShow: Show = {
                ...formData,
                id: shows.length + 1,
                booked: 0,
                price: parseFloat(formData.price),
                capacity: parseInt(formData.capacity)
            };
            setShows([...shows, newShow]);
        }
        setFormData({
            movie: '', date: '', time: '', theater: '', price: '', capacity: '', status: 'Available'
        });
        setEditingShow(null);
        setIsModalOpen(false);
    };

    const handleEdit = (show: Show) => {
        setEditingShow(show);
        setFormData({
            movie: show.movie,
            date: show.date,
            time: show.time,
            theater: show.theater,
            price: show.price.toString(),
            capacity: show.capacity.toString(),
            status: show.status
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setShows(shows.filter(show => show.id !== id));
    };

    const handleAddShow = () => {
        setEditingShow(null);
        setFormData({
            movie: '', date: '', time: '', theater: '', price: '', capacity: '', status: 'Available'
        });
        setIsModalOpen(true);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setDateFilter('');
        setStatusFilter('all'); // Updated to 'all'
        setSortConfig({ key: null, direction: 'ascending' });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 transition-colors duration-200">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-6"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Manage Shows</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add, edit, and manage your theater shows</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleAddShow}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
                        >
                            <FiPlus className="mr-2 h-4 w-4" /> Add Show
                        </Button>
                    </div>
                </motion.div>

                {/* Statistics */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="w-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                                Total Shows
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <FiFilm className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                                <AnimatedCounter value={totalShows} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                                Available Seats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <FaTicketAlt className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                                <AnimatedCounter value={totalAvailableSeats} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                                Occupancy Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <FiUsers className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                                <AnimatedCounter value={bookedPercentage} suffix="%" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                                Total Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <FiDollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                                <AnimatedCounter value={totalRevenue} prefix="$" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Filters */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-4">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        type="text"
                                        placeholder="Search shows..."
                                        className="pl-10 w-full"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                                    <Input
                                        type="date"
                                        className="w-full sm:w-auto flex-1 min-w-[150px]"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    />
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="Available">Available</SelectItem>
                                            <SelectItem value="High Demand">High Demand</SelectItem>
                                            <SelectItem value="Sold Out">Sold Out</SelectItem>
                                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        onClick={resetFilters}
                                        className="w-full sm:w-auto"
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Shows Listing */}
                <motion.div variants={itemVariants}>
                    {/* Mobile View - Cards */}
                    <div className="md:hidden space-y-4">
                        {sortedShows.map((show) => (
                            <Card key={show.id} className="p-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-medium text-slate-900 dark:text-white">{show.movie}</h3>
                                        <StatusBadge status={show.status} />
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        <p>{new Date(show.date).toLocaleDateString()} • {show.time}</p>
                                        <p>{show.theater}</p>
                                        <p>${show.price.toFixed(2)} • {show.booked}/{show.capacity}</p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(show)}>
                                            <FiEdit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(show.id)}>
                                            <FiTrash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {sortedShows.length === 0 && (
                            <p className="text-center py-8 text-slate-500 dark:text-slate-400">No shows found</p>
                        )}
                    </div>

                    {/* Desktop View - Table */}
                    <div className="hidden md:block bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-zinc-950 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('movie')}>
                                            <div className="flex items-center">Movie {getSortIcon('movie')}</div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('date')}>
                                            <div className="flex items-center">Date {getSortIcon('date')}</div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('time')}>
                                            <div className="flex items-center">Time {getSortIcon('time')}</div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Theater</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Capacity</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {sortedShows.map((show) => (
                                        <motion.tr
                                            key={show.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{show.movie}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{new Date(show.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{show.time}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{show.theater}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">${show.price.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                                                {show.booked}/{show.capacity} ({Math.round((show.booked / show.capacity) * 100)}%)
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge status={show.status} /></td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(show)}>
                                                        <FiEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(show.id)}>
                                                        <FiTrash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {sortedShows.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                                No shows found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                {/* Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                                        {editingShow ? 'Edit Show' : 'Add New Show'}
                                    </h3>
                                    <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                                        <FiX className="h-5 w-5" />
                                    </Button>
                                </div>

                                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Movie</label>
                                        <select
                                            name="movie"
                                            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            value={formData.movie}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select a movie</option>
                                            {movies.map((movie) => (
                                                <option key={movie} value={movie}>{movie}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Date</label>
                                            <input
                                                type="date"
                                                name="date"
                                                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Time</label>
                                            <input
                                                type="time"
                                                name="time"
                                                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                value={formData.time}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Theater</label>
                                        <select
                                            name="theater"
                                            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            value={formData.theater}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select a theater</option>
                                            {theaters.map((theater) => (
                                                <option key={theater} value={theater}>{theater}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Price ($)</label>
                                            <input
                                                type="number"
                                                name="price"
                                                min="0"
                                                step="0.01"
                                                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Capacity</label>
                                            <input
                                                type="number"
                                                name="capacity"
                                                min="1"
                                                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                value={formData.capacity}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
                                        <select
                                            name="status"
                                            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="Available">Available</option>
                                            <option value="High Demand">High Demand</option>
                                            <option value="Sold Out">Sold Out</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                                            {editingShow ? 'Update' : 'Add'}
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ManageShowsPage;