import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from "../../components/ui/theme-provider";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tab";
import { Switch } from "../../components/ui/switch";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/Label";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { API_GET_ALL_THEATER_SCREENS_URL, API_UPDATE_THEATER_SCREEN_URL } from '../../utils/api';
import { 
  Save as SaveIcon, 
  RotateCcw as UndoIcon, 
  Info as InfoIcon, 
  Moon as MoonIcon, 
  Sun as SunIcon
} from "lucide-react";
import { useSelector } from 'react-redux';

// Interfaces for type definitions
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

interface HallLayout {
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

interface Prices {
  [key: string]: number;
}

const SeatPricingPanel: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [halls, setHalls] = useState<HallLayout[]>([]);
  const [selectedHallId, setSelectedHallId] = useState<string>('');
  const [hallData, setHallData] = useState<HallLayout | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('regular');
  const [prices, setPrices] = useState<Prices>({});
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [showSavedMessage, setShowSavedMessage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false); // New state for saving
  const [error, setError] = useState<string | null>(null);

  const theaterId = useSelector((state: any) => state.user.auth.userInfo.id);

  // Fetch hall data from the API
  useEffect(() => {
    const fetchHalls = async () => {
      if (!theaterId) {
        setError('No theater ID available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_GET_ALL_THEATER_SCREENS_URL}/${theaterId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          withCredentials: true,
        });
        const hallsData = response.data.data;
        console.log('Fetched halls:', hallsData);
        const formattedHalls = hallsData.map((hall: any) => ({
          ...hall,
          id: hall.id.toString(),
        }));
        setHalls(formattedHalls);
        if (formattedHalls.length > 0) {
          setSelectedHallId(formattedHalls[0].id);
          setHallData(formattedHalls[0]);
          const initialPrices: Prices = {};
          formattedHalls[0].seatCategories.forEach((category: SeatCategory) => {
            initialPrices[category.id] = category.defaultPrice;
          });
          setPrices(initialPrices);
        }
      } catch (err) {
        console.error('Error fetching halls:', err);
        setError('Failed to load theater halls');
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, [theaterId]);

  // Handle tab change
  const handleTabChange = (hallId: string) => {
    console.log('Tab clicked, switching to hall ID:', hallId);
    const selectedHall = halls.find(hall => hall.id === hallId);
    if (selectedHall) {
      console.log('Selected hall data:', selectedHall);
      setSelectedHallId(hallId);
      setHallData(selectedHall);
      setSelectedSeats([]);
      const newPrices: Prices = {};
      selectedHall.seatCategories.forEach(category => {
        newPrices[category.id] = category.defaultPrice;
      });
      setPrices(newPrices);
    } else {
      console.error('Hall not found for ID:', hallId);
    }
  };

  const getSeatCategory = (row: number, seat: number): string => {
    const specialSeat = hallData?.specialSeats.find(
      s => s.row === row && s.seat === seat
    );
    return specialSeat ? specialSeat.category : 'regular';
  };

  const handleSeatClick = (row: number, seat: number): void => {
    if (!hallData) return;
    const seatId = `${row}-${seat}`;
    const seatCategory = getSeatCategory(row, seat);

    if (isMultiSelectMode) {
      if (selectedSeats.some(s => s.id === seatId)) {
        setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
      } else {
        setSelectedSeats([...selectedSeats, { id: seatId, row, seat, category: seatCategory }]);
      }
    } else {
      setSelectedSeats([{ id: seatId, row, seat, category: seatCategory }]);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!hallData || !selectedHallId) return;

    setSaving(true);
    setError(null);

    // Prepare updated seat categories with new prices
    const updatedSeatCategories = hallData.seatCategories.map(category => ({
      ...category,
      defaultPrice: prices[category.id] ?? category.defaultPrice,
    }));

    const screenData = {
      action: 'updateScreen', // Assuming this is required by your API as seen in TheaterAdminSettings
      name: hallData.name,
      rows: hallData.rows,
      seatsPerRow: hallData.seatsPerRow,
      seatCategories: updatedSeatCategories,
      specialSeats: hallData.specialSeats,
    };

    try {
      console.log('Saving screen data:', screenData);
      const response = await axios.patch(
        `${API_UPDATE_THEATER_SCREEN_URL}/${selectedHallId}`,
        screenData,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      const updatedHall = response.data.data;
      console.log('Updated hall from server:', updatedHall);

      // Update local state with the server response
      setHalls(prevHalls =>
        prevHalls.map(hall =>
          hall.id === selectedHallId
            ? {
                ...hall,
                seatCategories: updatedHall.seatCategories,
                specialSeats: updatedHall.specialSeats,
              }
            : hall
        )
      );
      setHallData({
        ...hallData,
        seatCategories: updatedHall.seatCategories,
        specialSeats: updatedHall.specialSeats,
      });

      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);
    } catch (err) {
      console.error('Error saving hall configuration:', err);
      setError('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (): void => {
    setSelectedSeats([]);
  };

  const handlePriceChange = (categoryId: string, newPrice: number): void => {
    setPrices({
      ...prices,
      [categoryId]: newPrice,
    });
  };

  const assignCategoryToSeats = (): void => {
    if (!hallData || selectedSeats.length === 0) return;

    const updatedSpecialSeats: SpecialSeat[] = [...hallData.specialSeats];

    selectedSeats.forEach(seat => {
      const existingIndex = updatedSpecialSeats.findIndex(
        s => s.row === seat.row && s.seat === seat.seat
      );

      if (existingIndex !== -1) {
        updatedSpecialSeats[existingIndex].category = selectedCategory;
      } else {
        updatedSpecialSeats.push({
          row: seat.row,
          seat: seat.seat,
          category: selectedCategory,
        });
      }
    });

    setHallData({
      ...hallData,
      specialSeats: updatedSpecialSeats,
    });

    setSelectedSeats([]);
  };

  if (loading) {
    return <div className="text-center py-12">Loading theater halls...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!hallData) {
    return (
      <div className="text-center py-12">No halls available for this theater.</div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Theater Seat Pricing Configuration</h1>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Hall Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Theater Hall</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedHallId} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-3 w-full">
                {halls.map(hall => (
                  <TabsTrigger key={hall.id} value={hall.id}>
                    {hall.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: Pricing Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {hallData.seatCategories.map((category: SeatCategory) => (
                  <div key={category.id} className="flex items-center">
                    <div 
                      className={`w-6 h-6 rounded mr-2 ${category.color}`}
                    ></div>
                    <Label className="w-24">{category.name}:</Label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3">$</span>
                      <Input
                        type="number"
                        min={0}
                        value={prices[category.id] ?? category.defaultPrice}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handlePriceChange(category.id, parseFloat(e.target.value) || 0)
                        }
                        className="pl-7 w-24"
                        disabled={saving}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Assign Category to Selected Seats</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {hallData.seatCategories.map((category: SeatCategory) => (
                    <Button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`${category.color} text-white ${
                        selectedCategory === category.id
                          ? 'ring-2 ring-offset-2'
                          : ''
                      }`}
                      variant="outline"
                      size="sm"
                      disabled={saving}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={assignCategoryToSeats}
                  disabled={selectedSeats.length === 0 || saving}
                  variant="default"
                >
                  Apply to Selected Seats ({selectedSeats.length})
                </Button>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Selection Mode</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="multi-select"
                    checked={isMultiSelectMode}
                    onCheckedChange={setIsMultiSelectMode}
                    disabled={saving}
                  />
                  <Label htmlFor="multi-select">
                    {isMultiSelectMode ? 'Multi-Select Mode' : 'Single Select Mode'}
                  </Label>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleSave}
                  className="flex items-center gap-2"
                  variant="default"
                  disabled={saving}
                >
                  <SaveIcon className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button
                  onClick={handleReset}
                  className="flex items-center gap-2"
                  variant="outline"
                  disabled={saving}
                >
                  <UndoIcon className="h-4 w-4" /> Reset Selection
                </Button>
              </div>
              
              {showSavedMessage && (
                <Alert className="mt-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  <AlertDescription>
                    Configuration saved successfully!
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Right Side: Seat Layout */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{hallData.name} Seat Layout</CardTitle>
                <div className="flex items-center">
                  <span className="text-sm mr-2">
                    {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-1"
                    title="Click or drag to select seats. Apply a category to change seat types."
                  >
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-8 text-center">
                <div className="h-6 mx-auto w-4/5 rounded-t-3xl bg-gray-300 dark:bg-gray-600"></div>
                <p className="mt-1 text-sm text-center text-gray-500">SCREEN</p>
              </div>
              
              <div className="overflow-x-auto pb-4">
                <div className="inline-block min-w-full">
                  <div className="text-center mb-6">
                    {Array.from({ length: hallData.rows }).map((_, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center my-1 gap-1">
                        <div className="w-6 flex items-center justify-center text-sm">
                          {String.fromCharCode(65 + rowIndex)}
                        </div>
                        
                        {Array.from({ length: hallData.seatsPerRow }).map((_, seatIndex) => {
                          const row: number = rowIndex + 1;
                          const seat: number = seatIndex + 1;
                          const categoryId: string = getSeatCategory(row, seat);
                          const isSelected: boolean = selectedSeats.some(s => s.row === row && s.seat === seat);
                          const categoryData: SeatCategory | undefined = hallData.seatCategories.find(c => c.id === categoryId);
                          
                          return (
                            <button
                              key={seatIndex}
                              onClick={() => handleSeatClick(row, seat)}
                              className={`
                                w-6 h-6 rounded-t-lg text-xs font-medium
                                transition-all duration-200 transform
                                ${isSelected ? 'ring-2 ring-white scale-110 z-10' : 'hover:scale-105'}
                                ${categoryData?.color || 'bg-gray-500'}
                                text-white
                              `}
                              title={`${String.fromCharCode(65 + rowIndex)}${seat} - ${categoryData?.name || 'Regular'} ($${prices[categoryId] || categoryData?.defaultPrice || 0})`}
                              disabled={saving}
                            >
                              {seat}
                            </button>
                          );
                        })}
                        
                        <div className="w-6 flex items-center justify-center text-sm">
                          {String.fromCharCode(65 + rowIndex)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    {hallData.seatCategories.map((category: SeatCategory) => (
                      <div key={category.id} className="flex items-center">
                        <div className={`w-4 h-4 rounded ${category.color} mr-1`}></div>
                        <span className="text-sm">{category.name} (${prices[category.id] || category.defaultPrice})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {selectedSeats.length > 0 && (
                <div className="mt-4 p-3 rounded bg-gray-100 dark:bg-gray-800">
                  <h3 className="font-medium mb-2">Selected Seats</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seat: SelectedSeat) => {
                      const category: SeatCategory | undefined = hallData.seatCategories.find(c => c.id === seat.category);
                      return (
                        <Badge 
                          key={seat.id} 
                          className={`${category?.color || 'bg-gray-500'} text-white`}
                        >
                          {String.fromCharCode(64 + seat.row)}{seat.seat}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeatPricingPanel;