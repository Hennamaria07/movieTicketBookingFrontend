import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '../../components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../../components/ui/tab';
import { 
  Input 
} from '../../components/ui/input';
import { 
  Button 
} from '../../components/ui/button';
import { 
  Textarea 
} from '../../components/ui/textarea';
import { 
  Label 
} from '../../components/ui/Label';
import { 
  Switch 
} from '../../components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../components/ui/dialog';
import { 
  Badge 
} from '../../components/ui/badge';
import { 
  FiMoon as Moon,
  FiSun as Sun,
  FiHome as Building,
  FiImage as ImageIcon,
  FiPlusCircle as PlusCircle,
  FiSave as Save,
  FiTrash2 as Trash2,
  FiCoffee as Coffee,
  FiWifi as Wifi,
  FiUserCheck as Accessibility,
  FiFilm as Film,
  FiStar as Popcorn,
  FiBox as Sofa,
  FiVolume2 as DolbyAtmos,
  FiMaximize as IMAX,
  FiWind as FourDX,
  FiZap as Laser,
} from 'react-icons/fi';
import { PiThreeD as ThreeD } from "react-icons/pi";
import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation Schemas
const seatCategorySchema = yup.object({
  id: yup.string().required('Category ID is required'),
  name: yup.string().required('Category name is required'),
  defaultPrice: yup.number().min(0, 'Price must be positive').required('Price is required'),
  color: yup.string().required('Color is required')
});

const specialSeatSchema = yup.object({
  row: yup.number().min(1, 'Row must be at least 1').required('Row is required'),
  seat: yup.number().min(1, 'Seat must be at least 1').required('Seat is required'),
  category: yup.string().required('Category is required')
});

const hallSchema = yup.object().shape({
  id: yup.number().required('Hall ID is required'),
  name: yup.string().required('Hall name is required'),
  rows: yup.number().min(1, 'Must have at least 1 row').required('Rows are required'),
  seatsPerRow: yup.number().min(1, 'Must have at least 1 seat per row').required('Seats per row are required'),
  totalCapacity: yup.number().min(1, 'Total capacity must be positive').required('Total capacity is required'),
  seatCategories: yup.array().of(seatCategorySchema).min(1, 'At least one seat category is required').required('Seat categories are required'),
  specialSeats: yup.array().of(specialSeatSchema).required('Special seats are required')
});

// Type definitions
interface TheaterDetails {
  name: string;
  location: string;
  description: string;
}

interface Amenities {
  cafe: boolean;
  wifi: boolean;
  accessibility: boolean;
  premium: boolean;
  snackBar: boolean;
  recliners: boolean;
  dolbyAtmos: boolean;
  imax: boolean;
  threeD: boolean;
  fourDX: boolean;
  laserProjection: boolean;
}

interface SeatCategory {
  id: string;
  name: string;
  defaultPrice: number;
  color: string;
}

interface SpecialSeat {
  row: number;
  seat: number;
  category: string;
}

interface Hall {
  id: number;
  name: string;
  rows: number;
  seatsPerRow: number;
  totalCapacity: number;
  seatCategories: SeatCategory[];
  specialSeats: SpecialSeat[];
}

const TheaterAdminSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(theme === 'dark');
  const [theaterDetails, setTheaterDetails] = useState<TheaterDetails>({
    name: 'Grand Cinema Complex',
    location: '123 Movie Street, Downtown',
    description: 'Premier movie theater with the latest screening technology and comfortable seating.'
  });
  const [amenities, setAmenities] = useState<Amenities>({
    cafe: true,
    wifi: true,
    accessibility: true,
    premium: true,
    snackBar: true,
    recliners: false,
    dolbyAtmos: true,
    imax: false,
    threeD: true,
    fourDX: false,
    laserProjection: true
  });
  const [halls, setHalls] = useState<Hall[]>([
    { 
      id: 1, 
      name: "Main Theater",
      rows: 10,
      seatsPerRow: 20,
      totalCapacity: 200,
      seatCategories: [
        { id: 'regular', name: 'Regular', defaultPrice: 15, color: 'bg-blue-500' },
        { id: 'premium', name: 'Premium', defaultPrice: 25, color: 'bg-purple-500' },
        { id: 'vip', name: 'VIP', defaultPrice: 40, color: 'bg-amber-500' }
      ],
      specialSeats: [
        { row: 7, seat: 9, category: 'premium' },
        { row: 7, seat: 10, category: 'premium' },
        { row: 7, seat: 11, category: 'premium' },
        { row: 7, seat: 12, category: 'premium' },
        { row: 8, seat: 9, category: 'premium' },
        { row: 8, seat: 10, category: 'premium' },
        { row: 8, seat: 11, category: 'premium' },
        { row: 8, seat: 12, category: 'premium' },
        { row: 9, seat: 8, category: 'vip' },
        { row: 9, seat: 9, category: 'vip' },
        { row: 9, seat: 10, category: 'vip' },
        { row: 9, seat: 11, category: 'vip' },
        { row: 9, seat: 12, category: 'vip' },
        { row: 9, seat: 13, category: 'vip' },
      ]
    },
    { 
      id: 2, 
      name: 'Hall B', 
      rows: 10, 
      seatsPerRow: 15, 
      totalCapacity: 150,
      seatCategories: [
        { id: 'standard', name: 'Standard', defaultPrice: 15, color: 'bg-blue-500' },
        { id: 'premium', name: 'Premium', defaultPrice: 25, color: 'bg-purple-500' }
      ],
      specialSeats: [
        ...[8].flatMap(row => 
          [5, 6, 7].map(seat => ({ row, seat, category: 'premium' }))
        )
      ]
    },
    { 
      id: 3,
      name: 'IMAX Theater',
      rows: 12,
      seatsPerRow: 24,
      totalCapacity: 288,
      seatCategories: [
        { id: 'regular', name: 'Regular', defaultPrice: 18, color: 'bg-blue-500' },
        { id: 'premium', name: 'Premium', defaultPrice: 30, color: 'bg-purple-500' },
        { id: 'vip', name: 'VIP', defaultPrice: 45, color: 'bg-amber-500' },
        { id: 'ultra', name: 'Ultra VIP', defaultPrice: 60, color: 'bg-red-500' }
      ],
      specialSeats: [
        ...[5, 6, 7, 8].flatMap(row => 
          [9, 10, 11, 12, 13, 14, 15].map(seat => ({ row, seat, category: 'premium' }))
        ),
        ...[9, 10].flatMap(row => 
          [8, 9, 10, 11, 12, 13, 14, 15, 16].map(seat => ({ row, seat, category: 'vip' }))
        ),
        ...[11].flatMap(row => 
          [10, 11, 12, 13, 14].map(seat => ({ row, seat, category: 'ultra' }))
        )
      ]
    }
  ]);
  const [isAddHallOpen, setIsAddHallOpen] = useState<boolean>(false);
  const [isEditHallOpen, setIsEditHallOpen] = useState<boolean>(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [previewLayout, setPreviewLayout] = useState<boolean>(false);

  // Form setup for Add Hall
  const addHallForm = useForm<Hall>({
    resolver: yupResolver(hallSchema),
    defaultValues: {
      id: 0,
      name: '',
      rows: 1,
      seatsPerRow: 1,
      totalCapacity: 1,
      seatCategories: [{ id: 'standard', name: 'Standard', defaultPrice: 15, color: 'bg-blue-500' }],
      specialSeats: []
    }
  });

  const editHallForm = useForm<Hall>({
    resolver: yupResolver(hallSchema),
    defaultValues: {
      id: 0,
      name: '',
      rows: 1,
      seatsPerRow: 1,
      totalCapacity: 1,
      seatCategories: [],
      specialSeats: []
    }
  });

  const { control: addControl, handleSubmit: handleAddSubmit, watch: addWatch, setValue: setAddValue } = addHallForm;
  const { control: editControl, handleSubmit: handleEditSubmit, reset: resetEditForm, watch: editWatch, setValue: setEditValue } = editHallForm;

  const { fields: addSeatCategories, append: appendAddCategory, remove: removeAddCategory } = useFieldArray({
    control: addControl,
    name: 'seatCategories'
  });

  const { fields: addSpecialSeats, append: appendAddSpecialSeat, remove: removeAddSpecialSeat } = useFieldArray({
    control: addControl,
    name: 'specialSeats'
  });

  const { fields: editSeatCategories, append: appendEditCategory, remove: removeEditCategory } = useFieldArray({
    control: editControl,
    name: 'seatCategories'
  });

  const { fields: editSpecialSeats, append: appendEditSpecialSeat, remove: removeEditSpecialSeat } = useFieldArray({
    control: editControl,
    name: 'specialSeats'
  });

  const addRows = addWatch('rows');
  const addSeatsPerRow = addWatch('seatsPerRow');
  const addCategories = addWatch('seatCategories');
  const addSpecial = addWatch('specialSeats');
  const editRows = editWatch('rows');
  const editSeatsPerRow = editWatch('seatsPerRow');
  const editCategories = editWatch('seatCategories');
  const editSpecial = editWatch('specialSeats');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } }
  };

  const generateSeatLayout = (rows: number, seatsPerRow: number, specialSeats: SpecialSeat[], seatCategories: SeatCategory[]) => {
    return Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex justify-center my-1 gap-1">
        <div className="w-6 flex items-center justify-center text-sm">
          {String.fromCharCode(65 + rowIndex)}
        </div>
        {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
          const row = rowIndex + 1;
          const seat = seatIndex + 1;
          const specialSeat = specialSeats.find(s => s.row === row && s.seat === seat);
          const category = specialSeat 
            ? seatCategories.find(c => c.id === specialSeat.category)
            : seatCategories.find(c => c.id === 'standard') || seatCategories[0];
          
          return (
            <div
              key={seatIndex}
              className={`
                w-6 h-6 rounded-t-lg text-xs font-medium flex items-center justify-center
                ${category?.color || 'bg-gray-500'} text-white
              `}
              title={`${String.fromCharCode(65 + rowIndex)}${seat} - ${category?.name || 'Standard'} ($${category?.defaultPrice || 0})`}
            >
              {seat}
            </div>
          );
        })}
        <div className="w-6 flex items-center justify-center text-sm">
          {String.fromCharCode(65 + rowIndex)}
        </div>
      </div>
    ));
  };

  const handleTheaterDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTheaterDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle amenities
  const toggleAmenity = (name: keyof Amenities) => {
    setAmenities(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Add new hall
  const onAddHallSubmit = (data: Hall) => {
    const hallId = halls.length > 0 ? Math.max(...halls.map(h => h.id)) + 1 : 1;
    setHalls(prev => [...prev, { ...data, id: hallId, totalCapacity: data.rows * data.seatsPerRow }]);
    addHallForm.reset();
    setIsAddHallOpen(false);
    setPreviewLayout(false);
  };

  // Edit hall
  const handleEditHall = (hall: Hall) => {
    setEditingHall(hall);
    resetEditForm({
      ...hall,
      totalCapacity: hall.rows * hall.seatsPerRow
    });
    setIsEditHallOpen(true);
  };

  const onEditHallSubmit = (data: Hall) => {
    if (!editingHall) return;
    setHalls(prev => prev.map(h => 
      h.id === editingHall.id ? { ...data, id: h.id, totalCapacity: data.rows * data.seatsPerRow } : h
    ));
    setEditingHall(null);
    setIsEditHallOpen(false);
    setPreviewLayout(false);
  };

  // Delete hall
  const deleteHall = (id: number) => {
    setHalls(prev => prev.filter(hall => hall.id !== id));
  };

  // Save all settings
  const saveSettings = () => {
    console.log('Saving settings:', { theaterDetails, amenities, halls });
    // Show success toast or notification in a real app
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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="h-6 w-6" /> 
              Theater Admin Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Configure your theater settings and halls</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 bg-white dark:bg-[hsl(0,0%,3.9%)] border rounded-lg">
              <TabsTrigger value="details">Theater Details</TabsTrigger>
              <TabsTrigger value="halls">Halls Configuration</TabsTrigger>
              <TabsTrigger value="media">Media & Images</TabsTrigger>
            </TabsList>

            {/* Theater Details Tab */}
            <TabsContent value="details">
              <Card className="bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Building className="h-5 w-5" /> 
                    Theater Information
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Update your theater's basic details and amenities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Theater Name</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={theaterDetails.name} 
                          onChange={handleTheaterDetailsChange}
                          className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-slate-700 dark:text-slate-200">Location</Label>
                        <Input 
                          id="location" 
                          name="location" 
                          value={theaterDetails.location} 
                          onChange={handleTheaterDetailsChange}
                          className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-slate-700 dark:text-slate-200">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        value={theaterDetails.description} 
                        onChange={handleTheaterDetailsChange}
                        rows={3}
                        className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3 text-slate-900 dark:text-white">Theater Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="cafe" 
                          checked={amenities.cafe}
                          onCheckedChange={() => toggleAmenity('cafe')}
                          className={amenities.cafe && isDarkTheme ? 'bg-indigo-600' : ''}
                        />
                        <Label htmlFor="cafe" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <Coffee className="h-4 w-4" /> Café
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="wifi" 
                          checked={amenities.wifi}
                          onCheckedChange={() => toggleAmenity('wifi')}
                          className={amenities.wifi && isDarkTheme ? 'bg-indigo-600' : ''}
                        />
                        <Label htmlFor="wifi" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <Wifi className="h-4 w-4" /> Free WiFi
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="accessibility" 
                          checked={amenities.accessibility}
                          onCheckedChange={() => toggleAmenity('accessibility')}
                          className={amenities.accessibility && isDarkTheme ? 'bg-indigo-600' : ''}
                        />
                        <Label htmlFor="accessibility" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <Accessibility className="h-4 w-4" /> Accessibility
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="premium" 
                          checked={amenities.premium}
                          onCheckedChange={() => toggleAmenity('premium')}
                          className={amenities.premium && isDarkTheme ? 'bg-indigo-600' : ''}
                        />
                        <Label htmlFor="premium" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <Film className="h-4 w-4" /> Premium Screens
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="snackBar" 
                          checked={amenities.snackBar}
                          onCheckedChange={() => toggleAmenity('snackBar')}
                          className={amenities.snackBar && isDarkTheme ? 'bg-indigo-600' : ''}
                        />
                        <Label htmlFor="snackBar" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <Popcorn className="h-4 w-4" /> Snack Bar
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="recliners" 
                          checked={amenities.recliners}
                          onCheckedChange={() => toggleAmenity('recliners')}
                          className={amenities.recliners && isDarkTheme ? 'bg-indigo-600' : ''}
                        />
                        <Label htmlFor="recliners" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <Sofa className="h-4 w-4" /> Recliners
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="dolbyAtmos" 
                          checked={amenities.dolbyAtmos}
                          onCheckedChange={() => toggleAmenity('dolbyAtmos')}
                          className={amenities.dolbyAtmos && isDarkTheme ? 'bg-indigo-600' : ''}
                        />
                        <Label htmlFor="dolbyAtmos" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <DolbyAtmos className="h-4 w-4" /> Dolby Atmos
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="imax" 
                          checked={amenities.imax}
                          onCheckedChange={() => toggleAmenity('imax')}
                          className={amenities.imax && isDarkTheme ? 'bg-indigo-600' : ''}
                        />
                        <Label htmlFor="imax" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <IMAX className="h-4 w-4" /> IMAX
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="threeD" 
                          checked={amenities.threeD}
                          onCheckedChange={() => toggleAmenity('threeD')}
                          className={amenities.threeD && isDarkTheme ? 'bg-indigo-600' : ''}
                        />
                        <Label htmlFor="threeD" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <ThreeD className="h-4 w-4" /> 3D
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="fourDX" 
                          checked={amenities.fourDX}
                          onCheckedChange={() => toggleAmenity('fourDX')}
                          className={amenities.fourDX && isDarkTheme ? 'bg-indigo-600' : ''}
                        />
                        <Label htmlFor="fourDX" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <FourDX className="h-4 w-4" /> 4DX
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="laserProjection" 
                          checked={amenities.laserProjection}
                          onCheckedChange={() => toggleAmenity('laserProjection')}
                          className={amenities.laserProjection && isDarkTheme ? 'bg-indigo-600' : ''}
                        />
                        <Label htmlFor="laserProjection" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <Laser className="h-4 w-4" /> Laser Projection
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={saveSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5">
                    <Save className="h-4 w-4" />
                    Save Theater Details
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Halls Configuration Tab */}
            <TabsContent value="halls">
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Theater Halls</h2>
                  <Dialog open={isAddHallOpen} onOpenChange={setIsAddHallOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5">
                        <PlusCircle className="h-4 w-4" />
                        Add New Hall
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-white">Add New Hall</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">
                          Configure hall details, seating layout, categories, and prices
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddSubmit(onAddHallSubmit)} className="grid gap-6 py-4">
                        {/* Basic Hall Details and Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Hall Name</Label>
                              <Controller
                                name="name"
                                control={addControl}
                                render={({ field, fieldState }) => (
                                  <>
                                    <Input 
                                      id="name" 
                                      {...field} 
                                      placeholder="e.g. Main Theater"
                                      className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                    {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                                  </>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="rows" className="text-slate-700 dark:text-slate-200">Number of Rows</Label>
                                <Controller
                                  name="rows"
                                  control={addControl}
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Input 
                                        id="rows" 
                                        type="number" 
                                        {...field} 
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value) || 1;
                                          field.onChange(value);
                                          setAddValue('totalCapacity', value * (addSeatsPerRow || 1));
                                        }}
                                        min="1"
                                        className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                      />
                                      {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                                    </>
                                  )}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="seatsPerRow" className="text-slate-700 dark:text-slate-200">Seats Per Row</Label>
                                <Controller
                                  name="seatsPerRow"
                                  control={addControl}
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Input 
                                        id="seatsPerRow" 
                                        type="number" 
                                        {...field} 
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value) || 1;
                                          field.onChange(value);
                                          setAddValue('totalCapacity', (addRows || 1) * value);
                                        }}
                                        min="1"
                                        className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                      />
                                      {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                                    </>
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Seat Layout Preview */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-slate-700 dark:text-slate-200">Seat Layout Preview</Label>
                              <Switch
                                checked={previewLayout}
                                onCheckedChange={(checked) => setPreviewLayout(checked)}
                              />
                            </div>
                            {previewLayout && (
                              <div className="space-y-4">
                                <div className="mb-4 text-center">
                                  <div className="h-4 mx-auto w-4/5 rounded-t-3xl bg-gray-300 dark:bg-gray-600"></div>
                                  <p className="mt-1 text-xs text-gray-500">SCREEN</p>
                                </div>
                                <div className="overflow-x-auto">
                                  {generateSeatLayout(
                                    addRows || 1,
                                    addSeatsPerRow || 1,
                                    addSpecial || [],
                                    addCategories || [{ id: 'standard', name: 'Standard', defaultPrice: 15, color: 'bg-blue-500' }]
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Seat Categories */}
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-slate-900 dark:text-white">Seat Categories & Pricing</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label className="text-slate-700 dark:text-slate-200">Category Name</Label>
                              <Input 
                                placeholder="e.g. VIP"
                                onChange={(e) => {
                                  const name = e.target.value;
                                  if (name) {
                                    appendAddCategory({
                                      id: name.toLowerCase().replace(/\s+/g, '-'),
                                      name,
                                      defaultPrice: 15,
                                      color: 'bg-blue-500'
                                    });
                                    e.target.value = '';
                                  }
                                }}
                                className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-700 dark:text-slate-200">Price ($)</Label>
                              <Input 
                                type="number" 
                                defaultValue={15}
                                onChange={(e) => {
                                  const defaultPrice = parseFloat(e.target.value) || 0;
                                  appendAddCategory({
                                    id: 'custom',
                                    name: 'Custom',
                                    defaultPrice,
                                    color: 'bg-blue-500'
                                  });
                                  e.target.value = '15';
                                }}
                                min="0"
                                step="1"
                                className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-700 dark:text-slate-200">Color</Label>
                              <Select 
                                onValueChange={(value) => {
                                  appendAddCategory({
                                    id: 'standard',
                                    name: 'Standard',
                                    defaultPrice: 15,
                                    color: value
                                  });
                                }}
                                defaultValue="bg-blue-500"
                              >
                                <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bg-blue-500">Blue</SelectItem>
                                  <SelectItem value="bg-purple-500">Purple</SelectItem>
                                  <SelectItem value="bg-amber-500">Amber</SelectItem>
                                  <SelectItem value="bg-red-500">Red</SelectItem>
                                  <SelectItem value="bg-green-500">Green</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 flex items-end">
                              <Button 
                                type="button" 
                                onClick={() => appendAddCategory({ id: '', name: '', defaultPrice: 0, color: 'bg-blue-500' })} 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                              >
                                <PlusCircle className="h-4 w-4" /> Add
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {addSeatCategories.map((cat, index) => (
                              <div key={cat.id} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded">
                                <div className="flex items-center gap-2 flex-1">
                                  <Controller
                                    name={`seatCategories.${index}.name`}
                                    control={addControl}
                                    render={({ field }) => (
                                      <Input 
                                        {...field} 
                                        placeholder="Name"
                                        className="w-24 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        onChange={(e) => {
                                          field.onChange(e);
                                          setAddValue(`seatCategories.${index}.id`, e.target.value.toLowerCase().replace(/\s+/g, '-'));
                                        }}
                                      />
                                    )}
                                  />
                                  <Controller
                                    name={`seatCategories.${index}.defaultPrice`}
                                    control={addControl}
                                    render={({ field }) => (
                                      <Input 
                                        type="number" 
                                        {...field} 
                                        placeholder="Price"
                                        min="0"
                                        className="w-20 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                      />
                                    )}
                                  />
                                  <Controller
                                    name={`seatCategories.${index}.color`}
                                    control={addControl}
                                    render={({ field }) => (
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-24 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="bg-blue-500">Blue</SelectItem>
                                          <SelectItem value="bg-purple-500">Purple</SelectItem>
                                          <SelectItem value="bg-amber-500">Amber</SelectItem>
                                          <SelectItem value="bg-red-500">Red</SelectItem>
                                          <SelectItem value="bg-green-500">Green</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeAddCategory(index)} 
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Special Seats */}
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-slate-900 dark:text-white">Special Seat Assignments</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-slate-700 dark:text-slate-200">Row</Label>
                              <Input 
                                type="number" 
                                placeholder="1"
                                onChange={(e) => {
                                  const row = parseInt(e.target.value) || 1;
                                  if (addCategories.length > 0) {
                                    appendAddSpecialSeat({
                                      row,
                                      seat: 1,
                                      category: addCategories[0].id
                                    });
                                    e.target.value = '';
                                  }
                                }}
                                min="1"
                                max={addRows || 1}
                                disabled={addCategories.length === 0}
                                className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-700 dark:text-slate-200">Seat</Label>
                              <Input 
                                type="number" 
                                placeholder="1"
                                onChange={(e) => {
                                  const seat = parseInt(e.target.value) || 1;
                                  if (addCategories.length > 0) {
                                    appendAddSpecialSeat({
                                      row: 1,
                                      seat,
                                      category: addCategories[0].id
                                    });
                                    e.target.value = '';
                                  }
                                }}
                                min="1"
                                max={addSeatsPerRow || 1}
                                disabled={addCategories.length === 0}
                                className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-700 dark:text-slate-200">Category</Label>
                              <Select 
                                onValueChange={(value) => {
                                  appendAddSpecialSeat({
                                    row: 1,
                                    seat: 1,
                                    category: value
                                  });
                                }}
                                defaultValue={addCategories[0]?.id}
                                disabled={addCategories.length === 0}
                              >
                                <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {addCategories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            onClick={() => {
                              if (addCategories.length > 0) {
                                appendAddSpecialSeat({ 
                                  row: 1, 
                                  seat: 1, 
                                  category: addCategories[0].id 
                                });
                              }
                            }} 
                            disabled={addCategories.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                          >
                            <PlusCircle className="h-4 w-4" /> Add Special Seat
                          </Button>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {addSpecialSeats.map((seat, index) => (
                              <div key={seat.id} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded">
                                <div className="flex items-center gap-2">
                                  <Controller
                                    name={`specialSeats.${index}.row`}
                                    control={addControl}
                                    render={({ field }) => (
                                      <Input 
                                        type="number" 
                                        {...field} 
                                        min="1"
                                        max={addRows || 1}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                        className="w-16 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                      />
                                    )}
                                  />
                                  <Controller
                                    name={`specialSeats.${index}.seat`}
                                    control={addControl}
                                    render={({ field }) => (
                                      <Input 
                                        type="number" 
                                        {...field} 
                                        min="1"
                                        max={addSeatsPerRow || 1}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                        className="w-16 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                      />
                                    )}
                                  />
                                  <Controller
                                    name={`specialSeats.${index}.category`}
                                    control={addControl}
                                    render={({ field }) => (
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-24 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {addCategories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeAddSpecialSeat(index)} 
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsAddHallOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            Add Hall
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {halls.map(hall => (
                    <Card key={hall.id} className="bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-slate-900 dark:text-white">{hall.name}</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                          <div className="flex flex-wrap gap-1.5 my-1">
                            {hall.seatCategories.map((category) => (
                              <Badge key={category.id} className={category.color}>
                                {category.name} (${category.defaultPrice})
                              </Badge>
                            ))}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">Rows:</span> {hall.rows}
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">Seats Per Row:</span> {hall.seatsPerRow}
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">Total Capacity:</span> {hall.totalCapacity}
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">Special Seats:</span> {hall.specialSeats.length}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button variant="outline" size="sm" onClick={() => deleteHall(hall.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                          onClick={() => handleEditHall(hall)}
                        >
                          <PlusCircle className="h-4 w-4" />
                          Edit Layout
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Edit Hall Dialog */}
                <Dialog open={isEditHallOpen} onOpenChange={setIsEditHallOpen}>
                  <DialogContent className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 dark:text-white">Edit Hall</DialogTitle>
                      <DialogDescription className="text-slate-500 dark:text-slate-400">
                        Update hall layout, categories, and pricing
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit(onEditHallSubmit)} className="grid gap-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-slate-700 dark:text-slate-200">Hall Name</Label>
                            <Controller
                              name="name"
                              control={editControl}
                              render={({ field, fieldState }) => (
                                <>
                                  <Input 
                                    id="edit-name" 
                                    {...field} 
                                    placeholder="e.g. Main Theater"
                                    className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                  />
                                  {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                                </>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-rows" className="text-slate-700 dark:text-slate-200">Number of Rows</Label>
                              <Controller
                                name="rows"
                                control={editControl}
                                render={({ field, fieldState }) => (
                                  <>
                                    <Input 
                                      id="edit-rows" 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 1;
                                        field.onChange(value);
                                        setEditValue('totalCapacity', value * (editSeatsPerRow || 1));
                                      }}
                                      min="1"
                                      className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                    {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                                  </>
                                )}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-seatsPerRow" className="text-slate-700 dark:text-slate-200">Seats Per Row</Label>
                              <Controller
                                name="seatsPerRow"
                                control={editControl}
                                render={({ field, fieldState }) => (
                                  <>
                                    <Input 
                                      id="edit-seatsPerRow" 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 1;
                                        field.onChange(value);
                                        setEditValue('totalCapacity', (editRows || 1) * value);
                                      }}
                                      min="1"
                                      className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                    {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                                  </>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Seat Layout Preview */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-700 dark:text-slate-200">Seat Layout Preview</Label>
                            <Switch
                              checked={previewLayout}
                              onCheckedChange={(checked) => setPreviewLayout(checked)}
                            />
                          </div>
                          {previewLayout && (
                            <div className="space-y-4">
                              <div className="mb-4 text-center">
                                <div className="h-4 mx-auto w-4/5 rounded-t-3xl bg-gray-300 dark:bg-gray-600"></div>
                                <p className="mt-1 text-xs text-gray-500">SCREEN</p>
                              </div>
                              <div className="overflow-x-auto">
                                {generateSeatLayout(
                                  editRows || 1,
                                  editSeatsPerRow || 1,
                                  editSpecial || [],
                                  editCategories || [{ id: 'standard', name: 'Standard', defaultPrice: 15, color: 'bg-blue-500' }]
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Seat Categories */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-slate-900 dark:text-white">Seat Categories & Pricing</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-200">Category Name</Label>
                            <Input 
                              placeholder="e.g. VIP"
                              onChange={(e) => {
                                const name = e.target.value;
                                if (name) {
                                  appendEditCategory({
                                    id: name.toLowerCase().replace(/\s+/g, '-'),
                                    name,
                                    defaultPrice: 15,
                                    color: 'bg-blue-500'
                                  });
                                  e.target.value = '';
                                }
                              }}
                              className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-200">Price ($)</Label>
                            <Input 
                              type="number" 
                              defaultValue={15}
                              onChange={(e) => {
                                const defaultPrice = parseFloat(e.target.value) || 0;
                                appendEditCategory({
                                  id: 'custom',
                                  name: 'Custom',
                                  defaultPrice,
                                  color: 'bg-blue-500'
                                });
                                e.target.value = '15';
                              }}
                              min="0"
                              step="1"
                              className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-200">Color</Label>
                            <Select 
                              onValueChange={(value) => {
                                appendEditCategory({
                                  id: 'standard',
                                  name: 'Standard',
                                  defaultPrice: 15,
                                  color: value
                                });
                              }}
                              defaultValue="bg-blue-500"
                            >
                              <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bg-blue-500">Blue</SelectItem>
                                <SelectItem value="bg-purple-500">Purple</SelectItem>
                                <SelectItem value="bg-amber-500">Amber</SelectItem>
                                <SelectItem value="bg-red-500">Red</SelectItem>
                                <SelectItem value="bg-green-500">Green</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 flex items-end">
                            <Button 
                              type="button" 
                              onClick={() => appendEditCategory({ id: '', name: '', defaultPrice: 0, color: 'bg-blue-500' })} 
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                            >
                              <PlusCircle className="h-4 w-4" /> Add
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {editSeatCategories.map((cat, index) => (
                            <div key={cat.id} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded">
                              <div className="flex items-center gap-2 flex-1">
                                <Controller
                                  name={`seatCategories.${index}.name`}
                                  control={editControl}
                                  render={({ field }) => (
                                    <Input 
                                      {...field} 
                                      placeholder="Name"
                                      className="w-24 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setEditValue(`seatCategories.${index}.id`, e.target.value.toLowerCase().replace(/\s+/g, '-'));
                                      }}
                                    />
                                  )}
                                />
                                <Controller
                                  name={`seatCategories.${index}.defaultPrice`}
                                  control={editControl}
                                  render={({ field }) => (
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      placeholder="Price"
                                      min="0"
                                      className="w-20 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                  )}
                                />
                                <Controller
                                  name={`seatCategories.${index}.color`}
                                  control={editControl}
                                  render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <SelectTrigger className="w-24 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="bg-blue-500">Blue</SelectItem>
                                        <SelectItem value="bg-purple-500">Purple</SelectItem>
                                        <SelectItem value="bg-amber-500">Amber</SelectItem>
                                        <SelectItem value="bg-red-500">Red</SelectItem>
                                        <SelectItem value="bg-green-500">Green</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeEditCategory(index)} 
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Special Seats */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-slate-900 dark:text-white">Special Seat Assignments</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-200">Row</Label>
                            <Input 
                              type="number" 
                              placeholder="1"
                              onChange={(e) => {
                                const row = parseInt(e.target.value) || 1;
                                if (editCategories.length > 0) {
                                  appendEditSpecialSeat({
                                    row,
                                    seat: 1,
                                    category: editCategories[0].id
                                  });
                                  e.target.value = '';
                                }
                              }}
                              min="1"
                              max={editRows || 1}
                              disabled={editCategories.length === 0}
                              className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-200">Seat</Label>
                            <Input 
                              type="number" 
                              placeholder="1"
                              onChange={(e) => {
                                const seat = parseInt(e.target.value) || 1;
                                if (editCategories.length > 0) {
                                  appendEditSpecialSeat({
                                    row: 1,
                                    seat,
                                    category: editCategories[0].id
                                  });
                                  e.target.value = '';
                                }
                              }}
                              min="1"
                              max={editSeatsPerRow || 1}
                              disabled={editCategories.length === 0}
                              className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-200">Category</Label>
                            <Select 
                              onValueChange={(value) => {
                                appendEditSpecialSeat({
                                  row: 1,
                                  seat: 1,
                                  category: value
                                });
                              }}
                              defaultValue={editCategories[0]?.id}
                              disabled={editCategories.length === 0}
                            >
                              <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {editCategories.map(cat => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          onClick={() => {
                            if (editCategories.length > 0) {
                              appendEditSpecialSeat({ 
                                row: 1, 
                                seat: 1, 
                                category: editCategories[0].id 
                              });
                            }
                          }} 
                          disabled={editCategories.length === 0}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                        >
                          <PlusCircle className="h-4 w-4" /> Add Special Seat
                        </Button>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {editSpecialSeats.map((seat, index) => (
                            <div key={seat.id} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded">
                              <div className="flex items-center gap-2">
                                <Controller
                                  name={`specialSeats.${index}.row`}
                                  control={editControl}
                                  render={({ field }) => (
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      min="1"
                                      max={editRows || 1}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                      className="w-16 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                  )}
                                />
                                <Controller
                                  name={`specialSeats.${index}.seat`}
                                  control={editControl}
                                  render={({ field }) => (
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      min="1"
                                      max={editSeatsPerRow || 1}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                      className="w-16 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                  )}
                                />
                                <Controller
                                  name={`specialSeats.${index}.category`}
                                  control={editControl}
                                  render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <SelectTrigger className="w-24 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {editCategories.map(cat => (
                                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeEditSpecialSeat(index)} 
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsEditHallOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                          Update Hall
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {halls.length === 0 && (
                  <div className="text-center py-12 border rounded-lg border-dashed border-slate-300 dark:border-slate-600 mt-4 bg-white dark:bg-[hsl(0,0%,3.9%)]">
                    <p className="text-slate-500 dark:text-slate-400 mb-2">No halls configured yet</p>
                    <Button 
                      onClick={() => setIsAddHallOpen(true)} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Your First Hall
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media">
              <Card className="bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <ImageIcon className="h-5 w-5" />
                    Theater Media
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Upload images of your theater for display on the website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-slate-700 dark:text-slate-200">Theater Cover Image</Label>
                    <div className="mt-2 flex items-center justify-center border-2 border-dashed rounded-lg p-6 h-40 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="mt-4 flex text-sm justify-center">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <span>Upload theater image</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                          </label>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3 text-slate-900 dark:text-white">Image Gallery</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div 
                          key={i} 
                          className="border rounded-lg p-2 aspect-video bg-white dark:bg-slate-700 flex items-center justify-center border-slate-300 dark:border-slate-600"
                        >
                          <div className="text-center">
                            <ImageIcon className="mx-auto h-8 w-8 text-slate-400" />
                            <span className="text-sm text-slate-500 dark:text-slate-400 mt-1 block">Gallery Image {i}</span>
                          </div>
                        </div>
                      ))}
                      <div className="border border-dashed rounded-lg flex items-center justify-center aspect-video border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                        <label htmlFor="gallery-upload" className="cursor-pointer text-center">
                          <PlusCircle className="mx-auto h-8 w-8 text-slate-400" />
                          <span className="text-sm text-slate-500 dark:text-slate-400 mt-1 block">Add Image</span>
                          <input id="gallery-upload" type="file" className="sr-only" />
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={saveSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5">
                    <Save className="h-4 w-4" />
                    Save Media Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TheaterAdminSettings;