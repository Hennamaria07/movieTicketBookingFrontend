import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tab';
import { Badge } from '../../components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { Label } from '../../components/ui/Label';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { FaKey, FaTrash, FaTrashAlt, FaDatabase } from 'react-icons/fa';
import { MdError, MdToggleOn, MdToggleOff, MdAccessTime } from 'react-icons/md';
import { AiOutlineApi, AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { FiEdit, FiImage } from 'react-icons/fi';
import { BiUpload } from 'react-icons/bi';
import { BsPlug } from 'react-icons/bs';

// Updated Types
interface ApiKeyType {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

interface ApiLogType {
  id: string;
  name: string;
  status: 'success' | 'failure';
  lastUsed: string;
  endpoint: string;
}

interface IntegrationType {
  id: string;
  name: string;
  type: 'payment' | 'analytics' | 'communication';
  isEnabled: boolean;
  icon: string;
}

interface ImagePair {
  bannerImage: File | null;
  cardImage: File | null;
  bannerPreview: string | null;
  cardPreview: string | null;
}

interface UIConfigType {
  imagePairs: ImagePair[];
}

const AdminSettingsPage = () => {
  const { theme, setTheme } = useTheme();

  // Existing states
  const [apiKeys, setApiKeys] = useState<ApiKeyType[]>([
    { id: '1', name: 'Production API Key', key: 'pk_prod_*************', createdAt: '2024-12-15', lastUsed: '2025-03-02' },
    { id: '2', name: 'Development API Key', key: 'pk_dev_*************', createdAt: '2025-01-10', lastUsed: '2025-02-28' },
    { id: '3', name: 'Staging API Key', key: 'pk_stage_************', createdAt: '2025-02-01', lastUsed: null },
  ]);

  const [apiLogs, setApiLogs] = useState<ApiLogType[]>([
    { id: '1', name: 'Get Shows', status: 'success', lastUsed: '2025-03-02 14:32', endpoint: '/api/shows' },
    { id: '2', name: 'Update Booking', status: 'failure', lastUsed: '2025-03-01 09:15', endpoint: '/api/bookings/update' },
    { id: '3', name: 'User Authentication', status: 'success', lastUsed: '2025-03-02 10:22', endpoint: '/api/auth' },
    { id: '4', name: 'Payment Processing', status: 'success', lastUsed: '2025-03-01 18:45', endpoint: '/api/payments' },
    { id: '5', name: 'Email Notification', status: 'failure', lastUsed: '2025-02-28 16:30', endpoint: '/api/notifications' },
  ]);

  const [integrations, setIntegrations] = useState<IntegrationType[]>([
    { id: '1', name: 'Stripe', type: 'payment', isEnabled: true, icon: 'stripe.png' },
    { id: '2', name: 'PayPal', type: 'payment', isEnabled: false, icon: 'paypal.png' },
    { id: '3', name: 'Google Analytics', type: 'analytics', isEnabled: true, icon: 'ga.png' },
    { id: '4', name: 'Mixpanel', type: 'analytics', isEnabled: false, icon: 'mixpanel.png' },
    { id: '5', name: 'SendGrid', type: 'communication', isEnabled: true, icon: 'sendgrid.png' },
    { id: '6', name: 'Twilio', type: 'communication', isEnabled: true, icon: 'twilio.png' },
  ]);

  // Updated UI Config state for 3 pairs
  const [uiConfig, setUiConfig] = useState<UIConfigType>({
    imagePairs: [
      { bannerImage: null, cardImage: null, bannerPreview: null, cardPreview: null },
      { bannerImage: null, cardImage: null, bannerPreview: null, cardPreview: null },
      { bannerImage: null, cardImage: null, bannerPreview: null, cardPreview: null },
    ],
  });

  const [newKeyName, setNewKeyName] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // API key management
  const generateNewApiKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please provide a name for the API key");
      return;
    }
    const randomKey = `pk_${Math.random().toString(36).substring(2, 8)}_${Math.random().toString(36).substring(2, 15)}`;
    const newKey: ApiKeyType = {
      id: (apiKeys.length + 1).toString(),
      name: newKeyName,
      key: randomKey,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: null,
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    toast.success("New API key has been generated");
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast.success("API key has been deleted");
  };

  // Integration toggle
  const toggleIntegration = (id: string) => {
    setIntegrations(
      integrations.map(integration =>
        integration.id === id
          ? { ...integration, isEnabled: !integration.isEnabled }
          : integration
      )
    );
    const integration = integrations.find(i => i.id === id);
    if (integration) {
      toast.success(`${integration.name} has been ${integration.isEnabled ? 'disabled' : 'enabled'}`);
    }
  };

  // Updated Image upload handlers for pairs
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'card', index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImagePairs = [...uiConfig.imagePairs];
      if (type === 'banner') {
        newImagePairs[index] = {
          ...newImagePairs[index],
          bannerImage: file,
          bannerPreview: reader.result as string,
        };
      } else {
        newImagePairs[index] = {
          ...newImagePairs[index],
          cardImage: file,
          cardPreview: reader.result as string,
        };
      }
      setUiConfig({ imagePairs: newImagePairs });
    };
    reader.readAsDataURL(file);
  };

  const deleteImage = (type: 'banner' | 'card', index: number) => {
    const newImagePairs = [...uiConfig.imagePairs];
    if (type === 'banner') {
      newImagePairs[index] = { ...newImagePairs[index], bannerImage: null, bannerPreview: null };
    } else {
      newImagePairs[index] = { ...newImagePairs[index], cardImage: null, cardPreview: null };
    }
    setUiConfig({ imagePairs: newImagePairs });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Validation for image pairs (each pair must have both or neither)
  const isImageConfigValid = uiConfig.imagePairs.every(
    pair => (pair.bannerImage && pair.cardImage) || (!pair.bannerImage && !pair.cardImage)
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Settings & Configurations</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10"
        >
          {theme === 'dark' ? <span className="text-yellow-500">☀️</span> : <span className="text-blue-500">🌙</span>}
        </Button>
      </motion.div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid grid-cols-1 sm:grid-cols-3 mb-4 sm:mb-6 gap-2 sm:gap-0">
          <TabsTrigger value="api" className="text-xs sm:text-sm">API Management</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs sm:text-sm">Integrations</TabsTrigger>
          <TabsTrigger value="ui" className="text-xs sm:text-sm">UI Configurations</TabsTrigger>
        </TabsList>

        {/* API MANAGEMENT TAB - Unchanged */}
        <TabsContent value="api">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
            <motion.div variants={itemVariants} className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Active APIs</CardTitle>
                  <AiOutlineApi className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{apiKeys.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Failed API Calls</CardTitle>
                  <MdError className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{apiLogs.filter(log => log.status === 'failure').length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Successful API Calls</CardTitle>
                  <AiOutlineCheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{apiLogs.filter(log => log.status === 'success').length}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <FaKey className="mr-2 h-4 sm:h-5 w-4 sm:w-5" /> API Key Management
                    </CardTitle>
                    <Collapsible open={expandedSection === 'apiKeys'} onOpenChange={() => toggleSection('apiKeys')}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">{expandedSection === 'apiKeys' ? 'Hide' : 'Show'}</Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">Generate and manage API keys</CardDescription>
                </CardHeader>
                <Collapsible open={expandedSection === 'apiKeys'} className="w-full">
                  <CollapsibleContent>
                    <CardContent>
                      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Input
                          placeholder="API Key Name"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          className="flex-1 text-sm"
                        />
                        <Button onClick={generateNewApiKey} className="w-full sm:w-auto text-sm">Generate New Key</Button>
                      </div>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs sm:text-sm w-[100px] sm:w-[200px]">Name</TableHead>
                              <TableHead className="text-xs sm:text-sm">API Key</TableHead>
                              <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Created</TableHead>
                              <TableHead className="text-xs sm:text-sm hidden md:table-cell">Last Used</TableHead>
                              <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {apiKeys.map((apiKey) => (
                              <TableRow key={apiKey.id}>
                                <TableCell className="font-medium text-xs sm:text-sm">{apiKey.name}</TableCell>
                                <TableCell className="text-xs sm:text-sm font-mono">{apiKey.key}</TableCell>
                                <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{apiKey.createdAt}</TableCell>
                                <TableCell className="text-xs sm:text-sm hidden md:table-cell">{apiKey.lastUsed || 'Never'}</TableCell>
                                <TableCell>
                                  <Button variant="destructive" size="sm" onClick={() => deleteApiKey(apiKey.id)}>
                                    <FaTrash className="h-3 sm:h-4 w-3 sm:w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg">API Logs</CardTitle>
                    <Collapsible open={expandedSection === 'apiLogs'} onOpenChange={() => toggleSection('apiLogs')}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">{expandedSection === 'apiLogs' ? 'Hide' : 'Show'}</Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">Recent API activities</CardDescription>
                </CardHeader>
                <Collapsible open={expandedSection === 'apiLogs'} className="w-full">
                  <CollapsibleContent>
                    <CardContent>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs sm:text-sm w-[100px] sm:w-[200px]">
                                <div className="flex items-center">
                                  <FaDatabase className="mr-2 h-3 sm:h-4 w-3 sm:w-4" /> API Name
                                </div>
                              </TableHead>
                              <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Endpoint</TableHead>
                              <TableHead className="text-xs sm:text-sm">Status</TableHead>
                              <TableHead className="text-xs sm:text-sm">
                                <div className="flex items-center">
                                  <MdAccessTime className="mr-2 h-3 sm:h-4 w-3 sm:w-4" /> Last Used
                                </div>
                              </TableHead>
                              <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {apiLogs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="font-medium text-xs sm:text-sm">{log.name}</TableCell>
                                <TableCell className="text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">{log.endpoint}</TableCell>
                                <TableCell className="text-xs sm:text-sm">
                                  {log.status === 'success' ? (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                      <AiOutlineCheckCircle className="mr-1 h-3 sm:h-4 w-3 sm:w-4" /> Success
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive">
                                      <AiOutlineCloseCircle className="mr-1 h-3 sm:h-4 w-3 sm:w-4" /> Failed
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm">{log.lastUsed}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                      <FiEdit className="h-3 sm:h-4 w-3 sm:w-4" />
                                    </Button>
                                    <Button variant="destructive" size="sm">
                                      <FaTrash className="h-3 sm:h-4 w-3 sm:w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* THIRD-PARTY INTEGRATIONS TAB - Unchanged */}
        <TabsContent value="integrations">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <BsPlug className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                    <CardTitle className="text-base sm:text-lg">Connected Integrations</CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">Manage third-party services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {integrations.map((integration) => (
                      <motion.div
                        key={integration.id}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-lg border p-4 shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                          <div className="flex items-center">
                            <div className="rounded-md bg-primary/10 p-2">
                              <div className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <p className="text-sm font-medium">{integration.name}</p>
                              <p className="text-xs text-muted-foreground">{integration.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={integration.isEnabled}
                              onCheckedChange={() => toggleIntegration(integration.id)}
                              aria-label={`Toggle ${integration.name}`}
                            />
                            {integration.isEnabled ? (
                              <MdToggleOn className="h-4 sm:h-5 w-4 sm:w-5 text-green-500" />
                            ) : (
                              <MdToggleOff className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">Configure</Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full sm:w-auto text-sm">
                    <BsPlug className="mr-2 h-4 w-4" /> Connect New Integration
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* UI CONFIGURATIONS TAB - Updated for 3 pairs */}
        <TabsContent value="ui">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <FiImage className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                    <CardTitle className="text-base sm:text-lg">Photo Management</CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">Manage banner and card image pairs (up to 3 sets)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {uiConfig.imagePairs.map((pair, index) => (
                      <div key={index} className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                        {/* Banner Image Upload */}
                        <div className="space-y-2 sm:space-y-4">
                          <Label className="text-sm">{`Cover Image ${index + 1}`}</Label>
                          <div className="flex items-center justify-center w-full">
                            <Label
                              htmlFor={`banner-upload-${index}`}
                              className="flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600"
                            >
                              {pair.bannerPreview ? (
                                <div className="relative w-full h-full">
                                  <img src={pair.bannerPreview} alt={`Banner preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => deleteImage('banner', index)}
                                  >
                                    <FaTrashAlt className="h-3 sm:h-4 w-3 sm:w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-4 sm:pt-5 pb-5 sm:pb-6">
                                  <BiUpload className="w-6 sm:w-8 h-6 sm:h-8 mb-3 sm:mb-4 text-gray-500 dark:text-gray-400" />
                                  <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 1MB)</p>
                                </div>
                              )}
                              <input
                                id={`banner-upload-${index}`}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'banner', index)}
                              />
                            </Label>
                          </div>
                        </div>

                        {/* Card Image Upload */}
                        <div className="space-y-2 sm:space-y-4">
                          <Label className="text-sm">{`Card Image ${index + 1}`}</Label>
                          <div className="flex items-center justify-center w-full">
                            <Label
                              htmlFor={`card-upload-${index}`}
                              className="flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600"
                            >
                              {pair.cardPreview ? (
                                <div className="relative w-full h-full">
                                  <img src={pair.cardPreview} alt={`Card preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => deleteImage('card', index)}
                                  >
                                    <FaTrashAlt className="h-3 sm:h-4 w-3 sm:w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-4 sm:pt-5 pb-5 sm:pb-6">
                                  <BiUpload className="w-6 sm:w-8 h-6 sm:h-8 mb-3 sm:mb-4 text-gray-500 dark:text-gray-400" />
                                  <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 1MB)</p>
                                </div>
                              )}
                              <input
                                id={`card-upload-${index}`}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'card', index)}
                              />
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isImageConfigValid && (
                    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-md">
                      <p className="text-xs sm:text-sm">
                        <strong>Validation Error:</strong> Each image pair must have both a cover and card image, or neither.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button disabled={!isImageConfigValid} className="w-full text-sm">Save UI Configuration</Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettingsPage;