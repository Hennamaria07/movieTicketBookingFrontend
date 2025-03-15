import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    FiFilm, FiUsers, FiPlus, FiEdit, FiTrash2, FiX,
} from 'react-icons/fi';
import { FaTicketAlt, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search } from 'lucide-react';
import { API_DELETE_THEATER_SHOW_URL, API_ADD_THEATER_SHOW_URL, API_UPDATE_THEATER_SHOW_URL, API_GET_ALL_THEATER_SHOW_URL, API_ALL_THEATER_HALLS_URL } from '../../utils/api';
import { Toaster, toast } from 'sonner';
import { Label } from '../../components/ui/Label';
import { Checkbox } from '../../components/ui/checkbox';

// Interfaces
interface Show {
    _id: string;
    showName: string;
    Date: string;
    startTime: string;
    endTime: string;
    theaterId: { _id: string; name: string };
    screenId: { _id: string; hallName: string };
    totalSeats: number;
    avaliableSeats: number;
    status: 'avaliable' | 'high demand' | 'sold out' | 'cancelled';
    image?: {
        publicId: string;
        url: string;
    };
    genre: string[];
}

interface FormData {
    showName: string;
    Date: string;
    startTime: string;
    endTime: string;
    theaterId: string;
    screenId: string;
    status: 'avaliable' | 'high demand' | 'sold out' | 'cancelled';
    image?: File | null;
    genre: string[];
}

interface SortConfig {
    key?: keyof Show | null;
    direction: 'ascending' | 'descending';
}

interface Screen {
    _id: string;
    hallName: string;
    totalSeats: number;
    theaterId: string;
}

const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});

