import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUserTie, FaMoneyBillWave, FaSort, FaSortUp, FaSortDown, 
  FaTicketAlt, FaFilm, FaSearch, FaFilter
} from "react-icons/fa";
import { HiIdentification } from "react-icons/hi";
import { MdEmail, MdStarRate } from "react-icons/md";
import { FiPhone, FiCopy, FiEdit, FiTrash2, FiX, FiPlus } from "react-icons/fi";
import { IoCheckmarkCircle, IoChevronDownOutline, IoCloseCircle } from "react-icons/io5";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/Label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Types
interface TheaterOwner {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  password: string;
  assignedTheaters: string[];
  status: "Active" | "Pending Approval";
  image?: string;
}

interface PendingTheater {
  id: string;
  name: string;
  location: string;
  ownerId: string;
  requestedDate: string;
}

interface PerformanceData {
  month: string;
  revenue: number;
  ratings: number;
}

// Mock Data
const mockOwners: TheaterOwner[] = [
  { id: "1", name: "John Doe", employeeId: "EMP001", email: "john@example.com", phone: "123-456-7890", password: "X7kP!m9q", assignedTheaters: ["Grand Cinema"], status: "Active", image: "" },
  { id: "2", name: "Jane Smith", employeeId: "EMP002", email: "jane@example.com", phone: "234-567-8901", password: "L9pQ#n2v", assignedTheaters: ["Skyview IMAX"], status: "Pending Approval", image: "" },
];

const mockPendingTheaters: PendingTheater[] = [
  { id: "1", name: "Starlight Theater", location: "Downtown", ownerId: "2", requestedDate: "2025-02-20" },
];

const mockPerformanceData: PerformanceData[] = [
  { month: "Jan", revenue: 50000, ratings: 4.5 },
  { month: "Feb", revenue: 60000, ratings: 4.7 },
  { month: "Mar", revenue: 75000, ratings: 4.8 },
];

