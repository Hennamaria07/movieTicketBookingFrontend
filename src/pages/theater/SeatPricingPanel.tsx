import React, { useState, useEffect } from 'react';
import { useTheme } from "../../components/ui/theme-provider";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tab";
import { Switch } from "../../components/ui/switch";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/Label";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { 
  Save as SaveIcon, 
  RotateCcw as UndoIcon, 
  Edit as EditIcon, 
  Info as InfoIcon, 
  Moon as MoonIcon, 
  Sun as SunIcon
} from "lucide-react";

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
  name: string;
  rows: number;
  seatsPerRow: number;
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

// Mock API data for different hall layouts
const hallLayouts: { [key: string]: HallLayout } = {
  hall1: {
    name: "Main Theater",
    rows: 10,
    seatsPerRow: 20,
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
  hall2: {
    name: "Studio Theater",
    rows: 6,
    seatsPerRow: 15,
    seatCategories: [
      { id: 'regular', name: 'Regular', defaultPrice: 12, color: 'bg-blue-500' },
      { id: 'premium', name: 'Premium', defaultPrice: 20, color: 'bg-purple-500' },
    ],
    specialSeats: [
      { row: 4, seat: 5, category: 'premium' },
      { row: 4, seat: 6, category: 'premium' },
      { row: 4, seat: 7, category: 'premium' },
      { row: 4, seat: 8, category: 'premium' },
      { row: 4, seat: 9, category: 'premium' },
      { row: 5, seat: 5, category: 'premium' },
      { row: 5, seat: 6, category: 'premium' },
      { row: 5, seat: 7, category: 'premium' },
      { row: 5, seat: 8, category: 'premium' },
      { row: 5, seat: 9, category: 'premium' },
    ]
  },
  hall3: {
    name: "IMAX Theater",
    rows: 12,
    seatsPerRow: 24,
    seatCategories: [
      { id: 'regular', name: 'Regular', defaultPrice: 18, color: 'bg-blue-500' },
      { id: 'premium', name: 'Premium', defaultPrice: 30, color: 'bg-purple-500' },
      { id: 'vip', name: 'VIP', defaultPrice: 45, color: 'bg-amber-500' },
      { id: 'ultra', name: 'Ultra VIP', defaultPrice: 60, color: 'bg-red-500' }
    ],
    specialSeats: [
      // Middle premium section
      ...[5, 6, 7, 8].flatMap(row => 
        [9, 10, 11, 12, 13, 14, 15].map(seat => ({ row, seat, category: 'premium' }))
      ),
      // Back VIP section
      ...[9, 10].flatMap(row => 
        [8, 9, 10, 11, 12, 13, 14, 15, 16].map(seat => ({ row, seat, category: 'vip' }))
      ),
      // Ultra VIP section
      ...[11].flatMap(row => 
        [10, 11, 12, 13, 14].map(seat => ({ row, seat, category: 'ultra' }))
      )
    ]
  }
};

const SeatPricingPanel: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [selectedHall, setSelectedHall] = useState<string>('hall1');
  const [hallData, setHallData] = useState<HallLayout>(hallLayouts.hall1);
  const [selectedCategory, setSelectedCategory] = useState<string>('regular');
  const [prices, setPrices] = useState<Prices>({});
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [showSavedMessage, setShowSavedMessage] = useState<boolean>(false);

  // Initialize prices based on default values
  useEffect(() => {
    const initialPrices: Prices = {};
    hallData.seatCategories.forEach(category => {
      initialPrices[category.id] = category.defaultPrice;
    });
    setPrices(initialPrices);
  }, [hallData]);

  // Load hall data when hall selection changes
  useEffect(() => {
    setHallData(hallLayouts[selectedHall]);
    setSelectedSeats([]);
  }, [selectedHall]);

  // Get seat category based on position
  const getSeatCategory = (row: number, seat: number): string => {
    const specialSeat = hallData.specialSeats.find(
      s => s.row === row && s.seat === seat
    );
    return specialSeat ? specialSeat.category : 'regular';
  };

  // Handle seat click
  const handleSeatClick = (row: number, seat: number): void => {
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

  // Save price changes
  const handleSave = (): void => {
    console.log('Saving price configuration:', prices);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  // Reset selections
  const handleReset = (): void => {
    setSelectedSeats([]);
  };

  // Update price for a category
  const handlePriceChange = (categoryId: string, newPrice: number): void => {
    setPrices({
      ...prices,
      [categoryId]: newPrice
    });
  };

  // Assign selected category to selected seats
  const assignCategoryToSeats = (): void => {
    if (selectedSeats.length === 0) return;
    
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
          category: selectedCategory
        });
      }
    });
    
    setHallData({
      ...hallData,
      specialSeats: updatedSpecialSeats
    });
    
    setSelectedSeats([]);
  };

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
            <Tabs defaultValue={selectedHall} onValueChange={setSelectedHall}>
              <TabsList className="grid grid-cols-3 w-full">
                {Object.keys(hallLayouts).map(hallId => (
                  <TabsTrigger key={hallId} value={hallId}>
                    {hallLayouts[hallId].name}
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
              {/* Price Inputs */}
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
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Category Assignment */}
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
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={assignCategoryToSeats}
                  disabled={selectedSeats.length === 0}
                  variant="default"
                >
                  Apply to Selected Seats ({selectedSeats.length})
                </Button>
              </div>
              
              {/* Selection Mode Toggle */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Selection Mode</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="multi-select"
                    checked={isMultiSelectMode}
                    onCheckedChange={setIsMultiSelectMode}
                  />
                  <Label htmlFor="multi-select">
                    {isMultiSelectMode ? 'Multi-Select Mode' : 'Single Select Mode'}
                  </Label>
                </div>
              </div>
              
              {/* Save and Reset Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleSave}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <SaveIcon className="h-4 w-4" /> Save Configuration
                </Button>
                <Button
                  onClick={handleReset}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <UndoIcon className="h-4 w-4" /> Reset Selection
                </Button>
              </div>
              
              {/* Save Confirmation */}
              {showSavedMessage && (
                <Alert className="mt-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  <AlertDescription>
                    Configuration saved successfully!
                  </AlertDescription>
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
              {/* Screen */}
              <div className="mb-8 text-center">
                <div className="h-6 mx-auto w-4/5 rounded-t-3xl bg-gray-300 dark:bg-gray-600"></div>
                <p className="mt-1 text-sm text-center text-gray-500">SCREEN</p>
              </div>
              
              {/* Seat Layout Grid */}
              <div className="overflow-x-auto pb-4">
                <div className="inline-block min-w-full">
                  <div className="text-center mb-6">
                    {Array.from({ length: hallData.rows }).map((_, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center my-1 gap-1">
                        {/* Row Label */}
                        <div className="w-6 flex items-center justify-center text-sm">
                          {String.fromCharCode(65 + rowIndex)}
                        </div>
                        
                        {/* Seats */}
                        {Array.from({ length: hallData.seatsPerRow }).map((_, seatIndex) => {
                          const row: number = rowIndex + 1;
                          const seat: number = seatIndex + 1;
                          const category: string = getSeatCategory(row, seat);
                          const isSelected: boolean = selectedSeats.some(s => s.row === row && s.seat === seat);
                          const categoryData: SeatCategory = hallData.seatCategories.find(c => c.id === category)!;
                          
                          return (
                            <button
                              key={seatIndex}
                              onClick={() => handleSeatClick(row, seat)}
                              className={`
                                w-6 h-6 rounded-t-lg text-xs font-medium
                                transition-all duration-200 transform
                                ${isSelected ? 'ring-2 ring-white scale-110 z-10' : 'hover:scale-105'}
                                ${categoryData.color}
                                text-white
                              `}
                              title={`${String.fromCharCode(65 + rowIndex)}${seat} - ${categoryData.name} ($${prices[category]})`}
                            >
                              {seat}
                            </button>
                          );
                        })}
                        
                        {/* Row Label (right side) */}
                        <div className="w-6 flex items-center justify-center text-sm">
                          {String.fromCharCode(65 + rowIndex)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    {hallData.seatCategories.map((category: SeatCategory) => (
                      <div key={category.id} className="flex items-center">
                        <div className={`w-4 h-4 rounded ${category.color} mr-1`}></div>
                        <span className="text-sm">{category.name} (${prices[category.id]})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Selected Seats Info */}
              {selectedSeats.length > 0 && (
                <div className="mt-4 p-3 rounded bg-gray-100 dark:bg-gray-800">
                  <h3 className="font-medium mb-2">Selected Seats</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seat: SelectedSeat) => {
                      const category: SeatCategory = hallData.seatCategories.find(c => c.id === seat.category)!;
                      return (
                        <Badge 
                          key={seat.id} 
                          className={`${category.color} text-white`}
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