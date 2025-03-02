import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { MdLocalOffer } from 'react-icons/md';
import { FaRegClock } from 'react-icons/fa';
import { AiOutlineEdit } from 'react-icons/ai';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FaCalendarAlt, FaPlus, FaTag, FaTrophy, FaCreditCard, FaUsers, FaReceipt } from 'react-icons/fa';

// Define TypeScript interfaces
interface Offer {
  id: string;
  title: string;
  category: OfferCategory;
  discount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  applicableMovies: string[];
}

interface Movie {
  id: string;
  title: string;
}

type OfferCategory = 'Flash Deals' | 'Loyalty Rewards' | 'Payment Offers' | 'Group Discounts' | 'Subscriptions';

interface CategoryIcon {
  [key: string]: JSX.Element;
}

const OffersManagementPage: React.FC = () => {
  const categoryIcons: CategoryIcon = {
    'Flash Deals': <FaTag className="mr-2 h-4 w-4" />,
    'Loyalty Rewards': <FaTrophy className="mr-2 h-4 w-4" />,
    'Payment Offers': <FaCreditCard className="mr-2 h-4 w-4" />,
    'Group Discounts': <FaUsers className="mr-2 h-4 w-4" />,
    'Subscriptions': <FaReceipt className="mr-2 h-4 w-4" />
  };

  // Sample data
  const [offers, setOffers] = useState<Offer[]>([
    { id: 'OFF-001', title: 'Buy 1 Get 1 Free', category: 'Flash Deals', discount: 50, startDate: '2025-02-01', endDate: '2025-04-30', status: 'active', applicableMovies: ['MOV-001', 'MOV-002'] },
    { id: 'OFF-002', title: 'Weekend Special', category: 'Group Discounts', discount: 25, startDate: '2025-02-15', endDate: '2025-03-15', status: 'active', applicableMovies: ['MOV-003'] },
    { id: 'OFF-003', title: 'Holiday Discount', category: 'Flash Deals', discount: 20, startDate: '2024-12-20', endDate: '2025-01-05', status: 'expired', applicableMovies: ['MOV-001', 'MOV-002', 'MOV-004'] },
    { id: 'OFF-004', title: 'Premium Member Discount', category: 'Loyalty Rewards', discount: 15, startDate: '2025-01-01', endDate: '2025-12-31', status: 'active', applicableMovies: ['MOV-001', 'MOV-002', 'MOV-003', 'MOV-004'] },
    { id: 'OFF-005', title: 'Credit Card Cashback', category: 'Payment Offers', discount: 10, startDate: '2025-02-01', endDate: '2025-05-31', status: 'active', applicableMovies: ['MOV-002', 'MOV-003'] },
    { id: 'OFF-006', title: 'Annual Movie Pass', category: 'Subscriptions', discount: 30, startDate: '2025-01-01', endDate: '2025-12-31', status: 'active', applicableMovies: ['MOV-001', 'MOV-002', 'MOV-003', 'MOV-004'] },
  ]);

  const [movies] = useState<Movie[]>([
    { id: 'MOV-001', title: 'The Great Adventure' },
    { id: 'MOV-002', title: 'Mystery Lane' },
    { id: 'MOV-003', title: 'Cosmic Journey' },
    { id: 'MOV-004', title: 'The Last Chapter' },
  ]);

  const categories: OfferCategory[] = [
    'Flash Deals',
    'Loyalty Rewards',
    'Payment Offers',
    'Group Discounts',
    'Subscriptions'
  ];

  const [isNewOfferDialogOpen, setIsNewOfferDialogOpen] = useState(false);
  const [isEditOfferDialogOpen, setIsEditOfferDialogOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    title: '',
    category: 'Flash Deals',
    discount: 0,
    startDate: '',
    endDate: '',
    status: 'active',
    applicableMovies: []
  });
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);

  // Filter offers by status
  const activeOffers = offers.filter(offer => offer.status === 'active');
  const expiredOffers = offers.filter(offer => offer.status === 'expired');

  // Handler functions
  const handleCreateOffer = () => {
    if (newOffer.title && newOffer.category && newOffer.discount && newOffer.startDate && newOffer.endDate && selectedMovies.length > 0) {
      const offerToAdd: Offer = {
        id: `OFF-${offers.length + 1}`.padStart(7, '0'),
        title: newOffer.title,
        category: newOffer.category as OfferCategory,
        discount: newOffer.discount as number,
        startDate: newOffer.startDate,
        endDate: newOffer.endDate,
        status: newOffer.status as 'active' | 'inactive' | 'expired',
        applicableMovies: selectedMovies
      };
      
      setOffers([...offers, offerToAdd]);
      setNewOffer({
        title: '',
        category: 'Flash Deals',
        discount: 0,
        startDate: '',
        endDate: '',
        status: 'active',
        applicableMovies: []
      });
      setSelectedMovies([]);
      setIsNewOfferDialogOpen(false);
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setCurrentOffer(offer);
    setSelectedMovies(offer.applicableMovies);
    setIsEditOfferDialogOpen(true);
  };

  const handleUpdateOffer = () => {
    if (currentOffer) {
      const updatedOffers = offers.map(offer => 
        offer.id === currentOffer.id ? { ...currentOffer, applicableMovies: selectedMovies } : offer
      );
      setOffers(updatedOffers);
      setIsEditOfferDialogOpen(false);
    }
  };

  const handleDeleteOffer = (id: string) => {
    setOffers(offers.filter(offer => offer.id !== id));
  };

  const handleExtendValidity = (id: string) => {
    const updatedOffers = offers.map(offer => {
      if (offer.id === id) {
        const currentEndDate = new Date(offer.endDate);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(currentEndDate.getDate() + 30);
        
        return {
          ...offer,
          endDate: newEndDate.toISOString().split('T')[0],
          status: 'active' as const
        };
      }
      return offer;
    });
    
    setOffers(updatedOffers);
  };

  // Helper function to format dates
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get category badge color
  const getCategoryColor = (category: OfferCategory): string => {
    const colors = {
      'Flash Deals': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Loyalty Rewards': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Payment Offers': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Group Discounts': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Subscriptions': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Offer Card Component for Mobile
  const OfferCard = ({ offer }: { offer: Offer }) => (
    <Card className="w-full mb-4 p-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-slate-900 dark:text-white text-sm">{offer.title}</h3>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            offer.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <p><span className="font-medium">ID:</span> {offer.id}</p>
          <p><span className="font-medium">Category:</span> {offer.category}</p>
          <p><span className="font-medium">Discount:</span> {offer.discount}%</p>
          <p><span className="font-medium">Validity:</span> {formatDate(offer.startDate)} - {formatDate(offer.endDate)}</p>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleEditOffer(offer)}
            className="p-1"
          >
            <AiOutlineEdit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDeleteOffer(offer.id)}
            className="p-1 text-red-500 hover:text-red-600"
          >
            <RiDeleteBin6Line className="h-4 w-4" />
          </Button>
          {offer.status === 'expired' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleExtendValidity(offer.id)}
              className="p-1 text-blue-500 hover:text-blue-600"
            >
              <FaCalendarAlt className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  // Offer Table Component for Desktop
  const OffersTable = ({ offers }: { offers: Offer[] }) => (
    <>
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
        {offers.length === 0 && (
          <p className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">No offers found</p>
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-zinc-950 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Offer ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Category</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Discount (%)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Validity Period</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {offers.length > 0 ? (
                offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{offer.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{offer.title}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(offer.category)}`}>
                        {categoryIcons[offer.category]}
                        {offer.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-slate-500 dark:text-slate-400">{offer.discount}%</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        offer.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditOffer(offer)}
                      >
                        <AiOutlineEdit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <RiDeleteBin6Line className="h-4 w-4" />
                      </Button>
                      {offer.status === 'expired' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleExtendValidity(offer.id)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <FaCalendarAlt className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No offers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // Render the main component
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl">Offers Management</CardTitle>
            <CardDescription className="text-sm">Create and manage special offers and discounts</CardDescription>
          </div>
          <Button onClick={() => setIsNewOfferDialogOpen(true)} className="w-full sm:w-auto">
            <FaPlus className="mr-2 h-4 w-4" />
            New Offer
          </Button>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="active" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 gap-2 sm:w-[400px]">
          <TabsTrigger value="active" className="flex items-center text-sm">
            <MdLocalOffer className="mr-2 h-4 w-4" />
            Active Offers
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center text-sm">
            <FaRegClock className="mr-2 h-4 w-4" />
            Expired Offers
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Offers</CardTitle>
              <CardDescription className="text-sm">
                Currently active special offers and discounts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <OffersTable offers={activeOffers} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expired" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expired Offers</CardTitle>
              <CardDescription className="text-sm">
                Past offers that are no longer active
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <OffersTable offers={expiredOffers} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Offer Dialog */}
      <Dialog open={isNewOfferDialogOpen} onOpenChange={setIsNewOfferDialogOpen}>
        <DialogContent className="w-full max-w-[90vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Create New Offer</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new promotional offer to attract more customers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title" className="text-sm">Offer Title</Label>
                <Input
                  id="title"
                  value={newOffer.title || ''}
                  onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                  placeholder="e.g., Weekend Special"
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="category" className="text-sm">Offer Category</Label>
                <Select 
                  value={newOffer.category}
                  onValueChange={(value) => setNewOffer({...newOffer, category: value as OfferCategory})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center">
                          {categoryIcons[category]}
                          <span>{category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="discount" className="text-sm">Discount Percentage</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={newOffer.discount || 0}
                  onChange={(e) => setNewOffer({...newOffer, discount: parseInt(e.target.value, 10) || 0})}
                  placeholder="e.g., 25"
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newOffer.startDate || ''}
                    onChange={(e) => setNewOffer({...newOffer, startDate: e.target.value})}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newOffer.endDate || ''}
                    onChange={(e) => setNewOffer({...newOffer, endDate: e.target.value})}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="movies" className="text-sm">Applicable Movies</Label>
                <Select 
                  onValueChange={(value) => {
                    if (!selectedMovies.includes(value)) {
                      setSelectedMovies([...selectedMovies, value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a movie" />
                  </SelectTrigger>
                  <SelectContent>
                    {movies.map(movie => (
                      <SelectItem key={movie.id} value={movie.id}>
                        {movie.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="mt-2">
                  {selectedMovies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedMovies.map(movieId => {
                        const movie = movies.find(m => m.id === movieId);
                        return movie ? (
                          <div key={movieId} className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                            <span>{movie.title}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 ml-1"
                              onClick={() => setSelectedMovies(selectedMovies.filter(id => id !== movieId))}
                            >
                              <RiDeleteBin6Line className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Label htmlFor="status" className="text-sm">Active Status</Label>
                <Switch 
                  id="status" 
                  checked={newOffer.status === 'active'}
                  onCheckedChange={(checked) => 
                    setNewOffer({...newOffer, status: checked ? 'active' : 'inactive'})
                  }
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsNewOfferDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleCreateOffer} className="w-full sm:w-auto">Create Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Offer Dialog */}
      <Dialog open={isEditOfferDialogOpen} onOpenChange={setIsEditOfferDialogOpen}>
        <DialogContent className="w-full max-w-[90vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Offer</DialogTitle>
            <DialogDescription className="text-sm">
              Make changes to the existing offer.
            </DialogDescription>
          </DialogHeader>
          
          {currentOffer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="edit-title" className="text-sm">Offer Title</Label>
                  <Input
                    id="edit-title"
                    value={currentOffer.title}
                    onChange={(e) => setCurrentOffer({...currentOffer, title: e.target.value})}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-category" className="text-sm">Offer Category</Label>
                  <Select 
                    value={currentOffer.category}
                    onValueChange={(value) => setCurrentOffer({...currentOffer, category: value as OfferCategory})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center">
                            {categoryIcons[category]}
                            <span>{category}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-discount" className="text-sm">Discount Percentage</Label>
                  <Input
                    id="edit-discount"
                    type="number"
                    min="0"
                    max="100"
                    value={currentOffer.discount}
                    onChange={(e) => setCurrentOffer({...currentOffer, discount: parseInt(e.target.value, 10) || 0})}
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-startDate" className="text-sm">Start Date</Label>
                    <Input
                      id="edit-startDate"
                      type="date"
                      value={currentOffer.startDate}
                      onChange={(e) => setCurrentOffer({...currentOffer, startDate: e.target.value})}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-endDate" className="text-sm">End Date</Label>
                    <Input
                      id="edit-endDate"
                      type="date"
                      value={currentOffer.endDate}
                      onChange={(e) => setCurrentOffer({...currentOffer, endDate: e.target.value})}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-movies" className="text-sm">Applicable Movies</Label>
                  <Select 
                    onValueChange={(value) => {
                      if (!selectedMovies.includes(value)) {
                        setSelectedMovies([...selectedMovies, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a movie" />
                    </SelectTrigger>
                    <SelectContent>
                      {movies.map(movie => (
                        <SelectItem key={movie.id} value={movie.id}>
                          {movie.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-2">
                    {selectedMovies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedMovies.map(movieId => {
                          const movie = movies.find(m => m.id === movieId);
                          return movie ? (
                            <div key={movieId} className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                              <span>{movie.title}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 ml-1"
                                onClick={() => setSelectedMovies(selectedMovies.filter(id => id !== movieId))}
                              >
                                <RiDeleteBin6Line className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="edit-status" className="text-sm">Active Status</Label>
                  <Switch 
                    id="edit-status" 
                    checked={currentOffer.status === 'active'}
                    onCheckedChange={(checked) => 
                      setCurrentOffer({...currentOffer, status: checked ? 'active' : 'inactive'})
                    }
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEditOfferDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleUpdateOffer} className="w-full sm:w-auto">Update Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OffersManagementPage;