// AnimatedCounter Component
const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string; decimals?: number }> = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1.5;
    const incrementTime = (duration / end) * 1000;

    const timer = setInterval(() => {
      start += Math.ceil(end / (duration * 100));
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>;
};

// TheaterManagementPage Component
const TheaterManagementPage: React.FC = () => {
  const [owners, setOwners] = useState<TheaterOwner[]>(mockOwners);
  const [pendingTheaters, setPendingTheaters] = useState<PendingTheater[]>(mockPendingTheaters);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Pending Approval">("All");
  const [sortConfig, setSortConfig] = useState<{ key: keyof TheaterOwner | null; direction: "ascending" | "descending" }>({ key: null, direction: "ascending" });
  const [formData, setFormData] = useState({ name: "", employeeId: "", email: "", phone: "", password: "", image: "" });
  const [editOwner, setEditOwner] = useState<TheaterOwner | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTheaterId, setSelectedTheaterId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Password Auto-Generation
  const generatePassword = (employeeId: string) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const base = employeeId.slice(-3);
    let password = base;
    for (let i = 0; i < 7; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleEmployeeIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const employeeId = e.target.value;
    setFormData({ ...formData, employeeId, password: employeeId ? generatePassword(employeeId) : "" });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formData.password);
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editOwner) {
      setOwners(owners.map(owner => owner.id === editOwner.id ? { ...formData, id: owner.id, assignedTheaters: owner.assignedTheaters, status: owner.status } : owner));
      setEditOwner(null);
    } else {
      setOwners([...owners, { ...formData, id: `${owners.length + 1}`, assignedTheaters: [], status: "Pending Approval" }]);
    }
    setFormData({ name: "", employeeId: "", email: "", phone: "", password: "", image: "" });
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({ name: "", employeeId: "", email: "", phone: "", password: "", image: "" });
    setEditOwner(null);
    setIsModalOpen(false);
  };

  const handleAddOwner = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Sorting
  const sortedOwners = useMemo(() => {
    let sortableOwners = [...owners];
    if (sortConfig.key) {
      sortableOwners.sort((a, b) => {
        const key = sortConfig.key as keyof TheaterOwner;
        const aValue = a[key];
        const bValue = b[key];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return sortableOwners.filter(owner => 
      (owner.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       owner.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "All" || owner.status === statusFilter)
    );
  }, [owners, searchTerm, statusFilter, sortConfig]);

  const requestSort = (key: keyof TheaterOwner) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") direction = "descending";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof TheaterOwner) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1" />;
    return sortConfig.direction === "ascending" ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
  };

  // Actions
  const handleEdit = (owner: TheaterOwner) => {
    setEditOwner(owner);
    setFormData({ name: owner.name, employeeId: owner.employeeId, email: owner.email, phone: owner.phone, password: owner.password, image: owner.image || "" });
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedOwnerId) {
      setOwners(owners.filter(owner => owner.id !== selectedOwnerId));
      setDeleteDialogOpen(false);
      setSelectedOwnerId(null);
    }
  };

  const handleApproveTheater = () => {
    if (selectedTheaterId) {
      const theater = pendingTheaters.find(t => t.id === selectedTheaterId);
      if (theater) {
        setOwners(owners.map(owner => 
          owner.id === theater.ownerId ? { ...owner, assignedTheaters: [...owner.assignedTheaters, theater.name], status: "Active" } : owner
        ));
        setPendingTheaters(pendingTheaters.filter(t => t.id !== selectedTheaterId));
        setApproveDialogOpen(false);
        setSelectedTheaterId(null);
      }
    }
  };

  const handleRejectTheater = () => {
    if (selectedTheaterId) {
      setPendingTheaters(pendingTheaters.filter(t => t.id !== selectedTheaterId));
      setRejectDialogOpen(false);
      setSelectedTheaterId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
          Theater Management Dashboard
        </motion.div>

        {/* Add Theater Owner Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleAddOwner}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
          >
            <FiPlus className="mr-2 h-4 w-4" /> Add Theater Owner
          </Button>
        </motion.div>

        {/* List of Theater Owners */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Theater Owners</CardTitle>
            <CardDescription className="text-sm">Manage existing theater owners</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search owners..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <FaFilter className="mr-2 h-4 w-4" /> Status: {statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("All")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Pending Approval")}>Pending Approval</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="md:hidden space-y-4">
              {sortedOwners.map((owner) => (
                <motion.div key={owner.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm">{owner.name}</h3>
                        <Badge className={owner.status === "Active" ? "bg-green-500" : "bg-yellow-500"}>{owner.status}</Badge>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        <p><span className="font-medium">Email:</span> {owner.email}</p>
                        <p><span className="font-medium">ID:</span> {owner.employeeId}</p>
                        <p><span className="font-medium">Theaters:</span> {owner.assignedTheaters.join(", ") || "None"}</p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(owner)}><FiEdit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedOwnerId(owner.id); setDeleteDialogOpen(true); }}><FiTrash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-zinc-950 border-b">
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort("name")}>
                      <div className="flex items-center">Name {getSortIcon("name")}</div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort("email")}>
                      <div className="flex items-center">Email {getSortIcon("email")}</div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Employee ID</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Assigned Theaters</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {sortedOwners.map((owner) => (
                      <motion.tr
                        key={owner.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border-b hover:bg-muted/50"
                      >
                        <TableCell className="px-4 py-3 font-medium">{owner.name}</TableCell>
                        <TableCell className="px-4 py-3">{owner.email}</TableCell>
                        <TableCell className="px-4 py-3">{owner.employeeId}</TableCell>
                        <TableCell className="px-4 py-3">{owner.assignedTheaters.join(", ") || "None"}</TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge className={owner.status === "Active" ? "bg-green-500" : "bg-yellow-500"}>{owner.status}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(owner)}><FiEdit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedOwnerId(owner.id); setDeleteDialogOpen(true); }}><FiTrash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Approve New Theaters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Approve New Theaters</CardTitle>
            <CardDescription className="text-sm">Review and approve pending theater requests</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {pendingTheaters.map((theater) => (
              <Collapsible key={theater.id} className="mb-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-t-lg">
                  <span className="font-medium text-sm sm:text-base">{theater.name}</span>
                  <IoChevronDownOutline className="h-5 w-5" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-b-lg">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Location:</span> {theater.location}</p>
                    <p><span className="font-medium">Owner:</span> {owners.find(o => o.id === theater.ownerId)?.name || "Unknown"}</p>
                    <p><span className="font-medium">Requested Date:</span> {theater.requestedDate}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button 
                      onClick={() => { setSelectedTheaterId(theater.id); setApproveDialogOpen(true); }} 
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                    >
                      <IoCheckmarkCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button 
                      onClick={() => { setSelectedTheaterId(theater.id); setRejectDialogOpen(true); }} 
                      variant="destructive" 
                      className="w-full sm:w-auto"
                    >
                      <IoCloseCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
            {pendingTheaters.length === 0 && <p className="text-sm text-center text-muted-foreground">No pending theaters</p>}
          </CardContent>
        </Card>

        {/* Audit Theater Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Theater Performance</CardTitle>
            <CardDescription className="text-sm">Overview of theater metrics</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Total Theaters</p>
                        <p className="text-xl sm:text-2xl font-bold">
                          <AnimatedCounter value={owners.reduce((acc, owner) => acc + owner.assignedTheaters.length, 0)} />
                        </p>
                      </div>
                      <FaFilm className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Average Ratings</p>
                        <p className="text-xl sm:text-2xl font-bold">
                          <AnimatedCounter value={mockPerformanceData.reduce((acc, data) => acc + data.ratings, 0) / mockPerformanceData.length} decimals={1} />
                        </p>
                      </div>
                      <MdStarRate className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Revenue Summary</p>
                        <p className="text-xl sm:text-2xl font-bold">
                          $<AnimatedCounter value={mockPerformanceData.reduce((acc, data) => acc + data.revenue, 0)} />
                        </p>
                      </div>
                      <FaMoneyBillWave className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Top Theater</p>
                        <p className="text-xl sm:text-2xl font-bold">Grand Cinema</p>
                      </div>
                      <FaTicketAlt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Revenue Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.1} />
                          <XAxis dataKey="month" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Ratings Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.1} />
                          <XAxis dataKey="month" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="ratings" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
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
                    {editOwner ? "Edit Theater Owner" : "Add New Theater Owner"}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    <FiX className="h-5 w-5" />
                  </Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Full Name</Label>
                      <div className="relative mt-1">
                        <FaUserTie className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="pl-10" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="employeeId" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Employee ID</Label>
                      <div className="relative mt-1">
                        <HiIdentification className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input id="employeeId" value={formData.employeeId} onChange={handleEmployeeIdChange} className="pl-10" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email Address</Label>
                      <div className="relative mt-1">
                        <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="pl-10" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Phone Number</Label>
                      <div className="relative mt-1">
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="pl-10" required />
                      </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Password</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input id="password" value={formData.password} readOnly className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                        <Button type="button" variant="outline" onClick={copyToClipboard} className="h-10 w-10 p-0">
                          <FiCopy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label htmlFor="image" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Profile Image</Label>
                      <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                      {formData.image && (
                        <img src={formData.image} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                    >
                      {editOwner ? "Update" : "Add"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dialogs */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="w-[90vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Delete Owner</DialogTitle>
              <DialogDescription className="text-sm">Are you sure you want to delete this theater owner?</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto">Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent className="w-[90vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Approve Theater</DialogTitle>
              <DialogDescription className="text-sm">Are you sure you want to approve this theater?</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleApproveTheater} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">Approve</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="w-[90vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Reject Theater</DialogTitle>
              <DialogDescription className="text-sm">Are you sure you want to reject this theater?</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button variant="destructive" onClick={handleRejectTheater} className="w-full sm:w-auto">Reject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TheaterManagementPage;