const StatusBadge: React.FC<{ status: Show['status'] }> = ({ status }) => {
    let color: string;
    switch (status) {
        case 'high demand':
            color = 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
            break;
        case 'avaliable':
            color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
            break;
        case 'sold out':
            color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
            break;
        case 'cancelled':
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
    const [shows, setShows] = useState<Show[]>([]);
    const [screens, setScreens] = useState<Screen[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingShow, setEditingShow] = useState<Show | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
    const [formData, setFormData] = useState<FormData>({
        showName: '',
        Date: '',
        startTime: '',
        endTime: '',
        theaterId: '',
        screenId: '',
        status: 'avaliable',
        image: null,
        genre: []
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [screensLoading, setScreensLoading] = useState<boolean>(false);
    const [updateImage, setUpdateImage] = useState<boolean>(false);

    // Predefined genre options
    const genreOptions = [
        'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 
        'Thriller', 'Adventure', 'Fantasy', 'Animation', 'Documentary'
    ];

    useEffect(() => {
        fetchShows();
        fetchScreens();
    }, []);

    const fetchShows = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_GET_ALL_THEATER_SHOW_URL, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Shows response:', response.data);
            setShows(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching shows:', err);
            toast.error('Failed to fetch shows');
            setShows([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchScreens = async () => {
        try {
            setScreensLoading(true);
            const response = await axios.get(API_ALL_THEATER_HALLS_URL, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Screens response:', response.data);
            const screensData = Array.isArray(response.data.data) ? response.data.data : [];
            setScreens(screensData);
        } catch (err) {
            console.error('Error fetching screens:', err);
            toast.error('Failed to fetch screens');
            setScreens([]);
        } finally {
            setScreensLoading(false);
        }
    };

    const totalShows = shows.length;
    const totalAvailableSeats = shows.reduce((total, show) => 
        show.status !== 'cancelled' ? total + show.avaliableSeats : total, 0);
    const totalCapacity = shows.reduce((total, show) => 
        show.status !== 'cancelled' ? total + show.totalSeats : total, 0);
    const bookedPercentage = totalCapacity > 0 
        ? Math.round(((totalCapacity - totalAvailableSeats) / totalCapacity) * 100)
        : 0;

    const filteredShows = useMemo(() => {
        return shows.filter(show => {
            const matchesSearch = show.showName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                show.screenId.hallName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDate = !dateFilter || show.Date.includes(dateFilter);
            const matchesStatus = statusFilter === 'all' || !statusFilter || show.status === statusFilter;
            return matchesSearch && matchesDate && matchesStatus;
        });
    }, [shows, searchQuery, dateFilter, statusFilter]);

    const sortedShows = useMemo(() => {
        let sortableShows = [...filteredShows];
        if (sortConfig.key) {
            sortableShows.sort((a, b) => {
                const aValue = sortConfig.key === 'screenId' ? a.screenId.hallName : a[sortConfig.key!];
                const bValue = sortConfig.key === 'screenId' ? b.screenId.hallName : b[sortConfig.key!];
                if (aValue! < bValue!) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue! > bValue!) return sortConfig.direction === 'ascending' ? 1 : -1;
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
        return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData({ ...formData, image: file });
    };

    const handleGenreChange = (genre: string, checked: boolean) => {
        if (checked) {
            setFormData({ ...formData, genre: [...formData.genre, genre] });
        } else {
            setFormData({ ...formData, genre: formData.genre.filter(g => g !== genre) });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formDataToSend = new FormData();
            formDataToSend.append('showName', formData.showName);
            formDataToSend.append('Date', formData.Date);
            formDataToSend.append('startTime', formData.startTime);
            formDataToSend.append('endTime', formData.endTime);
            formDataToSend.append('theaterId', screens.length > 0 ? screens[0].theaterId : '');
            formDataToSend.append('screenId', formData.screenId);
            formDataToSend.append('status', formData.status);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }
            formDataToSend.append('genre', JSON.stringify(formData.genre));

            if (editingShow) {
                await axios.put(`${API_UPDATE_THEATER_SHOW_URL}/${editingShow._id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data',
                         'Authorization': `Bearer ${localStorage.getItem('token')}`
                     }
                });
                toast.success('Show updated successfully');
            } else {
                await axios.post(API_ADD_THEATER_SHOW_URL, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data',
                         'Authorization': `Bearer ${localStorage.getItem('token')}`
                     }
                });
                toast.success('Show added successfully');
            }
            
            await fetchShows();
            setIsModalOpen(false);
            setEditingShow(null);
            setUpdateImage(false);
            setFormData({
                showName: '',
                Date: '',
                startTime: '',
                endTime: '',
                theaterId: '',
                screenId: '',
                status: 'avaliable',
                image: null,
                genre: []
            });
        } catch (err) {
            toast.error('Failed to save show');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (show: Show) => {
        setEditingShow(show);
        setFormData({
            showName: show.showName,
            Date: show.Date.split('T')[0],
            startTime: show.startTime,
            endTime: show.endTime,
            theaterId: show.theaterId._id,
            screenId: show.screenId._id,
            status: show.status,
            image: null,
            genre: show.genre
        });
        setUpdateImage(false);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await api.delete(`${API_DELETE_THEATER_SHOW_URL}/${id}`);
            toast.success('Show deleted successfully');
            await fetchShows();
        } catch (err) {
            toast.error('Failed to delete show');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddShow = () => {
        setEditingShow(null);
        setFormData({
            showName: '',
            Date: '',
            startTime: '',
            endTime: '',
            theaterId: screens.length > 0 ? screens[0].theaterId : '',
            screenId: screens.length > 0 ? screens[0]._id : '',
            status: 'avaliable',
            image: null,
            genre: []
        });
        setUpdateImage(false);
        setIsModalOpen(true);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setDateFilter('');
        setStatusFilter('all');
        setSortConfig({ key: null, direction: 'ascending' });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <Toaster position="top-right" richColors />
            
            {loading && <div className="text-center py-4">Loading...</div>}
            
            <motion.div
                className="max-w-full mx-auto space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
            >
                <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Manage Shows</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add, edit, and manage your theater shows</p>
                    </div>
                    <Button
                        onClick={handleAddShow}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
                        disabled={screensLoading || screens.length === 0}
                    >
                        <FiPlus className="mr-2 h-4 w-4" /> Add Show
                    </Button>
                </motion.div>

                <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
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
                    <Card>
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
                    <Card>
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
                </motion.div>

                <motion.div className="w-full">
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
                                            <SelectItem value="avaliable">Available</SelectItem>
                                            <SelectItem value="high demand">High Demand</SelectItem>
                                            <SelectItem value="sold out">Sold Out</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" onClick={resetFilters}>
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div className="w-full">
                    <div className="md:hidden space-y-4">
                        {sortedShows.map((show) => (
                            <Card key={show._id} className="p-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-medium text-slate-900 dark:text-white truncate">{show.showName}</h3>
                                        <StatusBadge status={show.status} />
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        <p>{new Date(show.Date).toLocaleDateString()} • {show.startTime}</p>
                                        <p>{show.screenId.hallName}</p>
                                        <p>{show.avaliableSeats}/{show.totalSeats}</p>
                                        {show.genre.length > 0 && (
                                            <p>Genres: {show.genre.join(', ')}</p>
                                        )}
                                        {show.image?.url && (
                                            <img src={show.image.url} alt={show.showName} className="w-16 h-16 object-cover rounded" />
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(show)}>
                                            <FiEdit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(show._id)}>
                                            <FiTrash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="hidden md:block w-full overflow-x-auto">
                        <div className="bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border min-w-[768px]">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-zinc-950 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer min-w-[150px]" onClick={() => requestSort('showName')}>
                                            <div className="flex items-center">Show {getSortIcon('showName')}</div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer min-w-[120px]" onClick={() => requestSort('Date')}>
                                            <div className="flex items-center">Date {getSortIcon('Date')}</div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase min-w-[120px]">Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer min-w-[120px]" onClick={() => requestSort('screenId')}>
                                            <div className="flex items-center">Screen {getSortIcon('screenId')}</div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase min-w-[100px]">Capacity</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase min-w-[100px]">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase min-w-[120px]">Genres</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase min-w-[100px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {sortedShows.map((show) => (
                                        <motion.tr key={show._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{show.showName}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{new Date(show.Date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{show.startTime} - {show.endTime}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{show.screenId.hallName}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{show.avaliableSeats}/{show.totalSeats}</td>
                                            <td className="px-4 py-3"><StatusBadge status={show.status} /></td>
                                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{show.genre.join(', ')}</td>
                                           
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(show)}>
                                                        <FiEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(show._id)}>
                                                        <FiTrash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

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

                                <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                                    <div>
                                        <Label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Show Name</Label>
                                        <Input
                                            name="showName"
                                            value={formData.showName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Date</Label>
                                            <Input
                                                type="date"
                                                name="Date"
                                                value={formData.Date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Start Time</Label>
                                            <Input
                                                type="time"
                                                name="startTime"
                                                value={formData.startTime}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium text-slate-700 dark:text-slate-200">End Time</Label>
                                            <Input
                                                type="time"
                                                name="endTime"
                                                value={formData.endTime}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Screen</Label>
                                        {screensLoading ? (
                                            <div>Loading screens...</div>
                                        ) : screens.length === 0 ? (
                                            <div>No screens available</div>
                                        ) : (
                                            <Select 
                                                value={formData.screenId} 
                                                onValueChange={(value) => setFormData({ ...formData, screenId: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a screen" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {screens.map((screen) => (
                                                        <SelectItem 
                                                            key={screen._id} 
                                                            value={screen._id}
                                                        >
                                                            {screen.hallName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Status</Label>
                                        <Select 
                                            value={formData.status} 
                                            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="avaliable">Available</SelectItem>
                                                <SelectItem value="high demand">High Demand</SelectItem>
                                                <SelectItem value="sold out">Sold Out</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        {editingShow ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="updateImage"
                                                        checked={updateImage}
                                                        onCheckedChange={(checked) => setUpdateImage(checked as boolean)}
                                                    />
                                                    <Label htmlFor="updateImage" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                        Update Image
                                                    </Label>
                                                </div>
                                                {updateImage && (
                                                    <Input
                                                        type="file"
                                                        name="image"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />
                                                )}
                                                {editingShow.image?.url && (
                                                    <div className="mt-2">
                                                        <img src={editingShow.image.url} alt="Current" className="w-24 h-24 object-cover rounded" />
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Current Image</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <Label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Image</Label>
                                                <Input
                                                    type="file"
                                                    name="image"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Genres</Label>
                                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                                            {genreOptions.map((genre) => (
                                                <div key={genre} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={genre}
                                                        checked={formData.genre.includes(genre)}
                                                        onCheckedChange={(checked) => handleGenreChange(genre, checked as boolean)}
                                                    />
                                                    <Label htmlFor={genre} className="text-sm text-slate-700 dark:text-slate-200">
                                                        {genre}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className="bg-indigo-600 hover:bg-indigo-700" 
                                            disabled={loading || screensLoading || screens.length === 0}
                                        >
                                            {loading ? 'Saving...' : (editingShow ? 'Update' : 'Add')}
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