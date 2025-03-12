import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
} from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tab';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/Label';
import { Badge } from '../../components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { FiHome as Building, FiImage as ImageIcon,
  FiPlusCircle as PlusCircle, FiSave as Save, FiTrash2 as Trash2,
  FiCoffee as Coffee, FiWifi as Wifi, FiUserCheck as Accessibility,
  FiFilm as Film, FiStar as Popcorn, FiBox as Sofa, FiVolume2 as DolbyAtmos,
  FiMaximize as IMAX, FiWind as FourDX, FiZap as Laser
} from 'react-icons/fi';
import { PiThreeD as ThreeD } from "react-icons/pi";
import { useTheme } from 'next-themes';
import { useForm, Controller, useFieldArray, UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { API_ADD_THEATER_URL, API_CREATE_THEATER_SCREEN_URL, API_GET_THEATER_BY_ID_URL, API_UPDATE_THEATER_SCREEN_URL, API_UPDATE_THEATER_URL, API_GET_ALL_THEATER_SCREENS_URL, API_DELETE_THEATER_SCREEN_URL } from '../../utils/api';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

// Validation Schemas
const theaterDetailsSchema = yup.object({
  name: yup.string().required('Theater name is required'),
  location: yup.string().required('Location is required'),
  description: yup.string().required('Description is required'),
});

const seatCategorySchema = yup.object({
  id: yup.string().required('Category ID is required'),
  name: yup.string().required('Category name is required'),
  defaultPrice: yup.number().min(0, 'Price must be positive').required('Price is required'),
  color: yup.string().required('Color is required'),
});

const specialSeatSchema = yup.object({
  row: yup.number().min(1, 'Row must be at least 1').required('Row is required'),
  seat: yup.number().min(1, 'Seat must be at least 1').required('Seat is required'),
  category: yup.string().required('Category is required'),
});

const hallSchema = yup.object().shape({
  id: yup.string().optional(),
  name: yup.string().required('Hall name is required'),
  rows: yup.number().min(1, 'Must have at least 1 row').required('Rows are required'),
  seatsPerRow: yup.number().min(1, 'Must have at least 1 seat per row').required('Seats per row are required'),
  totalCapacity: yup.number().min(1, 'Total capacity must be positive').required('Total capacity is required'),
  seatCategories: yup.array().of(seatCategorySchema).min(1, 'At least one seat category is required').required('Seat categories are required'),
  specialSeats: yup.array().of(specialSeatSchema).required('Special seats are required'),
});

// Type definitions
interface TheaterDetails {
  name: string;
  location: string;
  description: string;
  image?: File | null;
  imagePreview?: string;
  imageUrl?: string;
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
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  totalCapacity: number;
  seatCategories: SeatCategory[];
  specialSeats: SpecialSeat[];
}

interface SelectedSeat {
  id: string;
  row: number;
  seat: number;
  category: string;
}

interface RootState {
  user: {
    auth: {
      userInfo: {
        id: string;
      };
    };
  };
}

const TheaterAdminSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(theme === 'dark');
  const [theaterDetails, setTheaterDetails] = useState<TheaterDetails>({
    name: '',
    location: '',
    description: '',
    image: null,
    imagePreview: '',
    imageUrl: '',
  });
  const [amenities, setAmenities] = useState<Amenities>({
    cafe: false,
    wifi: false,
    accessibility: false,
    premium: false,
    snackBar: false,
    recliners: false,
    dolbyAtmos: false,
    imax: false,
    threeD: false,
    fourDX: false,
    laserProjection: false,
  });
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isAddHallOpen, setIsAddHallOpen] = useState<boolean>(false);
  const [isEditHallOpen, setIsEditHallOpen] = useState<boolean>(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [previewLayout, setPreviewLayout] = useState<boolean>(false);
  const [selectedAddSeats, setSelectedAddSeats] = useState<SelectedSeat[]>([]);
  const [selectedEditSeats, setSelectedEditSeats] = useState<SelectedSeat[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewTheater, setIsNewTheater] = useState<boolean>(false);
  const [changeImage, setChangeImage] = useState<boolean>(false);
  const [theaterId, setTheaterId] = useState<string | null>(null);

  const userId = useSelector((state: RootState) => state.user.auth.userInfo.id);

  const theaterForm = useForm<TheaterDetails>({
    resolver: yupResolver(theaterDetailsSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
    },
  });

  const { control: theaterControl, handleSubmit: handleTheaterSubmit, reset: resetTheaterForm } = theaterForm;

  const addHallForm = useForm<Hall>({
    resolver: yupResolver(hallSchema),
    defaultValues: {
      id: '',
      name: '',
      rows: 1,
      seatsPerRow: 1,
      totalCapacity: 1,
      seatCategories: [
        { id: 'regular', name: 'Regular', defaultPrice: 15, color: 'bg-blue-500' },
      ],
      specialSeats: [],
    },
  });

  const editHallForm = useForm<Hall>({
    resolver: yupResolver(hallSchema),
    defaultValues: {
      id: '',
      name: '',
      rows: 1,
      seatsPerRow: 1,
      totalCapacity: 1,
      seatCategories: [
        { id: 'regular', name: 'Regular', defaultPrice: 15, color: 'bg-blue-500' },
      ],
      specialSeats: [],
    },
  });

  const { control: addControl, handleSubmit: handleAddSubmit, watch: addWatch, setValue: setAddValue, reset: resetAddForm } = addHallForm;
  const { control: editControl, handleSubmit: handleEditSubmit, reset: resetEditForm, watch: editWatch, setValue: setEditValue } = editHallForm;

  const { fields: addSeatCategories, append: appendAddCategory, remove: removeAddCategory } = useFieldArray({ control: addControl, name: 'seatCategories' });
  const { fields: addSpecialSeats, append: appendAddSpecialSeat, remove: removeAddSpecialSeat } = useFieldArray({ control: addControl, name: 'specialSeats' });
  const { fields: editSeatCategories, append: appendEditCategory, remove: removeEditCategory } = useFieldArray({ control: editControl, name: 'seatCategories' });
  const { fields: editSpecialSeats, append: appendEditSpecialSeat, remove: removeEditSpecialSeat } = useFieldArray({ control: editControl, name: 'specialSeats' });

  const addRows = addWatch('rows') ?? 1;
  const addSeatsPerRow = addWatch('seatsPerRow') ?? 1;
  const addCategories = addWatch('seatCategories');
  const addSpecial = addWatch('specialSeats');
  const editRows = editWatch('rows') ?? 1;
  const editSeatsPerRow = editWatch('seatsPerRow') ?? 1;
  const editCategories = editWatch('seatCategories');
  const editSpecial = editWatch('specialSeats');

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const theaterResponse = await axios.get(`${API_GET_THEATER_BY_ID_URL}/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          withCredentials: true,
        });

        const theaterData = theaterResponse.data.data;
        setTheaterId(theaterData?._id);
        setTheaterDetails({
          name: theaterData?.name || '',
          location: theaterData?.location || '',
          description: theaterData?.description || '',
          image: null,
          imagePreview: theaterData?.image?.url || '',
          imageUrl: theaterData?.image?.url || '',
        });
        resetTheaterForm({
          name: theaterData.name || '',
          location: theaterData.location || '',
          description: theaterData.description || '',
        });
        setAmenities((prev) => ({
          ...prev,
          ...theaterData.amenities,
        }));

        if (theaterData?._id) {
          const screensResponse = await axios.get(`${API_GET_ALL_THEATER_SCREENS_URL}/${theaterData._id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            withCredentials: true,
          });
          const screensData = screensResponse.data.data;
          setHalls(screensData.map((screen: any) => ({
            id: screen._id || screen.id,
            name: screen.name,
            rows: screen.rows,
            seatsPerRow: screen.seatsPerRow,
            totalCapacity: screen.totalCapacity,
            seatCategories: screen.seatCategories,
            specialSeats: screen.specialSeats,
          })));
        } else {
          setHalls([]);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setIsNewTheater(true);
          setHalls([]);
        } else {
          console.error('Error fetching data:', err);
          setError('Failed to load theater settings');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, resetTheaterForm]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setTheaterDetails((prev) => ({
        ...prev,
        image: file,
        imagePreview: previewUrl,
      }));
      setChangeImage(true);
    }
  };

  const toggleAmenity = (name: keyof Amenities) => {
    setAmenities((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const saveSettings = async (formData: TheaterDetails) => {
    try {
      setLoading(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('location', formData.location);
      data.append('description', formData.description);
      Object.entries(amenities).forEach(([key, value]) => {
        data.append(`amenities[${key}]`, String(value));
      });
      data.append('owner', userId);

      if (isNewTheater) {
        if (theaterDetails.image) {
          data.append('image', theaterDetails.image);
        }
        const response = await axios.post(API_ADD_THEATER_URL, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          withCredentials: true,
        });
        setTheaterId(response.data.data._id);
        setIsNewTheater(false);
        setTheaterDetails((prev) => ({
          ...prev,
          imageUrl: response.data.data.image?.url || '',
          imagePreview: response.data.data.image?.url || '',
        }));
        toast.success('Theater created successfully!');
      } else if (theaterId) {
        if (changeImage && theaterDetails.image) {
          data.append('image', theaterDetails.image);
        }
        const response = await axios.patch(`${API_UPDATE_THEATER_URL}/${theaterId}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          withCredentials: true,
        });
        if (changeImage && response.data.theater?.image?.url) {
          setTheaterDetails((prev) => ({
            ...prev,
            imageUrl: response.data.theater.image.url,
            imagePreview: response.data.theater.image.url,
          }));
        }
        toast.success('Theater settings updated successfully!');
      }

      if (theaterDetails.imagePreview && theaterDetails.image) {
        URL.revokeObjectURL(theaterDetails.imagePreview);
      }
      setChangeImage(false);
      setTheaterDetails((prev) => ({ ...prev, image: null }));
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save theater settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (
    row: number,
    seat: number,
    isAddMode: boolean,
    currentSpecialSeats: SpecialSeat[],
    setSelected: React.Dispatch<React.SetStateAction<SelectedSeat[]>>,
    rows: number,
    seatsPerRow: number
  ) => {
    if (row > rows || seat > seatsPerRow) return;

    const seatId = `${row}-${seat}`;
    const specialSeat = currentSpecialSeats.find((s) => s.row === row && s.seat === seat);
    const category = specialSeat ? specialSeat.category : 'regular';

    setSelected((prev) => {
      const isSelected = prev.some((s) => s.id === seatId);
      if (isMultiSelectMode) {
        if (isSelected) {
          return prev.filter((s) => s.id !== seatId);
        }
        return [...prev, { id: seatId, row, seat, category }];
      } else {
        return [{ id: seatId, row, seat, category }];
      }
    });
  };

  const assignCategoryToSeats = (
    selectedSeats: SelectedSeat[],
    categoryId: string,
    currentSpecialSeats: SpecialSeat[],
    appendSpecialSeat: (seat: SpecialSeat) => void,
    removeSpecialSeat: (index: number) => void,
    setSelected: React.Dispatch<React.SetStateAction<SelectedSeat[]>>,
    form: UseFormReturn<Hall>
  ) => {
    selectedSeats.forEach((seat) => {
      const existingIndex = currentSpecialSeats.findIndex(
        (s) => s.row === seat.row && s.seat === seat.seat
      );
      if (existingIndex >= 0) {
        form.setValue(`specialSeats.${existingIndex}.category`, categoryId);
      } else {
        appendSpecialSeat({
          row: seat.row,
          seat: seat.seat,
          category: categoryId,
        });
      }
    });
    setSelected([]);
  };

  const generateSeatLayout = (
    rows: number,
    seatsPerRow: number,
    specialSeats: SpecialSeat[],
    seatCategories: SeatCategory[],
    selectedSeats: SelectedSeat[],
    isAddMode: boolean,
    setSelected: React.Dispatch<React.SetStateAction<SelectedSeat[]>>
  ) => {
    const effectiveRows = rows || 1;
    const effectiveSeatsPerRow = seatsPerRow || 1;

    return Array.from({ length: effectiveRows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex justify-center my-1 gap-1">
        <div className="w-6 flex items-center justify-center text-sm">
          {String.fromCharCode(65 + rowIndex)}
        </div>
        {Array.from({ length: effectiveSeatsPerRow }).map((_, seatIndex) => {
          const row = rowIndex + 1;
          const seat = seatIndex + 1;
          const specialSeat = specialSeats.find((s) => s.row === row && s.seat === seat);
          const category = specialSeat
            ? seatCategories.find((c) => c.id === specialSeat.category)
            : seatCategories.find((c) => c.id === 'regular');
          const isSelected = selectedSeats.some((s) => s.row === row && s.seat === seat);

          return (
            <button
              key={seatIndex}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSeatClick(row, seat, isAddMode, specialSeats, setSelected, effectiveRows, effectiveSeatsPerRow);
              }}
              className={`
                w-6 h-6 rounded-t-lg text-xs font-medium flex items-center justify-center
                transition-all duration-200 transform
                ${isSelected ? 'ring-2 ring-white scale-110 z-10' : 'hover:scale-105'}
                ${category?.color || 'bg-gray-500'} text-white
              `}
              title={`${String.fromCharCode(65 + rowIndex)}${seat} - ${category?.name || 'Regular'} ($${category?.defaultPrice || 0})`}
            >
              {seat}
            </button>
          );
        })}
        <div className="w-6 flex items-center justify-center text-sm">
          {String.fromCharCode(65 + rowIndex)}
        </div>
      </div>
    ));
  };

  const onAddHallSubmit = async (data: Hall) => {
    if (!theaterId) {
      toast.error('Please save theater details first');
      return;
    }

    try {
      setLoading(true);
      const screenData = {
        theaterId,
        name: data.name,
        rows: data.rows,
        seatsPerRow: data.seatsPerRow,
        seatCategories: data.seatCategories,
        specialSeats: data.specialSeats,
      };

      const response = await axios.post(API_CREATE_THEATER_SCREEN_URL, screenData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
      });

      const newScreen = response.data.data;
      setHalls((prev) => [
        ...prev,
        {
          id: newScreen.id,
          name: newScreen.name,
          rows: newScreen.rows,
          seatsPerRow: newScreen.seatsPerRow,
          totalCapacity: newScreen.totalCapacity,
          seatCategories: newScreen.seatCategories,
          specialSeats: newScreen.specialSeats,
        },
      ]);

      resetAddForm({
        id: '',
        name: '',
        rows: 1,
        seatsPerRow: 1,
        totalCapacity: 1,
        seatCategories: [{ id: 'regular', name: 'Regular', defaultPrice: 15, color: 'bg-blue-500' }],
        specialSeats: [],
      });
      setIsAddHallOpen(false);
      setPreviewLayout(false);
      setSelectedAddSeats([]);
      toast.success('Hall added successfully!');
    } catch (err) {
      console.error('Error adding hall:', err);
      toast.error('Failed to add hall');
    } finally {
      setLoading(false);
    }
  };

  const handleEditHall = (hall: Hall) => {
    setEditingHall(hall);
    resetEditForm({
      ...hall,
      totalCapacity: hall.rows * hall.seatsPerRow,
    });
    setIsEditHallOpen(true);
    setSelectedEditSeats([]);
  };

  const onEditHallSubmit = async (data: Hall) => {
    if (!editingHall || !theaterId) return;

    try {
      setLoading(true);
      const screenData = {
        action: 'updateScreen',
        name: data.name,
        rows: data.rows,
        seatsPerRow: data.seatsPerRow,
        seatCategories: data.seatCategories,
        specialSeats: data.specialSeats,
      };

      console.log('Sending screenData:', screenData);

      const response = await axios.patch(`${API_UPDATE_THEATER_SCREEN_URL}/${editingHall.id}`, screenData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
      });

      const updatedScreen = response.data.data;
      setHalls((prev) =>
        prev.map((h) =>
          h.id === editingHall.id
            ? {
                id: updatedScreen.id,
                name: updatedScreen.name,
                rows: updatedScreen.rows,
                seatsPerRow: updatedScreen.seatsPerRow,
                totalCapacity: updatedScreen.totalCapacity,
                seatCategories: updatedScreen.seatCategories,
                specialSeats: updatedScreen.specialSeats,
              }
            : h
        )
      );

      setEditingHall(null);
      setIsEditHallOpen(false);
      setPreviewLayout(false);
      setSelectedEditSeats([]);
      toast.success('Hall updated successfully!');
    } catch (err) {
      console.error('Error updating hall:', err);
      toast.error('Failed to update hall');
    } finally {
      setLoading(false);
    }
  };

  const deleteHall = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`${API_DELETE_THEATER_SCREEN_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
      });

      setHalls((prev) => prev.filter((hall) => hall.id !== id));
      toast.success('Hall deleted successfully!');
    } catch (err) {
      console.error('Error deleting hall:', err);
      toast.error('Failed to delete hall');
    } finally {
      setLoading(false);
    }
  };

  // if (loading) {
  //   return <div className="text-center py-12">Loading theater settings...</div>;
  // }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 transition-colors duration-200">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-6">
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="h-6 w-6" />
              Theater Admin Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Configure your theater settings and halls</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-white dark:bg-[hsl(0,0%,3.9%)] border rounded-lg">
              <TabsTrigger value="details">Theater Details</TabsTrigger>
              <TabsTrigger value="halls">Halls Configuration</TabsTrigger>
            </TabsList>

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
                <form onSubmit={handleTheaterSubmit(saveSettings)}>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Theater Name</Label>
                          <Controller
                            name="name"
                            control={theaterControl}
                            render={({ field, fieldState }) => (
                              <>
                                <Input
                                  id="name"
                                  {...field}
                                  className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                                />
                                {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                              </>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-slate-700 dark:text-slate-200">Location</Label>
                          <Controller
                            name="location"
                            control={theaterControl}
                            render={({ field, fieldState }) => (
                              <>
                                <Input
                                  id="location"
                                  {...field}
                                  className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                                />
                                {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                              </>
                            )}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-700 dark:text-slate-200">Description</Label>
                        <Controller
                          name="description"
                          control={theaterControl}
                          render={({ field, fieldState }) => (
                            <>
                              <Textarea
                                id="description"
                                {...field}
                                rows={3}
                                className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                              />
                              {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                            </>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image" className="text-slate-700 dark:text-slate-200">Theater Image</Label>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                            />
                            <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          </div>
                          {(theaterDetails.imagePreview || theaterDetails.imageUrl) && (
                            <div className="relative w-20 h-20">
                              <img
                                src={theaterDetails.imagePreview || theaterDetails.imageUrl}
                                alt="Theater preview"
                                className="w-full h-full object-cover rounded-md"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={() => {
                                  if (theaterDetails.imagePreview && theaterDetails.image) {
                                    URL.revokeObjectURL(theaterDetails.imagePreview);
                                  }
                                  setTheaterDetails((prev) => ({
                                    ...prev,
                                    image: null,
                                    imagePreview: '',
                                    imageUrl: prev.imageUrl,
                                  }));
                                  setChangeImage(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Upload an image of your theater (max 5MB, JPG/PNG)
                        </p>
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
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Theater Details'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="halls">
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Theater Halls</h2>
                  <Dialog open={isAddHallOpen} onOpenChange={setIsAddHallOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5" disabled={loading || !theaterId}>
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
                                        value={field.value ?? 1}
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value) || 1;
                                          field.onChange(value);
                                          setAddValue('totalCapacity', value * addSeatsPerRow);
                                          setSelectedAddSeats([]);
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
                                        value={field.value ?? 1}
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value) || 1;
                                          field.onChange(value);
                                          setAddValue('totalCapacity', addRows * value);
                                          setSelectedAddSeats([]);
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
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-slate-900 dark:text-white">Seat Categories & Pricing</h4>
                          <div className="space-y-2">
                            {addSeatCategories.map((cat, index) => (
                              <div key={cat.id} className="grid grid-cols-4 gap-2 items-center p-2 bg-slate-100 dark:bg-slate-700 rounded">
                                <Controller
                                  name={`seatCategories.${index}.name`}
                                  control={addControl}
                                  rules={{ required: 'Category name is required' }}
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          setAddValue(`seatCategories.${index}.id`, value.toLowerCase());
                                        }}
                                      >
                                        <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                          <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Regular">Regular</SelectItem>
                                          <SelectItem value="Premium">Premium</SelectItem>
                                          <SelectItem value="VIP">VIP</SelectItem>
                                          <SelectItem value="Special">Special</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                                    </>
                                  )}
                                />
                                <Controller
                                  name={`seatCategories.${index}.defaultPrice`}
                                  control={addControl}
                                  rules={{ required: 'Price is required', min: { value: 0, message: 'Price must be positive' } }}
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Input
                                        type="number"
                                        {...field}
                                        placeholder="Price"
                                        min="0"
                                        className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                      />
                                      {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                                    </>
                                  )}
                                />
                                <Controller
                                  name={`seatCategories.${index}.color`}
                                  control={addControl}
                                  rules={{ required: 'Color is required' }}
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="bg-blue-500">Blue</SelectItem>
                                          <SelectItem value="bg-purple-500">Purple</SelectItem>
                                          <SelectItem value="bg-amber-500">Amber</SelectItem>
                                          <SelectItem value="bg-red-500">Red</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                                    </>
                                  )}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAddCategory(index)}
                                  className="text-red-500 hover:text-red-700 justify-self-center"
                                  disabled={addSeatCategories.length <= 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            type="button"
                            onClick={() =>
                              appendAddCategory({
                                id: 'regular',
                                name: 'Regular',
                                defaultPrice: 15,
                                color: 'bg-blue-500',
                              })
                            }
                            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                          >
                            <PlusCircle className="h-4 w-4" /> Add Category
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-slate-900 dark:text-white">Seat Assignment</h4>
                          <div className="flex items-center space-x-2 mb-4">
                            <Switch
                              id="multi-select"
                              checked={isMultiSelectMode}
                              onCheckedChange={setIsMultiSelectMode}
                            />
                            <Label htmlFor="multi-select">
                              {isMultiSelectMode ? 'Multi-Select Mode' : 'Single Select Mode'}
                            </Label>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {addCategories.map((cat) => (
                              <Button
                                key={cat.id}
                                onClick={() => assignCategoryToSeats(
                                  selectedAddSeats,
                                  cat.id,
                                  addSpecial || [],
                                  appendAddSpecialSeat,
                                  removeAddSpecialSeat,
                                  setSelectedAddSeats,
                                  addHallForm
                                )}
                                disabled={selectedAddSeats.length === 0}
                                className={`${cat.color} text-white`}
                                variant="outline"
                              >
                                {cat.name}
                              </Button>
                            ))}
                          </div>
                          {selectedAddSeats.length > 0 && (
                            <div className="p-3 rounded bg-gray-100 dark:bg-gray-800">
                              <h5 className="font-medium mb-2">Selected Seats ({selectedAddSeats.length})</h5>
                              <div className="flex flex-wrap gap-2">
                                {selectedAddSeats.map((seat) => (
                                  <Badge key={seat.id} className={addCategories.find((c) => c.id === seat.category)?.color || 'bg-gray-500'}>
                                    {String.fromCharCode(64 + seat.row)}{seat.seat}
                                  </Badge>
                                ))}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setSelectedAddSeats([])}
                              >
                                Clear Selection
                              </Button>
                            </div>
                          )}
                        </div>

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
                                  addRows,
                                  addSeatsPerRow,
                                  addSpecial || [],
                                  addCategories || [],
                                  selectedAddSeats,
                                  true,
                                  setSelectedAddSeats
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsAddHallOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Hall'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {halls.map((hall) => (
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
                          <div>Rows: {hall.rows}</div>
                          <div>Seats Per Row: {hall.seatsPerRow}</div>
                          <div>Total Capacity: {hall.totalCapacity}</div>
                          <div>Special Seats: {hall.specialSeats.length}</div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button variant="outline" size="sm" onClick={() => deleteHall(hall.id)} className="text-red-500 hover:text-red-700" disabled={loading}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                          onClick={() => handleEditHall(hall)}
                          disabled={loading}
                        >
                          <PlusCircle className="h-4 w-4" />
                          Edit Layout
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                <Dialog open={isEditHallOpen} onOpenChange={setIsEditHallOpen}>
                  <DialogContent className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 dark:text-white">Edit Hall</DialogTitle>
                      <DialogDescription className="text-slate-500 dark:text-slate-400">
                        Update hall layout, categories, and pricing
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit(onEditHallSubmit)} className="grid gap-6 py-4">
                      <div className="grid gap-6">
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
                          <div className="grid gap-4">
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
                                      value={field.value ?? 1}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 1;
                                        field.onChange(value);
                                        setEditValue('totalCapacity', value * editSeatsPerRow);
                                        setSelectedEditSeats([]);
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
                                      value={field.value ?? 1}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 1;
                                        field.onChange(value);
                                        setEditValue('totalCapacity', editRows * value);
                                        setSelectedEditSeats([]);
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

                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-slate-900 dark:text-white">Seat Categories & Pricing</h4>
                          <div className="space-y-2">
                            {editSeatCategories.map((cat, index) => (
                              <div key={cat.id} className="grid grid-cols-4 gap-2 items-center p-2 bg-slate-100 dark:bg-slate-700 rounded">
                                <Controller
                                  name={`seatCategories.${index}.name`}
                                  control={editControl}
                                  rules={{ required: 'Category name is required' }}
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          setEditValue(`seatCategories.${index}.id`, value.toLowerCase());
                                        }}
                                      >
                                        <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                          <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Regular">Regular</SelectItem>
                                          <SelectItem value="Premium">Premium</SelectItem>
                                          <SelectItem value="VIP">VIP</SelectItem>
                                          <SelectItem value="Special">Special</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                                    </>
                                  )}
                                />
                                <Controller
                                  name={`seatCategories.${index}.defaultPrice`}
                                  control={editControl}
                                  rules={{ required: 'Price is required', min: { value: 0, message: 'Price must be positive' } }}
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Input
                                        type="number"
                                        {...field}
                                        placeholder="Price"
                                        min="0"
                                        className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                      />
                                      {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                                    </>
                                  )}
                                />
                                <Controller
                                  name={`seatCategories.${index}.color`}
                                  control={editControl}
                                  rules={{ required: 'Color is required' }}
                                  render={({ field, fieldState }) => (
                                    <>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="bg-blue-500">Blue</SelectItem>
                                          <SelectItem value="bg-purple-500">Purple</SelectItem>
                                          <SelectItem value="bg-amber-500">Amber</SelectItem>
                                          <SelectItem value="bg-red-500">Red</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                                    </>
                                  )}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEditCategory(index)}
                                  className="text-red-500 hover:text-red-700 justify-self-center"
                                  disabled={editSeatCategories.length <= 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            type="button"
                            onClick={() =>
                              appendEditCategory({
                                id: 'regular',
                                name: 'Regular',
                                defaultPrice: 15,
                                color: 'bg-blue-500',
                              })
                            }
                            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                          >
                            <PlusCircle className="h-4 w-4" /> Add Category
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-slate-900 dark:text-white">Seat Assignment</h4>
                          <div className="flex items-center space-x-2 mb-4">
                            <Switch
                              id="multi-select-edit"
                              checked={isMultiSelectMode}
                              onCheckedChange={setIsMultiSelectMode}
                            />
                            <Label htmlFor="multi-select-edit">
                              {isMultiSelectMode ? 'Multi-Select Mode' : 'Single Select Mode'}
                            </Label>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {editCategories.map((cat) => (
                              <Button
                                key={cat.id}
                                onClick={() => assignCategoryToSeats(
                                  selectedEditSeats,
                                  cat.id,
                                  editSpecial || [],
                                  appendEditSpecialSeat,
                                  removeEditSpecialSeat,
                                  setSelectedEditSeats,
                                  editHallForm
                                )}
                                disabled={selectedEditSeats.length === 0}
                                className={`${cat.color} text-white`}
                                variant="outline"
                              >
                                {cat.name}
                              </Button>
                            ))}
                          </div>
                          {selectedEditSeats.length > 0 && (
                            <div className="p-3 rounded bg-gray-100 dark:bg-gray-800">
                              <h5 className="font-medium mb-2">Selected Seats ({selectedEditSeats.length})</h5>
                              <div className="flex flex-wrap gap-2">
                                {selectedEditSeats.map((seat) => (
                                  <Badge key={seat.id} className={editCategories.find((c) => c.id === seat.category)?.color || 'bg-gray-500'}>
                                    {String.fromCharCode(64 + seat.row)}{seat.seat}
                                  </Badge>
                                ))}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setSelectedEditSeats([])}
                              >
                                Clear Selection
                              </Button>
                            </div>
                          )}
                        </div>

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
                                  editRows,
                                  editSeatsPerRow,
                                  editSpecial || [],
                                  editCategories || [],
                                  selectedEditSeats,
                                  false,
                                  setSelectedEditSeats
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsEditHallOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                          {loading ? 'Updating...' : 'Update Hall'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {halls.length === 0 && (
                  <div className="text-center py-12 border rounded-lg border-dashed border-slate-300 dark:border-slate-600 mt-4 bg-white dark:bg-[hsl(0,0%,3.9%)]">
                    <p className="text-slate-500 dark:text-slate-400 mb-2">No halls configured yet</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TheaterAdminSettings;